import { Request, Response } from 'express';
import Product from '../models/Product';
import { uploadImage, deleteImage } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, slug, description, category, price, stock, brand, sku } = req.body;
        let imageUrls: string[] = [];

        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const result = await uploadImage(file.path, 'products');
                imageUrls.push(result.secure_url);
                fs.unlinkSync(file.path); // remove locally
            }
        }

        const product = new Product({
            title,
            slug: req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
            description,
            category: req.body.category || 'General',
            price: Number(price),
            stock: req.body.stock ? Number(req.body.stock) : 10,
            sku: req.body.sku || 'SKU-' + Date.now(),
            images: imageUrls,
            thumbnail: imageUrls[0] || '',
            createdBy: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.title = req.body.title || product.title;
            product.slug = req.body.slug || product.slug;
            product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
            product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // In a real app we might carefully delete images from cloudinary too by extracting publicId
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
