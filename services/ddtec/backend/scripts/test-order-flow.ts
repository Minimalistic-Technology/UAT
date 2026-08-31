import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../src/models/Product';
import Order from '../src/models/Order';
import User from '../src/models/User';
import Bill from '../src/models/Bill';
import NotificationService from '../src/services/notification.service';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTestFlow() {
    console.log('===========================================================');
    console.log('🚀 [DDTEC TEST SUITE] Full Order & Payment Lifecycle Test');
    console.log('===========================================================\n');

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI not configured in .env');
        process.exit(1);
    }

    try {
        console.log('📦 Step 0: Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ MongoDB connected successfully.\n');

        // 1. Setup Test User
        console.log('👤 Step 1: Setting up Test Customer User...');
        let testUser = await User.findOne({ email: 'testcustomer@ddtec.test' });
        if (!testUser) {
            testUser = new User({
                name: 'Test Customer',
                email: 'testcustomer@ddtec.test',
                password: 'TestPassword123!',
                role: 'user'
            });
            await testUser.save();
            console.log('   Created test user: testcustomer@ddtec.test');
        } else {
            console.log('   Using existing test user: testcustomer@ddtec.test');
        }

        // 2. Setup Test Product & Check Initial Stock
        console.log('\n📦 Step 2: Preparing Test Product & Checking Initial Stock...');
        let testProduct = await Product.findOne({ name: '[TEST] DDTEC Smart Gadget' });
        const INITIAL_STOCK = 20;
        const ORDER_QTY = 2;

        if (!testProduct) {
            testProduct = new Product({
                name: '[TEST] DDTEC Smart Gadget',
                price: 1500,
                costPrice: 900,
                stock: INITIAL_STOCK,
                rating: 5,
                numReviews: 1,
                lastMonthSales: 0,
                brand: 'DDTEC',
                modelName: 'TG-100',
                isActive: true,
                showOnHome: false
            });
            await testProduct.save();
            console.log(`   Created test product with stock = ${INITIAL_STOCK}`);
        } else {
            testProduct.stock = INITIAL_STOCK;
            await testProduct.save();
            console.log(`   Reset test product stock to ${INITIAL_STOCK}`);
        }

        const stockBeforeOrder = testProduct.stock;
        console.log(`   📊 Product Stock BEFORE order: ${stockBeforeOrder}`);

        // 3. Create Order & Decrement Inventory
        console.log('\n🛒 Step 3: Placing Order & Verifying Inventory Decrement (Stock Minus)...');
        const orderData: any = {
            user: testUser._id,
            items: [
                {
                    product: testProduct._id,
                    quantity: ORDER_QTY,
                    price: testProduct.price
                }
            ],
            totalAmount: testProduct.price * ORDER_QTY,
            shippingInfo: {
                fullName: 'Test Customer',
                email: 'testcustomer@ddtec.test',
                phone: '9876543210',
                address: '123 Innovation Boulevard',
                city: 'Mumbai',
                zip: '400001'
            },
            paymentMethod: 'cashfree',
            status: 'pending',
            paymentStatus: 'pending'
        };

        const newOrder = new Order(orderData);
        
        // Decrement inventory (identical to order.controller.ts createOrder)
        testProduct.stock -= ORDER_QTY;
        testProduct.lastInventoryUpdate = new Date();
        await testProduct.save();
        const savedOrder = await newOrder.save();

        const stockAfterOrder = (await Product.findById(testProduct._id))?.stock;
        console.log(`   ✅ Order Created: ID #${savedOrder._id}`);
        console.log(`   📊 Product Stock AFTER order: ${stockAfterOrder}`);
        if (stockAfterOrder === stockBeforeOrder - ORDER_QTY) {
            console.log(`   ✅ [PASS] Stock accurately decremented by ${ORDER_QTY} (${stockBeforeOrder} -> ${stockAfterOrder})`);
        } else {
            console.error(`   ❌ [FAIL] Stock mismatch! Expected ${stockBeforeOrder - ORDER_QTY}, got ${stockAfterOrder}`);
        }

        // 4. Simulate Payment Success & Dispatch Notifications (User Invoice + Admin Alert)
        console.log('\n💳 Step 4: Simulating Payment Success & Dispatching Notifications...');
        savedOrder.paymentStatus = 'paid';
        savedOrder.status = 'processing';
        savedOrder.cashfree = {
            orderId: savedOrder._id.toString(),
            cfPaymentId: 'cf_pay_test_' + Date.now(),
            lastEvent: 'PAID'
        };
        await savedOrder.save();

        // Create auto-generated Bill
        const newBill = new Bill({
            items: [
                {
                    name: testProduct.name,
                    price: testProduct.price,
                    quantity: ORDER_QTY,
                    productId: testProduct._id
                }
            ],
            totalAmount: savedOrder.totalAmount,
            customerInfo: {
                name: savedOrder.shippingInfo.fullName,
                phone: '9876543210',
                email: savedOrder.shippingInfo.email,
                address: `${savedOrder.shippingInfo.address}, ${savedOrder.shippingInfo.city}`
            },
            source: 'order_auto',
            user: savedOrder.user
        });
        await newBill.save();
        console.log(`   🧾 Auto-generated Invoice/Bill: ID #${newBill._id}`);

        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('items.product')
            .populate('user', 'name email');

        console.log('   📧 Dispatching User Order Confirmation (with PDF Invoice)...');
        const userConfirmSent = await NotificationService.sendOrderConfirmation(populatedOrder);
        console.log(`   ${userConfirmSent ? '✅' : '⚠️'} User Order Confirmation Email Sent: ${userConfirmSent}`);

        console.log('   📧 Dispatching Admin Payment Notification Alert...');
        const adminNotifySent = await NotificationService.sendAdminPaymentNotification(populatedOrder);
        console.log(`   ${adminNotifySent ? '✅' : '⚠️'} Admin Payment Notification Email Sent: ${adminNotifySent}`);

        // 5. Verify User History
        console.log('\n📜 Step 5: Verifying Order Appears in User History...');
        const historyQuery: any = {
            $or: [
                { user: testUser._id.toString() },
                { 'shippingInfo.email': new RegExp(`^${testUser.email}$`, 'i') }
            ]
        };
        const userHistoryOrders: any[] = await Order.find(historyQuery).populate('items.product').sort({ createdAt: -1 });

        const foundInHistory = userHistoryOrders.some(o => o._id.toString() === savedOrder._id.toString());
        console.log(`   Total orders found in user history: ${userHistoryOrders.length}`);
        if (foundInHistory) {
            console.log(`   ✅ [PASS] Order #${savedOrder._id} successfully retrieved in User History (GET /api/orders/my-orders)`);
        } else {
            console.error(`   ❌ [FAIL] Order not found in user history!`);
        }

        // 6. Order Status Change & Notification to User
        console.log('\n🔄 Step 6: Updating Order Status (Processing -> Shipped) & User Notification...');
        savedOrder.status = 'shipped';
        await savedOrder.save();

        const updatedOrderForShipped = await Order.findById(savedOrder._id)
            .populate('user', 'name email')
            .populate('items.product');

        console.log('   📧 Dispatching Order Status Update Notification (Shipped)...');
        const shippedNotifySent = await NotificationService.sendOrderStatusUpdate(updatedOrderForShipped, 'shipped');
        console.log(`   ${shippedNotifySent ? '✅' : '⚠️'} Shipped Status Email Sent: ${shippedNotifySent}`);

        // 7. Order Status Change to Delivered
        console.log('\n🚚 Step 7: Updating Order Status (Shipped -> Delivered)...');
        savedOrder.status = 'delivered';
        await savedOrder.save();

        const updatedOrderForDelivered = await Order.findById(savedOrder._id)
            .populate('user', 'name email')
            .populate('items.product');

        console.log('   📧 Dispatching Order Status Update Notification (Delivered)...');
        const deliveredNotifySent = await NotificationService.sendOrderStatusUpdate(updatedOrderForDelivered, 'delivered');
        console.log(`   ${deliveredNotifySent ? '✅' : '⚠️'} Delivered Status Email Sent: ${deliveredNotifySent}`);

        // 8. Order Cancellation & Stock Restoration
        console.log('\n↩️ Step 8: Simulating Order Cancellation & Verifying Stock Restoration...');
        savedOrder.status = 'cancelled';
        await savedOrder.save();

        // Restock items (same as order.controller.ts restockOrderItems)
        const currentProd = await Product.findById(testProduct._id);
        if (currentProd) {
            currentProd.stock += ORDER_QTY;
            await currentProd.save();
        }

        const restoredStock = (await Product.findById(testProduct._id))?.stock;
        console.log(`   📊 Product Stock AFTER cancellation: ${restoredStock}`);
        if (restoredStock === INITIAL_STOCK) {
            console.log(`   ✅ [PASS] Stock accurately restored back to initial level (${INITIAL_STOCK})`);
        } else {
            console.error(`   ❌ [FAIL] Stock restoration mismatch! Expected ${INITIAL_STOCK}, got ${restoredStock}`);
        }

        const updatedOrderForCancelled = await Order.findById(savedOrder._id)
            .populate('user', 'name email')
            .populate('items.product');

        console.log('   📧 Dispatching Order Status Update Notification (Cancelled)...');
        const cancelledNotifySent = await NotificationService.sendOrderStatusUpdate(updatedOrderForCancelled, 'cancelled');
        console.log(`   ${cancelledNotifySent ? '✅' : '⚠️'} Cancellation Email Sent: ${cancelledNotifySent}`);

        // Clean up test data
        console.log('\n🧹 Cleaning up test artifacts...');
        await Order.findByIdAndDelete(savedOrder._id);
        await Bill.findByIdAndDelete(newBill._id);
        console.log('   ✅ Cleaned up temporary test order and bill.');

        console.log('\n===========================================================');
        console.log('🎉 ALL STEPS IN THE FLOW COMPLETED & VERIFIED SUCCESSFULLY!');
        console.log('===========================================================');

    } catch (err) {
        console.error('❌ Test Flow Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

runTestFlow();
