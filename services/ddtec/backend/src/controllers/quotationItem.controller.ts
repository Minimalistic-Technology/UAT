import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QuotationItem from '../models/QuotationItem';
import { deleteCloudinaryImagesNotUsedByProducts } from '../utils/cloudinaryCleanup';

export const getQuotationItems = async (req: Request, res: Response) => {
    try {
        const items = await QuotationItem.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err: any) {
        console.error('Error fetching quotation items:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

export const getAllQuotationItemsAdmin = async (req: Request, res: Response) => {
    try {
        const items = await QuotationItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err: any) {
        console.error('Error fetching admin quotation items:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

export const createQuotationItem = async (req: Request, res: Response) => {
    try {
        const { name, price, quantity, hsnCode, unit, description, image, product, cgst, sgst } = req.body;

        if (!name || String(name).trim() === '') {
            return res.status(400).json({ msg: 'Product name is required' });
        }

        if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
            return res.status(400).json({ msg: 'Valid product price is required' });
        }

        const numPrice = Number(price);
        if (numPrice <= 0) {
            return res.status(400).json({ msg: 'Price must be greater than 0' });
        }

        let numQuantity = 1;
        if (quantity !== undefined && quantity !== '') {
            numQuantity = Number(quantity);
            if (isNaN(numQuantity) || numQuantity < 1 || !Number.isInteger(numQuantity)) {
                return res.status(400).json({ msg: 'Quantity must be a whole number of 1 or more' });
            }
        }

        if (!unit || String(unit).trim() === '') {
            return res.status(400).json({ msg: 'Quantity unit is required' });
        }

        let numCgst = 0;
        if (cgst !== undefined && cgst !== '') {
            numCgst = Number(cgst);
            if (isNaN(numCgst) || numCgst < 0 || numCgst > 100) {
                return res.status(400).json({ msg: 'CGST must be between 0 and 100' });
            }
        }

        let numSgst = 0;
        if (sgst !== undefined && sgst !== '') {
            numSgst = Number(sgst);
            if (isNaN(numSgst) || numSgst < 0 || numSgst > 100) {
                return res.status(400).json({ msg: 'SGST must be between 0 and 100' });
            }
        }

        if (hsnCode && String(hsnCode).trim() !== '') {
            const hsn = String(hsnCode).trim();
            if (!/^\d+$/.test(hsn)) {
                return res.status(400).json({ msg: 'HSN / SAC code must contain digits only' });
            }
            if (hsn.length < 2 || hsn.length > 8) {
                return res.status(400).json({ msg: 'HSN / SAC code must be between 2 and 8 digits' });
            }
        }

        // Handle Cloudinary uploaded file
        let uploadedImage = image || '';
        if (req.file) {
            uploadedImage = (req.file as any).path || (req.file as any).secure_url || image || '';
        }

        const validProduct = (product && typeof product === 'string' && mongoose.isValidObjectId(product.trim())) ? product.trim() : undefined;

        const item = new QuotationItem({
            name: String(name).trim(),
            price: numPrice,
            quantity: numQuantity,
            hsnCode: hsnCode ? String(hsnCode).trim() : '',
            unit: unit ? String(unit).trim() : 'Nos',
            description: description ? String(description).trim() : '',
            image: uploadedImage,
            product: validProduct,
            cgst: numCgst,
            sgst: numSgst
        });
        await item.save();
        res.status(201).json(item);
    } catch (err: any) {
        console.error('Error creating quotation item:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

export const updateQuotationItem = async (req: Request, res: Response) => {
    try {
        const { name, price, quantity, hsnCode, unit, description, image, isActive, product, cgst, sgst } = req.body;

        if (name !== undefined && String(name).trim() === '') {
            return res.status(400).json({ msg: 'Product name cannot be empty' });
        }

        if (price !== undefined && price !== '') {
            const numPrice = Number(price);
            if (isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ msg: 'Price must be greater than 0' });
            }
        }

        if (quantity !== undefined && quantity !== '') {
            const numQty = Number(quantity);
            if (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty)) {
                return res.status(400).json({ msg: 'Quantity must be a whole number of 1 or more' });
            }
        }

        if (unit !== undefined && String(unit).trim() === '') {
            return res.status(400).json({ msg: 'Quantity unit cannot be empty' });
        }

        if (cgst !== undefined && cgst !== '') {
            const numCgst = Number(cgst);
            if (isNaN(numCgst) || numCgst < 0 || numCgst > 100) {
                return res.status(400).json({ msg: 'CGST must be between 0 and 100' });
            }
        }

        if (sgst !== undefined && sgst !== '') {
            const numSgst = Number(sgst);
            if (isNaN(numSgst) || numSgst < 0 || numSgst > 100) {
                return res.status(400).json({ msg: 'SGST must be between 0 and 100' });
            }
        }

        if (hsnCode !== undefined && String(hsnCode).trim() !== '') {
            const hsn = String(hsnCode).trim();
            if (!/^\d+$/.test(hsn)) {
                return res.status(400).json({ msg: 'HSN / SAC code must contain digits only' });
            }
            if (hsn.length < 2 || hsn.length > 8) {
                return res.status(400).json({ msg: 'HSN / SAC code must be between 2 and 8 digits' });
            }
        }

        const uploadedImage = (req.file as Express.Multer.File & { path?: string; secure_url?: string })?.path || (req.file as any)?.secure_url;
        const item = await QuotationItem.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        const previousImage = item.image;

        if (name !== undefined) item.name = String(name).trim();
        if (price !== undefined && price !== '') item.price = Number(price);
        if (quantity !== undefined && quantity !== '') item.quantity = Math.max(1, Number(quantity));
        if (hsnCode !== undefined) item.hsnCode = String(hsnCode).trim();
        if (unit !== undefined) item.unit = String(unit).trim();
        if (description !== undefined) item.description = String(description).trim();
        if (uploadedImage) {
            item.image = uploadedImage;
        } else if (image !== undefined) {
            item.image = image;
        }
        if (isActive !== undefined) item.isActive = Boolean(isActive === 'true' || isActive === true);
        if (product !== undefined) {
            item.product = (product && typeof product === 'string' && mongoose.isValidObjectId(product.trim())) ? product.trim() as any : undefined;
        }
        if (cgst !== undefined && cgst !== '') item.cgst = Number(cgst);
        if (sgst !== undefined && sgst !== '') item.sgst = Number(sgst);

        await item.save();

        // Clean up the replaced image, but only if it isn't the exact same Cloudinary asset a
        // live Product still uses — "Prefill from Product" copies a Product's image URL
        // verbatim onto a quotation item, so this item may never have "owned" that file.
        if (previousImage && previousImage !== item.image) {
            await deleteCloudinaryImagesNotUsedByProducts([previousImage]);
        }

        res.json(item);
    } catch (err: any) {
        console.error('Error updating quotation item:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

export const deleteQuotationItem = async (req: Request, res: Response) => {
    try {
        const item = await QuotationItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        // Same ownership caveat as updateQuotationItem: never delete an image a Product
        // still references, since "Prefill from Product" can leave a quotation item
        // pointing at the exact same Cloudinary asset.
        if (item.image) {
            await deleteCloudinaryImagesNotUsedByProducts([item.image]);
        }

        res.json({ msg: 'Item removed' });
    } catch (err: any) {
        console.error('Error deleting quotation item:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

