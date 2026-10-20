import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Import all 28 Mongoose models
import Category from '../src/models/Category';
import Product from '../src/models/Product';
import User from '../src/models/User';
import Hub from '../src/models/Hub';
import WarehouseStock from '../src/models/WarehouseStock';
import TransferRequest from '../src/models/TransferRequest';
import PurchaseRecord from '../src/models/PurchaseRecord';
import Company from '../src/models/Company';
import Client from '../src/models/Client';
import ClientProject from '../src/models/ClientProject';
import LeadStage from '../src/models/LeadStage';
import Lead from '../src/models/Lead';
import CrmContact from '../src/models/CrmContact';
import Contact from '../src/models/Contact';
import Invoice from '../src/models/Invoice';
import Bill from '../src/models/Bill';
import Expense from '../src/models/Expense';
import QuotationItem from '../src/models/QuotationItem';
import SavedQuotation from '../src/models/SavedQuotation';
import Coupon from '../src/models/Coupon';
import Order from '../src/models/Order';
import Review from '../src/models/Review';
import Cart from '../src/models/Cart';
import RouteConfig from '../src/models/RouteConfig';
import EmailTemplate from '../src/models/EmailTemplate';
import Settings from '../src/models/Settings';
import Blog from '../src/models/Blog';
import OTP from '../src/models/OTP';

// Import seed dataset
import { categoriesData, productsData } from './seed-data/categoriesAndProducts';
import { usersData } from './seed-data/users';
import { hubsData, warehouseStockData, transferRequestsData, purchaseRecordsData } from './seed-data/logistics';
import { companiesData, clientsData, clientProjectsData, leadStagesData, leadsData, crmContactsData, contactMessagesData } from './seed-data/crm';
import { quotationItemsData, savedQuotationsData, invoicesData, billsData, expensesData } from './seed-data/billing';
import { couponsData, ordersData, reviewsData, cartsData, routeConfigsData, emailTemplatesData, settingsData, blogsData, otpsData } from './seed-data/storefront';

const DEFAULT_MONGO_URI = 'mongodb+srv://minimalistic:N0LbAOY6FoyCB5w8@ml-test-cluster0.tjquq.mongodb.net/ddtec?retryWrites=true&w=majority';
const DEFAULT_PASSWORD = 'password' in process.env ? (process.env.DEFAULT_SEED_PASSWORD || '12345678') : '12345678';

export async function seedAll() {
    const startTime = Date.now();
    try {
        // Resolve Mongo URI from argv, env, or default
        const cliUri = process.argv.find(arg => arg.startsWith('mongodb+srv://') || arg.startsWith('mongodb://'));
        const uri = cliUri || process.env.MONGO_URI || DEFAULT_MONGO_URI;

        console.log('================================================================');
        console.log('🚀 DDTEC COMPREHENSIVE END-TO-END DATABASE SEEDER');
        console.log('================================================================');
        console.log(`🔌 Target Cluster: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
        console.log(`🔑 Uniform Test Password: "${DEFAULT_PASSWORD}"`);
        console.log('================================================================\n');

        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(uri);
        console.log('✅ Connected successfully!\n');

        // Precompute uniform bcrypt hash for password "12345678"
        console.log(`🔒 Hashing uniform password "${DEFAULT_PASSWORD}" with bcrypt...`);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        console.log('✅ Password hash generated successfully.\n');

        // -------------------------------------------------------------
        // 1. HUBS (Logistics Dark Stores & Fulfillment Centers)
        // -------------------------------------------------------------
        console.log('🏭 [1/28] Seeding Hubs...');
        const hubMap = new Map<string, any>();
        for (const hub of hubsData) {
            const doc = await Hub.findOneAndUpdate(
                { code: hub.code },
                { $set: hub },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            hubMap.set(hub.code, doc);
            console.log(`   ✓ Hub: ${hub.name} (${hub.code}) -> ${doc._id}`);
        }

        // -------------------------------------------------------------
        // 2. USERS (All Roles & Test Customers)
        // -------------------------------------------------------------
        console.log('\n👥 [2/28] Seeding Users with Password "12345678"...');
        const userMap = new Map<string, any>();
        const mumbaiHub = hubMap.get('MUM-01');

        for (const u of usersData) {
            const userPayload: any = {
                name: u.name,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email.toLowerCase(),
                phone: u.phone,
                role: u.role,
                password: hashedPassword,
                isEmailVerified: true,
                isPhoneVerified: true,
                isActive: true,
                authProvider: 'local',
                loginAttempts: 0,
                creditBalance: u.creditBalance ?? 0,
                address: u.address,
                avatar: u.avatar
            };

            // Link warehouse user to Mumbai dark store
            if (u.role === 'warehouse' && mumbaiHub) {
                userPayload.hubId = mumbaiHub._id;
            }

            const doc = await User.findOneAndUpdate(
                { email: u.email.toLowerCase() },
                {
                    $set: userPayload,
                    $unset: { lockUntil: 1 }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            userMap.set(u.email.toLowerCase(), doc);
            console.log(`   ✓ User: ${u.name} <${u.email}> [Role: ${u.role}] -> Password: ${DEFAULT_PASSWORD}`);
        }

        // Reset passwords for ANY other pre-existing users in database
        const updateExistingResult = await User.updateMany(
            {},
            {
                $set: {
                    password: hashedPassword,
                    isActive: true,
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    loginAttempts: 0
                },
                $unset: { lockUntil: 1 }
            }
        );
        console.log(`   🔄 Synchronized all ${updateExistingResult.matchedCount} DB users to password: ${DEFAULT_PASSWORD}`);

        const adminUser = userMap.get('admin@ddtec.com') || (await User.findOne({ role: 'admin' }));

        // -------------------------------------------------------------
        // 3. CATEGORIES
        // -------------------------------------------------------------
        console.log('\n📁 [3/28] Seeding Categories...');
        const categoryMap = new Map<string, mongoose.Types.ObjectId>();
        for (const cat of categoriesData) {
            const doc = await Category.findOneAndUpdate(
                { slug: cat.slug },
                { $set: cat },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            categoryMap.set(cat.slug, doc._id as mongoose.Types.ObjectId);
            console.log(`   ✓ Category: ${cat.name} (${cat.slug})`);
        }

        // -------------------------------------------------------------
        // 4. PRODUCTS (Real specs, HSN, weights, high-res images)
        // -------------------------------------------------------------
        console.log('\n📦 [4/28] Seeding Products...');
        const productList: any[] = [];
        for (const item of productsData) {
            const categoryId = categoryMap.get(item.categorySlug);
            if (!categoryId) {
                console.warn(`   ⚠️ Category not found for slug: ${item.categorySlug}`);
                continue;
            }

            const productPayload = {
                name: item.name,
                category: categoryId,
                brand: item.brand,
                modelName: item.modelName,
                price: item.price,
                costPrice: item.costPrice,
                stock: item.stock,
                rating: item.rating,
                numReviews: item.numReviews,
                lastMonthSales: item.lastMonthSales,
                discountPercentage: item.discountPercentage,
                discountType: item.discountType,
                discountValue: item.discountValue,
                hsnCode: item.hsnCode,
                cgst: item.cgst,
                sgst: item.sgst,
                weightKg: item.weightKg,
                lengthCm: item.lengthCm,
                widthCm: item.widthCm,
                heightCm: item.heightCm,
                packQuantity: item.packQuantity,
                packUnit: item.packUnit,
                seller: item.seller,
                showOnHome: item.showOnHome,
                showAddToCart: true,
                showBuyNow: true,
                codAvailable: true,
                productType: 'physical' as const,
                isReturnable: true,
                showDeliveryChecker: true,
                allowedCourierPartners: ['BLUEDART', 'DTDC'],
                customDeliveryEstimate: item.customDeliveryEstimate,
                image: item.image,
                images: item.images,
                description: item.description,
                highlights: item.highlights,
                isActive: true
            };

            const doc = await Product.findOneAndUpdate(
                { name: item.name },
                { $set: productPayload },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            productList.push(doc);
            console.log(`   ✓ Product: ${item.name} [₹${item.price.toLocaleString('en-IN')}]`);
        }

        // Helper to find product by substring match
        const findProduct = (match: string) => {
            return productList.find(p => p.name.toLowerCase().includes(match.toLowerCase())) || productList[0];
        };

        // -------------------------------------------------------------
        // 5. WAREHOUSE STOCKS (Bin/Shelf/Rack Allocations)
        // -------------------------------------------------------------
        console.log('\n🏬 [5/28] Seeding Warehouse Stock Allocations...');
        for (const stock of warehouseStockData) {
            const prod = findProduct(stock.productNameMatch);
            await WarehouseStock.findOneAndUpdate(
                {
                    product: prod._id,
                    warehouseName: stock.warehouseName,
                    zoneAisle: stock.zoneAisle,
                    rack: stock.rack,
                    shelfRow: stock.shelfRow
                },
                {
                    $set: {
                        product: prod._id,
                        productName: prod.name,
                        warehouseName: stock.warehouseName,
                        zoneAisle: stock.zoneAisle,
                        rack: stock.rack,
                        shelfRow: stock.shelfRow,
                        quantity: stock.quantity,
                        capacity: stock.capacity
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Stock: ${prod.name.substring(0, 30)}... @ ${stock.warehouseName} [${stock.zoneAisle}] -> Qty: ${stock.quantity}`);
        }

        // -------------------------------------------------------------
        // 6. TRANSFER REQUESTS
        // -------------------------------------------------------------
        console.log('\n🔄 [6/28] Seeding Transfer Requests...');
        for (const req of transferRequestsData) {
            const prod = findProduct(req.productNameMatch);
            await TransferRequest.findOneAndUpdate(
                {
                    product: prod._id,
                    fromWarehouse: req.fromWarehouse,
                    toWarehouse: req.toWarehouse
                },
                {
                    $set: {
                        product: prod._id,
                        productName: prod.name,
                        fromWarehouse: req.fromWarehouse,
                        toWarehouse: req.toWarehouse,
                        quantity: req.quantity,
                        status: req.status,
                        notes: req.notes,
                        completedAt: req.completedAt
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Transfer: ${req.quantity}x ${prod.name.substring(0, 25)}... [${req.fromWarehouse} -> ${req.toWarehouse}] Status: ${req.status}`);
        }

        // -------------------------------------------------------------
        // 7. PURCHASE RECORDS (Goods Inward from Suppliers)
        // -------------------------------------------------------------
        console.log('\n📝 [7/28] Seeding Purchase Records...');
        for (const rec of purchaseRecordsData) {
            const prod = findProduct(rec.productNameMatch);
            await PurchaseRecord.findOneAndUpdate(
                { invoiceNumber: rec.invoiceNumber },
                {
                    $set: {
                        product: prod._id,
                        productName: prod.name,
                        seller: rec.seller,
                        sellerContact: rec.sellerContact,
                        quantityAdded: rec.quantityAdded,
                        unitCost: rec.unitCost,
                        totalCost: rec.totalCost,
                        purchaseDate: rec.purchaseDate,
                        invoiceNumber: rec.invoiceNumber,
                        notes: rec.notes,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Inward: ${rec.invoiceNumber} - ${rec.quantityAdded}x ${prod.name.substring(0, 25)}... from ${rec.seller}`);
        }

        // -------------------------------------------------------------
        // 8. COMPANIES (DDTEC Corporate Entities)
        // -------------------------------------------------------------
        console.log('\n🏢 [8/28] Seeding Companies...');
        for (const comp of companiesData) {
            await Company.findOneAndUpdate(
                { gstNumber: comp.gstNumber },
                {
                    $set: {
                        ...comp,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Company: ${comp.name} [GST: ${comp.gstNumber}]`);
        }

        // -------------------------------------------------------------
        // 9. CLIENTS (Enterprise B2B Accounts)
        // -------------------------------------------------------------
        console.log('\n💼 [9/28] Seeding Clients...');
        const clientMap = new Map<string, any>();
        for (const cl of clientsData) {
            const doc = await Client.findOneAndUpdate(
                { email: cl.email },
                {
                    $set: {
                        ...cl,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            clientMap.set(cl.company, doc);
            console.log(`   ✓ Client: ${cl.name} (${cl.company}) [Currency: ${cl.currency}]`);
        }

        // -------------------------------------------------------------
        // 10. CLIENT PROJECTS
        // -------------------------------------------------------------
        console.log('\n🚀 [10/28] Seeding Client Projects...');
        for (const proj of clientProjectsData) {
            const clientDoc = clientMap.get(proj.clientCompanyName);
            if (!clientDoc) continue;

            await ClientProject.findOneAndUpdate(
                { client: clientDoc._id, title: proj.title },
                {
                    $set: {
                        client: clientDoc._id,
                        title: proj.title,
                        status: proj.status,
                        note: proj.note,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Client Project: "${proj.title}" [Status: ${proj.status}]`);
        }

        // -------------------------------------------------------------
        // 11. LEAD STAGES
        // -------------------------------------------------------------
        console.log('\n📊 [11/28] Seeding Lead Stages...');
        const stageMap = new Map<string, any>();
        for (const stage of leadStagesData) {
            const doc = await LeadStage.findOneAndUpdate(
                { name: stage.name },
                { $set: stage },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            stageMap.set(stage.name, doc);
            console.log(`   ✓ Stage: ${stage.name} (${stage.color})`);
        }

        // -------------------------------------------------------------
        // 12. LEADS
        // -------------------------------------------------------------
        console.log('\n🎯 [12/28] Seeding Leads...');
        for (const lead of leadsData) {
            const stageDoc = stageMap.get(lead.stageName);
            if (!stageDoc) continue;

            await Lead.findOneAndUpdate(
                { name: lead.name, company: lead.company },
                {
                    $set: {
                        name: lead.name,
                        company: lead.company,
                        email: lead.email,
                        phone: lead.phone,
                        value: lead.value,
                        stage: stageDoc._id,
                        source: lead.source,
                        location: lead.location,
                        assignedTo: adminUser?._id,
                        note: lead.note,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Lead: "${lead.name}" [₹${lead.value.toLocaleString('en-IN')}] -> Stage: ${lead.stageName}`);
        }

        // -------------------------------------------------------------
        // 13. CRM CONTACTS
        // -------------------------------------------------------------
        console.log('\n📇 [13/28] Seeding CRM Contacts...');
        for (const c of crmContactsData) {
            await CrmContact.findOneAndUpdate(
                { firstName: c.firstName, lastName: c.lastName, company: c.company },
                {
                    $set: {
                        ...c,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ CRM Contact: ${c.firstName} ${c.lastName} (${c.jobTitle} @ ${c.company})`);
        }

        // -------------------------------------------------------------
        // 14. CONTACT INQUIRIES (Form Submissions)
        // -------------------------------------------------------------
        console.log('\n💬 [14/28] Seeding Website Contact Messages...');
        for (const msg of contactMessagesData) {
            await Contact.findOneAndUpdate(
                { email: msg.email, firstName: msg.firstName, lastName: msg.lastName },
                { $set: msg },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Contact Message: From ${msg.firstName} ${msg.lastName} <${msg.email}>`);
        }

        // -------------------------------------------------------------
        // 15. QUOTATION ITEMS (Prefilled Catalog for B2B Quotations)
        // -------------------------------------------------------------
        console.log('\n📋 [15/28] Seeding Quotation Products...');
        for (const qi of quotationItemsData) {
            await QuotationItem.findOneAndUpdate(
                { name: qi.name },
                { $set: qi },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Quotation Item: ${qi.name} [₹${qi.price.toLocaleString('en-IN')}]`);
        }

        // -------------------------------------------------------------
        // 16. SAVED QUOTATIONS
        // -------------------------------------------------------------
        console.log('\n📑 [16/28] Seeding Saved Quotations...');
        for (const sq of savedQuotationsData) {
            await SavedQuotation.findOneAndUpdate(
                { quotationNumber: sq.quotationNumber },
                {
                    $set: {
                        ...sq,
                        user: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Saved Quotation: ${sq.quotationNumber} for ${sq.buyer.name} [Total: ₹${sq.grandTotal.toLocaleString('en-IN')}]`);
        }

        // -------------------------------------------------------------
        // 17. INVOICES (B2B Tax Invoices with Public IDs)
        // -------------------------------------------------------------
        console.log('\n🧾 [17/28] Seeding Invoices...');
        for (const inv of invoicesData) {
            await Invoice.findOneAndUpdate(
                { invoiceNumber: inv.invoiceNumber },
                {
                    $set: {
                        ...inv,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Invoice: ${inv.invoiceNumber} [Status: ${inv.status}, ₹${inv.totalAmount.toLocaleString('en-IN')}] -> PublicId: ${inv.publicId}`);
        }

        // -------------------------------------------------------------
        // 18. BILLS (Counter / POS Bills)
        // -------------------------------------------------------------
        console.log('\n💵 [18/28] Seeding Bills...');
        for (const b of billsData) {
            await Bill.findOneAndUpdate(
                { 'customerInfo.name': b.customerInfo.name, totalAmount: b.totalAmount },
                {
                    $set: {
                        ...b,
                        user: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Bill: ₹${b.totalAmount.toLocaleString('en-IN')} for ${b.customerInfo.name}`);
        }

        // -------------------------------------------------------------
        // 19. EXPENSES
        // -------------------------------------------------------------
        console.log('\n💳 [19/28] Seeding Operating Expenses...');
        for (const exp of expensesData) {
            await Expense.findOneAndUpdate(
                { title: exp.title, date: exp.date },
                {
                    $set: {
                        ...exp,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Expense: ${exp.title} [₹${exp.amount.toLocaleString('en-IN')}] - ${exp.category}`);
        }

        // -------------------------------------------------------------
        // 20. COUPONS
        // -------------------------------------------------------------
        console.log('\n🎟️ [20/28] Seeding Coupons...');
        for (const c of couponsData) {
            await Coupon.findOneAndUpdate(
                { code: c.code },
                { $set: c },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Coupon: ${c.code} [${c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue} OFF]`);
        }

        // -------------------------------------------------------------
        // 21. ORDERS (Diverse Lifecycle States & Tracking)
        // -------------------------------------------------------------
        console.log('\n📦 [21/28] Seeding Customer Orders...');
        for (const ord of ordersData) {
            const customer = userMap.get(ord.userEmail);
            const orderItems = ord.productNames.map(item => {
                const prod = findProduct(item.nameMatch);
                return {
                    product: prod._id,
                    quantity: item.quantity,
                    price: prod.price
                };
            });

            const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
            const total = subtotal - ord.discountAmount + ord.shippingFee;

            await Order.findOneAndUpdate(
                {
                    'shippingInfo.email': ord.shippingInfo.email,
                    status: ord.status,
                    totalAmount: total
                },
                {
                    $set: {
                        user: customer?._id,
                        items: orderItems,
                        totalAmount: total,
                        shippingInfo: ord.shippingInfo,
                        paymentMethod: ord.paymentMethod,
                        status: ord.status,
                        paymentStatus: ord.paymentStatus,
                        coupon: ord.coupon,
                        discountAmount: ord.discountAmount,
                        shippingFee: ord.shippingFee,
                        shippingCarrier: ord.shippingCarrier,
                        shippingCarrierId: ord.shippingCarrierId,
                        totalWeightKg: 1.2
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Order: For ${ord.shippingInfo.fullName} [Status: ${ord.status}, Payment: ${ord.paymentStatus}, Total: ₹${total.toLocaleString('en-IN')}]`);
        }

        // -------------------------------------------------------------
        // 22. REVIEWS
        // -------------------------------------------------------------
        console.log('\n⭐ [22/28] Seeding Product Reviews...');
        for (const rev of reviewsData) {
            const prod = findProduct(rev.productNameMatch);
            const usr = userMap.get(rev.userEmail);
            if (!usr) continue;

            await Review.findOneAndUpdate(
                { product: prod._id, user: usr._id },
                {
                    $set: {
                        product: prod._id,
                        user: usr._id,
                        userName: rev.userName,
                        rating: rev.rating,
                        comment: rev.comment
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Review: ${rev.rating}★ on ${prod.name.substring(0, 25)}... by ${rev.userName}`);
        }

        // -------------------------------------------------------------
        // 23. CARTS (Prepopulated Shopping Carts for Testing)
        // -------------------------------------------------------------
        console.log('\n🛒 [23/28] Seeding Shopping Carts...');
        for (const cart of cartsData) {
            const usr = userMap.get(cart.userEmail);
            if (!usr) continue;

            const cartItems = cart.items.map(it => {
                const prod = findProduct(it.productNameMatch);
                return {
                    product: prod._id,
                    quantity: it.quantity
                };
            });

            await Cart.findOneAndUpdate(
                { user: usr._id },
                {
                    $set: {
                        user: usr._id,
                        items: cartItems
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Cart: Pre-loaded ${cartItems.length} items for <${cart.userEmail}>`);
        }

        // -------------------------------------------------------------
        // 24. ROUTE CONFIGURATIONS
        // -------------------------------------------------------------
        console.log('\n🌐 [24/28] Seeding Dynamic Route Configurations...');
        for (const route of routeConfigsData) {
            await RouteConfig.findOneAndUpdate(
                { path: route.path },
                { $set: route },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Route: ${route.path} (${route.name}) [Active: ${route.isActive}]`);
        }

        // -------------------------------------------------------------
        // 25. EMAIL TEMPLATES
        // -------------------------------------------------------------
        console.log('\n✉️ [25/28] Seeding Email Templates...');
        for (const tmpl of emailTemplatesData) {
            await EmailTemplate.findOneAndUpdate(
                { name: tmpl.name },
                {
                    $set: {
                        ...tmpl,
                        createdBy: adminUser?._id
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Email Template: "${tmpl.name}" [Badge: ${tmpl.badge}]`);
        }

        // -------------------------------------------------------------
        // 26. SETTINGS
        // -------------------------------------------------------------
        console.log('\n⚙️ [26/28] Seeding Global Application Settings...');
        await Settings.findOneAndUpdate(
            {},
            { $set: settingsData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('   ✓ Settings: All UI components enabled, onboarding mode: OPEN, delivery thresholds set.');

        // -------------------------------------------------------------
        // 27. BLOGS
        // -------------------------------------------------------------
        console.log('\n📰 [27/28] Seeding Tech Blogs...');
        for (const blog of blogsData) {
            await Blog.findOneAndUpdate(
                { slug: blog.slug },
                { $set: blog },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ Blog: "${blog.title}" (${blog.slug})`);
        }

        // -------------------------------------------------------------
        // 28. OTPs (Test One-Time Passwords)
        // -------------------------------------------------------------
        console.log('\n🔑 [28/28] Seeding Verification OTPs...');
        for (const otp of otpsData) {
            await OTP.findOneAndUpdate(
                { identifier: otp.identifier },
                { $set: otp },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`   ✓ OTP: Code "${otp.otp}" for identifier: ${otp.identifier}`);
        }

        // -------------------------------------------------------------
        // SUMMARY REPORT
        // -------------------------------------------------------------
        console.log('\n================================================================');
        console.log('📊 COMPREHENSIVE COLLECTION STATS AUDIT');
        console.log('================================================================');

        const collections = [
            { name: 'Users', model: User },
            { name: 'Hubs', model: Hub },
            { name: 'Categories', model: Category },
            { name: 'Products', model: Product },
            { name: 'WarehouseStocks', model: WarehouseStock },
            { name: 'TransferRequests', model: TransferRequest },
            { name: 'PurchaseRecords', model: PurchaseRecord },
            { name: 'Companies', model: Company },
            { name: 'Clients', model: Client },
            { name: 'ClientProjects', model: ClientProject },
            { name: 'LeadStages', model: LeadStage },
            { name: 'Leads', model: Lead },
            { name: 'CrmContacts', model: CrmContact },
            { name: 'Contacts (Inquiries)', model: Contact },
            { name: 'QuotationItems', model: QuotationItem },
            { name: 'SavedQuotations', model: SavedQuotation },
            { name: 'Invoices', model: Invoice },
            { name: 'Bills', model: Bill },
            { name: 'Expenses', model: Expense },
            { name: 'Coupons', model: Coupon },
            { name: 'Orders', model: Order },
            { name: 'Reviews', model: Review },
            { name: 'Carts', model: Cart },
            { name: 'RouteConfigs', model: RouteConfig },
            { name: 'EmailTemplates', model: EmailTemplate },
            { name: 'Settings', model: Settings },
            { name: 'Blogs', model: Blog },
            { name: 'OTPs', model: OTP }
        ];

        for (const col of collections) {
            const count = await col.model.countDocuments();
            console.log(`   ✓ ${col.name.padEnd(25)} : ${count} documents`);
        }

        console.log('\n================================================================');
        console.log('🔐 VERIFIED TEST LOGIN CREDENTIALS (ALL PASSWORDS: 12345678)');
        console.log('================================================================');
        console.log('   Role                | Email                     | Password ');
        console.log('   --------------------+---------------------------+----------');
        console.log('   Super Admin         | superadmin@ddtec.com      | 12345678');
        console.log('   Admin               | admin@ddtec.com           | 12345678');
        console.log('   Admin (Raj Mane)    | rajmane9594@gmail.com     | 12345678');
        console.log('   Admin (Lihance)     | lihancebopche@gmail.com   | 12345678');
        console.log('   Product Manager     | product@ddtec.com         | 12345678');
        console.log('   Order Manager       | orders@ddtec.com          | 12345678');
        console.log('   Warehouse Staff     | warehouse@ddtec.com       | 12345678');
        console.log('   Lead Accountant     | accountant@ddtec.com      | 12345678');
        console.log('   Inventory Manager   | inventory@ddtec.com       | 12345678');
        console.log('   Customer Support    | support@ddtec.com         | 12345678');
        console.log('   Finance Officer     | finance@ddtec.com         | 12345678');
        console.log('   Marketing Lead      | marketing@ddtec.com       | 12345678');
        console.log('   Customer (John Doe) | user@ddtec.com            | 12345678');
        console.log('   Customer (Priya S.) | priya@ddtec.com           | 12345678');
        console.log('   Customer (Raj Mane) | rajmane5884@gmail.com     | 12345678');
        console.log('   Customer (Anushka)  | anushkasen@gmail.com      | 12345678');
        console.log('================================================================');
        console.log(`🎉 Seed finished in ${((Date.now() - startTime) / 1000).toFixed(2)}s!`);
        console.log('👋 Database connection closed.\n');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error during complete database seeding:', error);
        process.exit(1);
    }
}

// Run if invoked directly
if (require.main === module) {
    seedAll();
}
