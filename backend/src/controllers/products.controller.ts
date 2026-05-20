import { Request, Response } from 'express';
import Product from '../models/Product';


export const getProducts = async (req: Request, res: Response) => {
    try {
        const { showOnHome } = req.query;
        const filter: any = {};
        if (showOnHome === 'true') {
            filter.showOnHome = true;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 }).populate('category', 'name');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err: any) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome } = req.body;

        const newProduct = new Product({
            name,
            price,
            description,
            image,
            images: images || [],
            category,
            stock: stock || 0,
            rating: req.body.rating || 0,
            lastMonthSales: req.body.lastMonthSales || 0,
            brand: brand || '',
            modelName: modelName || '',
            couponCode: couponCode || undefined,
            discountPercentage: discountPercentage || 0,
            discountType: discountType || 'percentage',
            discountValue: discountValue || 0,
            showOnHome: showOnHome || false
        });

        const product = await newProduct.save();

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.images = images || product.images;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.rating = req.body.rating !== undefined ? req.body.rating : product.rating;
        product.lastMonthSales = req.body.lastMonthSales !== undefined ? req.body.lastMonthSales : product.lastMonthSales;
        product.brand = brand || product.brand;
        product.modelName = modelName || product.modelName;
        product.couponCode = couponCode !== undefined ? couponCode : product.couponCode;
        product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
        product.discountType = discountType || product.discountType;
        product.discountValue = discountValue !== undefined ? discountValue : product.discountValue;
        product.showOnHome = showOnHome !== undefined ? showOnHome : product.showOnHome;

        await product.save();

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        // Optional: Delete associated coupon?
        // await Coupon.deleteOne({ code: product.couponCode, type: 'product-specific' });

        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const toggleProductStatus = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        product.isActive = !product.isActive;
        await product.save();

        res.json({ msg: `Product ${product.isActive ? 'activated' : 'deactivated'}`, isActive: product.isActive });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
