import { Request, Response } from 'express';
import PurchaseRecord from '../models/PurchaseRecord';
import Product from '../models/Product';
import redisClient from '../config/redis';
import { deleteCloudinaryImagesNotUsedByProducts } from '../utils/cloudinaryCleanup';

// Keep in sync with products.controller.ts's cache invalidation
const clearProductCache = async () => {
    try {
        const keys = ['products:all', 'products:home'];
        try {
            const pinKeys = await redisClient.keys('products:pin:*');
            if (Array.isArray(pinKeys) && pinKeys.length) keys.push(...pinKeys);
        } catch { /* keys() unsupported / unavailable – base keys are enough */ }
        await redisClient.del(...keys);
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

// @desc    Upload single image to Cloudinary (for product image or bill screenshot)
// @route   POST /api/purchases/upload-image
// @access  Private/Admin
export const uploadPurchaseImage = async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const file = (req as any).file || files?.image?.[0] || files?.file?.[0] || files?.billScreenshot?.[0];

        if (!file) {
            return res.status(400).json({ msg: 'No image file uploaded' });
        }

        const url = (file as any).path || (file as any).secure_url;
        res.json({
            url,
            msg: 'Image uploaded to Cloudinary successfully'
        });
    } catch (err: any) {
        console.error('Error uploading image to Cloudinary:', err);
        res.status(500).json({ msg: err.message || 'Failed to upload image' });
    }
};

// @desc    Delete an image from Cloudinary (if not in use by any live product)
// @route   POST /api/purchases/delete-image
// @access  Private/Admin
export const deletePurchaseImage = async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ msg: 'Image URL is required' });
        }

        await deleteCloudinaryImagesNotUsedByProducts([imageUrl]);
        res.json({ msg: 'Image removed from Cloudinary successfully' });
    } catch (err: any) {
        console.error('Error deleting image from Cloudinary:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
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
            notes,
            packQuantity,
            packUnit,
            unitSize,
            unitMeasure
        } = req.body;

        if (!seller || String(seller).trim() === '') {
            return res.status(400).json({ msg: 'Seller name is required' });
        }

        const qty = Number(quantityAdded);
        if (isNaN(qty) || qty === 0) {
            return res.status(400).json({ msg: 'Valid quantity added is required' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const uploadedProductImage = files?.image?.[0]?.path || (files?.image?.[0] as any)?.secure_url || (files?.file?.[0] as any)?.path;
        const uploadedBillScreenshot = files?.billScreenshot?.[0]?.path || (files?.billScreenshot?.[0] as any)?.secure_url;

        const effectiveProductImage = uploadedProductImage || image || '';
        const effectiveBillScreenshot = uploadedBillScreenshot || billScreenshot || '';

        const cost = Number(unitCost) || 0;
        const recordDate = purchaseDate ? new Date(purchaseDate) : new Date();

        let targetProduct: any = null;

        const isNew = isNewProduct === true || isNewProduct === 'true' || !productId;

        if (isNew) {
            // Create a brand new Product synced with this purchase
            if (!name || String(name).trim() === '') {
                return res.status(400).json({ msg: 'Product name is required for new product creation' });
            }

            const parsedPackQty = Number(packQuantity);
            const parsedUnitSize = Number(unitSize);
            const hasValidUnitSize = !isNaN(parsedUnitSize) && parsedUnitSize > 0;
            const finalPackQty = (!isNaN(parsedPackQty) && parsedPackQty > 0) ? parsedPackQty : 1;
            const finalPackUnit = packUnit ? String(packUnit).trim() : 'Piece';
            const finalUnitSize = hasValidUnitSize ? parsedUnitSize : 0;
            const finalUnitMeasure = (hasValidUnitSize && unitMeasure) ? String(unitMeasure).trim() : '';

            const newProduct = new Product({
                name: String(name).trim(),
                price: Number(price) || (cost > 0 ? Math.round(cost * 1.3) : 0),
                costPrice: cost,
                stock: Math.max(0, qty),
                category: category || undefined,
                description: description || '',
                image: effectiveProductImage,
                images: effectiveProductImage ? [effectiveProductImage] : [],
                cgst: Number(cgst) || 0,
                sgst: Number(sgst) || 0,
                seller: String(seller).trim(),
                lastInventoryUpdate: recordDate,
                billScreenshot: effectiveBillScreenshot || undefined,
                packQuantity: finalPackQty,
                packUnit: finalPackUnit,
                unitSize: finalUnitSize,
                unitMeasure: finalUnitMeasure
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
            targetProduct.seller = String(seller).trim() || targetProduct.seller;
            if (cost > 0) targetProduct.costPrice = cost;
            targetProduct.lastInventoryUpdate = recordDate;
            if (effectiveBillScreenshot) targetProduct.billScreenshot = effectiveBillScreenshot;

            await targetProduct.save();
        }

        // Create Purchase Record log
        const purchaseRecord = new PurchaseRecord({
            product: targetProduct._id,
            productName: targetProduct.name,
            seller: String(seller).trim(),
            sellerContact: sellerContact || undefined,
            quantityAdded: qty,
            unitCost: cost,
            totalCost: Math.round(cost * qty),
            purchaseDate: recordDate,
            billScreenshot: effectiveBillScreenshot || undefined,
            invoiceNumber: invoiceNumber || undefined,
            notes: notes || undefined,
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

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const uploadedBillScreenshot = files?.billScreenshot?.[0]?.path || (files?.billScreenshot?.[0] as any)?.secure_url;
        const effectiveBillScreenshot = uploadedBillScreenshot !== undefined ? uploadedBillScreenshot : billScreenshot;

        const previousBillScreenshot = record.billScreenshot;

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
            if (seller) product.seller = String(seller).trim();
            if (cost > 0) product.costPrice = cost;
            product.lastInventoryUpdate = recordDate;
            if (effectiveBillScreenshot !== undefined) product.billScreenshot = effectiveBillScreenshot;
            await product.save();
        }

        // Update PurchaseRecord fields
        if (seller !== undefined) record.seller = String(seller).trim();
        if (sellerContact !== undefined) record.sellerContact = sellerContact;
        record.quantityAdded = newQty;
        record.unitCost = cost;
        record.totalCost = Math.round(cost * newQty);
        record.purchaseDate = recordDate;
        if (effectiveBillScreenshot !== undefined) record.billScreenshot = effectiveBillScreenshot;
        if (invoiceNumber !== undefined) record.invoiceNumber = invoiceNumber;
        if (notes !== undefined) record.notes = notes;

        const updatedRecord = await record.save();

        // If bill screenshot was replaced or removed, clean up old Cloudinary image
        if (previousBillScreenshot && effectiveBillScreenshot !== undefined && previousBillScreenshot !== effectiveBillScreenshot) {
            await deleteCloudinaryImagesNotUsedByProducts([previousBillScreenshot]);
        }

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

        // Clean up Cloudinary bill screenshot if attached
        if (record.billScreenshot) {
            await deleteCloudinaryImagesNotUsedByProducts([record.billScreenshot]);
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

