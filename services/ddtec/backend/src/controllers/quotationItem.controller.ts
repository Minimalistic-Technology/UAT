import { Request, Response } from 'express';
import QuotationItem from '../models/QuotationItem';

export const getQuotationItems = async (req: Request, res: Response) => {
    try {
        const items = await QuotationItem.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getAllQuotationItemsAdmin = async (req: Request, res: Response) => {
    try {
        const items = await QuotationItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const createQuotationItem = async (req: Request, res: Response) => {
    try {
        const { name, price, hsnCode, unit, description, image } = req.body;
        const uploadedImage = (req.file as Express.Multer.File & { path?: string })?.path;
        const item = new QuotationItem({ name, price, hsnCode, unit, description, image: uploadedImage ?? image });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const updateQuotationItem = async (req: Request, res: Response) => {
    try {
        const { name, price, hsnCode, unit, description, image, isActive } = req.body;
        const uploadedImage = (req.file as Express.Multer.File & { path?: string })?.path;
        const item = await QuotationItem.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        item.name = name ?? item.name;
        item.price = price ?? item.price;
        item.hsnCode = hsnCode ?? item.hsnCode;
        item.unit = unit ?? item.unit;
        item.description = description ?? item.description;
        item.image = uploadedImage ?? image ?? item.image;
        item.isActive = isActive ?? item.isActive;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const deleteQuotationItem = async (req: Request, res: Response) => {
    try {
        const item = await QuotationItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        res.json({ msg: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
