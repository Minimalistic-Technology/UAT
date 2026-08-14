import { Request, Response } from 'express';
import PurchaseRecord from '../models/PurchaseRecord';
import Product from '../models/Product';
import redisClient from '../config/redis';

// Keep in sync with products.controller.ts's cache invalidation
const clearProductCache = async () => {
    try {
        await redisClient.del('products:all', 'products:home');
    } catch (err) {
        console.error('Failed to clear product cache:', err);
    }
};

// @desc    Get all purchase / inventory update records
// @route   GET /api/purchases
// @access  Private/Admin
export const getPurchaseRecords = async (req: Request, res: Response) => {
    try {
        const { search, seller, productId } = req.query;
        const filter: any = {};

        if (seller) {
            filter.seller = { $regex: seller as string, $options: 'i' };
        }

        if (productId) {
            filter.product = productId;
        }

        if (search) {
            filter.$or = [
                { productName: { $regex: search as string, $options: 'i' } },
                { seller: { $regex: search as string, $options: 'i' } },
                { invoiceNumber: { $regex: search as string, $options: 'i' } }
            ];
        }

        const records = await PurchaseRecord.find(filter)
            .sort({ purchaseDate: -1, createdAt: -1 })
            .populate('product', 'name image stock price costPrice seller category')
            .populate('createdBy', 'firstName lastName name email');

        res.json(records);
    } catch (err) {
        console.error('Error fetching purchase records:', err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single purchase record by ID
// @route   GET /api/purchases/:id
// @access  Private/Admin
export const getPurchaseRecordById = async (req: Request, res: Response) => {
    try {
        const record = await PurchaseRecord.findById(req.params.id)
            .populate('product', 'name image stock price costPrice seller category')
            .populate('createdBy', 'firstName lastName name email');

        if (!record) {
            return res.status(404).json({ msg: 'Purchase record not found' });
        }

        res.json(record);
    } catch (err: any) {
        console.error('Error fetching purchase record:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Purchase record not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a purchase record & sync with Product inventory
// @route   POST /api/purchases
// @access  Private/Admin
export const createPurchaseRecord = async (req: Request, res: Response) => {
    try {
        const {
            isNewProduct,
            productId,
            name,
            price,
            category,
            description,
            image,
            cgst,
            sgst,
            seller,
            sellerContact,
            quantityAdded,
            unitCost,
            purchaseDate,
            billScreenshot,
            invoiceNumber,
            notes
        } = req.body;

        if (!seller || seller.trim() === '') {
            return res.status(400).json({ msg: 'Seller name is required' });
        }

        const qty = Number(quantityAdded);
        if (isNaN(qty) || qty === 0) {
            return res.status(400).json({ msg: 'Valid quantity added is required' });
        }

        const cost = Number(unitCost) || 0;
        const recordDate = purchaseDate ? new Date(purchaseDate) : new Date();

        let targetProduct: any = null;

        if (isNewProduct || !productId) {
            // Create a brand new Product synced with this purchase
            if (!name || name.trim() === '') {
                return res.status(400).json({ msg: 'Product name is required for new product creation' });
            }

            const newProduct = new Product({
                name,
                price: Number(price) || (cost > 0 ? Math.round(cost * 1.3) : 0),
                costPrice: cost,
                stock: Math.max(0, qty),
                category: category || undefined,
                description: description || '',
                image: image || '',
                cgst: Number(cgst) || 0,
                sgst: Number(sgst) || 0,
                seller: seller,
                lastInventoryUpdate: recordDate,
                billScreenshot: billScreenshot || undefined
            });

            targetProduct = await newProduct.save();
        } else {
            // Find existing product and update inventory
            targetProduct = await Product.findById(productId);
            if (!targetProduct) {
                return res.status(404).json({ msg: 'Target product not found' });
            }

            // Sync stock and latest purchase info
            targetProduct.stock = Math.max(0, (targetProduct.stock || 0) + qty);
            targetProduct.seller = seller || targetProduct.seller;
            if (cost > 0) targetProduct.costPrice = cost;
            targetProduct.lastInventoryUpdate = recordDate;
            if (billScreenshot) targetProduct.billScreenshot = billScreenshot;

            await targetProduct.save();
        }

        // Create Purchase Record log
        const purchaseRecord = new PurchaseRecord({
            product: targetProduct._id,
            productName: targetProduct.name,
            seller,
            sellerContact,
            quantityAdded: qty,
            unitCost: cost,
            totalCost: Math.round(cost * qty),
            purchaseDate: recordDate,
            billScreenshot,
            invoiceNumber,
            notes,
            createdBy: (req as any).user?.id || (req as any).user?._id
        });

        const savedRecord = await purchaseRecord.save();

        await clearProductCache();

        res.json({
            record: savedRecord,
            product: targetProduct,
            msg: `Successfully recorded purchase of ${qty} units from ${seller} and synced inventory.`
        });
    } catch (err: any) {
        console.error('Error creating purchase record:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

// @desc    Update a purchase record & adjust Product inventory accordingly
// @route   PUT /api/purchases/:id
// @access  Private/Admin
export const updatePurchaseRecord = async (req: Request, res: Response) => {
    try {
        const {
            seller,
            sellerContact,
            quantityAdded,
            unitCost,
            purchaseDate,
            billScreenshot,
            invoiceNumber,
            notes
        } = req.body;

        const record = await PurchaseRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ msg: 'Purchase record not found' });
        }

        const newQty = Number(quantityAdded);
        const oldQty = record.quantityAdded;
        const qtyDiff = newQty - oldQty;

        const cost = Number(unitCost) !== undefined ? Number(unitCost) : record.unitCost;
        const recordDate = purchaseDate ? new Date(purchaseDate) : record.purchaseDate;

        // Sync product stock differential
        const product = await Product.findById(record.product);
        if (product) {
            if (qtyDiff !== 0) {
                product.stock = Math.max(0, (product.stock || 0) + qtyDiff);
            }
            if (seller) product.seller = seller;
            if (cost > 0) product.costPrice = cost;
            product.lastInventoryUpdate = recordDate;
            if (billScreenshot !== undefined) product.billScreenshot = billScreenshot;
            await product.save();
        }

        // Update PurchaseRecord fields
        if (seller !== undefined) record.seller = seller;
        if (sellerContact !== undefined) record.sellerContact = sellerContact;
        record.quantityAdded = newQty;
        record.unitCost = cost;
        record.totalCost = Math.round(cost * newQty);
        record.purchaseDate = recordDate;
        if (billScreenshot !== undefined) record.billScreenshot = billScreenshot;
        if (invoiceNumber !== undefined) record.invoiceNumber = invoiceNumber;
        if (notes !== undefined) record.notes = notes;

        const updatedRecord = await record.save();

        await clearProductCache();

        res.json({
            record: updatedRecord,
            product,
            msg: 'Purchase record updated and inventory synced.'
        });
    } catch (err: any) {
        console.error('Error updating purchase record:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

// @desc    Delete a purchase record & adjust Product inventory stock
// @route   DELETE /api/purchases/:id
// @access  Private/Admin
export const deletePurchaseRecord = async (req: Request, res: Response) => {
    try {
        const record = await PurchaseRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ msg: 'Purchase record not found' });
        }

        // Revert product stock
        const product = await Product.findById(record.product);
        if (product) {
            product.stock = Math.max(0, (product.stock || 0) - record.quantityAdded);
            await product.save();
        }

        await PurchaseRecord.findByIdAndDelete(req.params.id);

        await clearProductCache();

        res.json({
            msg: 'Purchase record deleted and inventory stock adjusted accordingly.',
            recordId: req.params.id
        });
    } catch (err: any) {
        console.error('Error deleting purchase record:', err);
        res.status(500).send('Server Error');
    }
};
