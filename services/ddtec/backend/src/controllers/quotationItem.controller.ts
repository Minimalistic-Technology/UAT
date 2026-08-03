import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QuotationItem from '../models/QuotationItem';

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
        const { name, price, hsnCode, unit, description, image, product, cgst, sgst } = req.body;

        if (!name || String(name).trim() === '') {
            return res.status(400).json({ msg: 'Product name is required' });
        }

        if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
            return res.status(400).json({ msg: 'Valid product price is required' });
        }

        const numPrice = Number(price);
        const numCgst = (cgst !== undefined && cgst !== '' && !isNaN(Number(cgst))) ? Number(cgst) : 0;
        const numSgst = (sgst !== undefined && sgst !== '' && !isNaN(Number(sgst))) ? Number(sgst) : 0;

        if (numPrice < 0 || numCgst < 0 || numSgst < 0) {
            return res.status(400).json({ msg: 'Price, CGST and SGST cannot be negative' });
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
        const { name, price, hsnCode, unit, description, image, isActive, product, cgst, sgst } = req.body;

        if ((price !== undefined && price !== '' && (isNaN(Number(price)) || Number(price) < 0)) ||
            (cgst !== undefined && cgst !== '' && (isNaN(Number(cgst)) || Number(cgst) < 0)) ||
            (sgst !== undefined && sgst !== '' && (isNaN(Number(sgst)) || Number(sgst) < 0))) {
            return res.status(400).json({ msg: 'Price, CGST and SGST cannot be negative' });
        }

        const uploadedImage = (req.file as Express.Multer.File & { path?: string; secure_url?: string })?.path || (req.file as any)?.secure_url;
        const item = await QuotationItem.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        if (name !== undefined) item.name = String(name).trim();
        if (price !== undefined && price !== '') item.price = Number(price);
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
        res.json({ msg: 'Item removed' });
    } catch (err: any) {
        console.error('Error deleting quotation item:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

