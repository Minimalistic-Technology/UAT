import { Request, Response } from 'express';
import Product from '../models/Product';
import Hub from '../models/Hub';
import WarehouseStock from '../models/WarehouseStock';
import redisClient from '../config/redis';

// Helper to invalidate all product caches instantly
const clearProductCache = async () => {
    try {
        await redisClient.del('products:all', 'products:home');
    } catch (err) {
        console.error('Failed to clear product cache:', err);
    }
};
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { showOnHome, pincode } = req.query;

        let cacheKey = showOnHome === 'true' ? 'products:home' : 'products:all';
        if (pincode) cacheKey = `products:pin:${pincode}:${showOnHome || 'all'}`;

        // 1. CACHE CHECK: Ask Redis first (Takes <1ms)
        let cachedProducts = null;
        try {
            cachedProducts = await redisClient.get(cacheKey);
            if (cachedProducts) {
                return res.json(JSON.parse(cachedProducts));
            }
        } catch (redisErr) {
            console.error('Redis cache unavailable, falling back to MongoDB...');
        }

        // 2. FETCH BASE CATALOG
        const filter: any = {};
        if (showOnHome === 'true') {
            filter.showOnHome = true;
        }

        let products: any = await Product.find(filter).sort({ createdAt: -1 }).populate('category', 'name');

        // 3. APPLY BLINKIT-STYLE HYPER-LOCAL STOCK LIMITS
        if (pincode && typeof pincode === 'string') {
            // Find which hub serves this pincode
            const hub = await Hub.findOne({ pincodes: pincode.trim(), isActive: true });

            if (hub) {
                // Fetch physical rack stocks belonging to THIS hub only
                const localStocks = await WarehouseStock.find({ warehouseName: hub.name });

                products = products.map((prod: any) => {
                    const prodObj = prod.toObject();
                    // Calculate total stock for this product across all racks in this specific Hub
                    const hubSpecificStockObj = localStocks.filter(s => s.product.toString() === prodObj._id.toString());
                    const localizedAvailableQuantity = hubSpecificStockObj.reduce((sum, s) => sum + s.quantity, 0);

                    prodObj.stock = localizedAvailableQuantity; // Override global DB stock with hyper-local reality
                    prodObj.hubId = hub._id;
                    prodObj.hubName = hub.name;
                    prodObj.inStock = localizedAvailableQuantity > 0;
                    return prodObj;
                });
            } else {
                // If NO hub serves this pincode, everything is Out of Stock!
                products = products.map((prod: any) => {
                    const prodObj = prod.toObject();
                    prodObj.stock = 0;
                    prodObj.inStock = false;
                    prodObj.unserviceable = true; // Flag for UI to say "We don't deliver here yet"
                    return prodObj;
                });
            }
        }

        // 4. STORE IN CACHE
        try {
            await redisClient.set(cacheKey, JSON.stringify(products), 'EX', 1800); // 30 min cache for local stock
        } catch (e) { }

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

// Fields that must never be negative
const NON_NEGATIVE_FIELDS = ['price', 'costPrice', 'stock', 'discountPercentage', 'discountValue', 'cgst', 'sgst'] as const;

const findNegativeField = (body: Record<string, any>) =>
    NON_NEGATIVE_FIELDS.find((field) => body[field] !== undefined && Number(body[field]) < 0);

export const createProduct = async (req: Request, res: Response) => {
    try {
        const negativeField = findNegativeField(req.body);
        if (negativeField) {
            return res.status(400).json({ msg: `${negativeField} cannot be negative` });
        }

        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome, cgst, sgst, costPrice } = req.body;

        const newProduct = new Product({
            name,
            price,
            costPrice: costPrice || 0,
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
            showOnHome: showOnHome || false,
            cgst: cgst || 0,
            sgst: sgst || 0
        });

        const product = await newProduct.save();

        // 4. INVALIDATE CACHE: Someone added a new product, wipe old list!
        await clearProductCache();

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const negativeField = findNegativeField(req.body);
        if (negativeField) {
            return res.status(400).json({ msg: `${negativeField} cannot be negative` });
        }

        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome, cgst, sgst, costPrice } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        product.name = name || product.name;
        product.price = price || product.price;
        product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
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
        product.cgst = cgst !== undefined ? cgst : product.cgst;
        product.sgst = sgst !== undefined ? sgst : product.sgst;

        await product.save();

        // 4. INVALIDATE CACHE: Product modified (price/stock etc changed), wipe old list!
        await clearProductCache();

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

        // 4. INVALIDATE CACHE: Product deleted, wipe old list!
        await clearProductCache();

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

        // 4. INVALIDATE CACHE: Status toggled, wipe old list!
        await clearProductCache();

        res.json({ msg: `Product ${product.isActive ? 'activated' : 'deactivated'}`, isActive: product.isActive });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
