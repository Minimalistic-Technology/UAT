import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import Hub from '../models/Hub';
import WarehouseStock from '../models/WarehouseStock';
import redisClient from '../config/redis';
import cloudinary from '../config/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const STAFF_ROLES = ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support', 'finance', 'marketing', 'warehouse'];

// These endpoints are public (no `auth` middleware), so a request may or may not carry a
// staff token. When it does and it's valid, treat the caller as staff so admin product
// management can still see/edit inactive products; everyone else only ever sees active ones.
const isStaffRequest = (req: Request): boolean => {
    const token = (req as any).cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return false;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return STAFF_ROLES.includes(decoded?.role);
    } catch {
        return false;
    }
};

// Helper to invalidate all product caches instantly (base + hyper-local pincode keys)
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
// Normalizes a form field that may arrive as undefined, a single string, or an array of
// strings (multipart forms collapse a single repeated field to a plain string).
const normalizeToStringArray = (value: unknown): string[] => {
    if (value === undefined || value === null) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(v => String(v).trim()).filter(Boolean);
};

const extractUploadedImageUrls = (req: Request): string[] => {
    const files = (req.files as Express.Multer.File[]) || [];
    return files.map(f => (f as any).path || (f as any).secure_url).filter(Boolean);
};

// Pulls the Cloudinary public_id (e.g. "products/abc123") out of a secure_url so it can be
// passed to uploader.destroy. Returns null for anything not actually hosted on Cloudinary
// (e.g. a manually-pasted external image URL), which must never be sent to destroy().
const extractCloudinaryPublicId = (url: string): string | null => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return null;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
    return withoutExtension || null;
};

// Best-effort delete of Cloudinary-hosted product images; failures are logged, not thrown,
// so a Cloudinary outage never blocks the product delete/update itself.
const deleteCloudinaryImages = async (urls: string[]) => {
    const publicIds = Array.from(new Set(urls.map(extractCloudinaryPublicId).filter((id): id is string => Boolean(id))));
    if (!publicIds.length) return;
    await Promise.all(publicIds.map(async (id) => {
        try {
            await cloudinary.uploader.destroy(id);
        } catch (err) {
            console.error(`Failed to delete Cloudinary image "${id}":`, err);
        }
    }));
};

// `highlights` arrives as a JSON-encoded string (multipart forms can't carry nested
// objects natively); fall back to [] for anything missing/unparsable/malformed.
const parseHighlights = (value: unknown): Array<{ icon: string; title: string; description: string; color: string }> => {
    if (value === undefined || value === null || value === '') return [];
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((h) => h && typeof h.title === 'string' && h.title.trim())
            .map((h) => ({
                icon: typeof h.icon === 'string' && h.icon.trim() ? h.icon.trim() : 'ShieldCheck',
                title: String(h.title).trim(),
                description: typeof h.description === 'string' ? h.description.trim() : '',
                color: typeof h.color === 'string' && h.color.trim() ? h.color.trim() : 'teal'
            }));
    } catch {
        return [];
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { showOnHome, pincode } = req.query;
        const staffRequest = isStaffRequest(req);

        let cacheKey = showOnHome === 'true' ? 'products:home' : 'products:all';
        if (pincode) cacheKey = `products:pin:${pincode}:${showOnHome || 'all'}`;

        // Staff (admin/product manager/etc.) must always see the live, unfiltered catalog —
        // including inactive products — for management, so skip the shared public cache
        // entirely for them (both read and write) rather than risk it serving inactive
        // products to shoppers or a stale filtered list back to staff.
        if (!staffRequest) {
            // 1. CACHE CHECK: Ask Redis first (Takes <1ms)
            try {
                const cachedProducts = await redisClient.get(cacheKey);
                if (cachedProducts) {
                    return res.json(JSON.parse(cachedProducts));
                }
            } catch (redisErr) {
                console.error('Redis cache unavailable, falling back to MongoDB...');
            }
        }

        // 2. FETCH BASE CATALOG
        const filter: any = {};
        if (showOnHome === 'true') {
            filter.showOnHome = true;
        }
        if (!staffRequest) {
            filter.isActive = true;
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

        // 4. STORE IN CACHE (public/active-only results only — see note above)
        if (!staffRequest) {
            try {
                await redisClient.set(cacheKey, JSON.stringify(products), 'EX', 1800); // 30 min cache for local stock
            } catch (e) { }
        }

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
        if (!product.isActive && !isStaffRequest(req)) {
            return res.status(404).json({ msg: 'Product not found' });
        }
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
const NON_NEGATIVE_FIELDS = ['price', 'costPrice', 'stock', 'discountPercentage', 'discountValue', 'cgst', 'sgst', 'weightKg', 'lengthCm', 'widthCm', 'heightCm', 'packQuantity', 'unitSize'] as const;

const findNegativeField = (body: Record<string, any>) =>
    NON_NEGATIVE_FIELDS.find((field) => body[field] !== undefined && Number(body[field]) < 0);

export const createProduct = async (req: Request, res: Response) => {
    try {
        const negativeField = findNegativeField(req.body);
        if (negativeField) {
            return res.status(400).json({ msg: `${negativeField} cannot be negative` });
        }

        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome, codAvailable, cgst, sgst, costPrice, weightKg, lengthCm, widthCm, heightCm, productType, isReturnable, showDeliveryChecker, customDeliveryEstimate, packQuantity, packUnit, unitSize, unitMeasure, showAddToCart, showBuyNow, seller } = req.body;
        const allowedCourierPartners = normalizeToStringArray(req.body.allowedCourierPartners);
        const highlights = parseHighlights(req.body.highlights);

        // Combine manually entered image URLs (`imageUrls`) with newly uploaded files,
        // uploaded to Cloudinary by `uploadProductImagesMiddleware` above this handler.
        const manualImageUrls = normalizeToStringArray(req.body.imageUrls);
        const uploadedImageUrls = extractUploadedImageUrls(req);
        const allImages = manualImageUrls.length || uploadedImageUrls.length
            ? [...manualImageUrls, ...uploadedImageUrls]
            : (images || []);

        const newProduct = new Product({
            name,
            price,
            costPrice: costPrice || 0,
            description,
            image: allImages[0] || image || '',
            images: allImages,
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
            codAvailable: codAvailable !== undefined ? codAvailable !== 'false' && codAvailable !== false : true,
            cgst: cgst || 0,
            sgst: sgst || 0,
            weightKg: weightKg || 0.5,
            lengthCm: lengthCm || 10,
            widthCm: widthCm || 10,
            heightCm: heightCm || 10,
            productType: productType === 'digital' ? 'digital' : 'physical',
            isReturnable: isReturnable !== undefined ? isReturnable !== 'false' && isReturnable !== false : true,
            showDeliveryChecker: showDeliveryChecker !== undefined ? showDeliveryChecker !== 'false' && showDeliveryChecker !== false : true,
            allowedCourierPartners: allowedCourierPartners.length ? allowedCourierPartners : ['BLUEDART', 'DTDC'],
            customDeliveryEstimate: customDeliveryEstimate || '',
            packQuantity: packQuantity || 1,
            packUnit: packUnit || 'Piece',
            unitSize: unitSize || 0,
            unitMeasure: unitMeasure || '',
            showAddToCart: showAddToCart !== undefined ? showAddToCart !== 'false' && showAddToCart !== false : true,
            showBuyNow: showBuyNow !== undefined ? showBuyNow !== 'false' && showBuyNow !== false : true,
            seller: seller || '',
            highlights
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

        const { name, price, description, image, images, category, stock, brand, modelName, couponCode, discountPercentage, discountType, discountValue, showOnHome, codAvailable, cgst, sgst, costPrice, weightKg, lengthCm, widthCm, heightCm, productType, isReturnable, showDeliveryChecker, customDeliveryEstimate, packQuantity, packUnit, unitSize, unitMeasure, showAddToCart, showBuyNow, seller } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        // Only touch images when the request actually carries image data — the edit form
        // marks this explicitly with `imagesFieldPresent` since it always resubmits the
        // full desired image list (so removing every tag intentionally clears images too).
        // Other callers (e.g. a stock-only PATCH from the warehouse view) never set this
        // and must leave existing images untouched.
        const manualImageUrls = normalizeToStringArray(req.body.imageUrls);
        const uploadedImageUrls = extractUploadedImageUrls(req);
        const imagesSubmitted = req.body.imagesFieldPresent === 'true' || uploadedImageUrls.length > 0;
        if (imagesSubmitted) {
            const allImages = [...manualImageUrls, ...uploadedImageUrls];
            const previousImages = [...(product.images || []), product.image].filter(Boolean);
            const removedImages = previousImages.filter((url) => !allImages.includes(url));
            await deleteCloudinaryImages(removedImages);
            product.images = allImages;
            product.image = allImages[0] || '';
        } else if (images !== undefined) {
            product.images = images;
            product.image = image || product.image;
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
        product.description = description || product.description;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.rating = req.body.rating !== undefined ? req.body.rating : product.rating;
        product.lastMonthSales = req.body.lastMonthSales !== undefined ? req.body.lastMonthSales : product.lastMonthSales;
        product.brand = brand || product.brand;
        product.modelName = modelName || product.modelName;
        product.seller = seller !== undefined ? seller : product.seller;
        product.couponCode = couponCode !== undefined ? couponCode : product.couponCode;
        product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
        product.discountType = discountType || product.discountType;
        product.discountValue = discountValue !== undefined ? discountValue : product.discountValue;
        product.showOnHome = showOnHome !== undefined ? showOnHome : product.showOnHome;
        product.codAvailable = codAvailable !== undefined ? (codAvailable !== 'false' && codAvailable !== false) : product.codAvailable;
        product.cgst = cgst !== undefined ? cgst : product.cgst;
        product.sgst = sgst !== undefined ? sgst : product.sgst;
        product.weightKg = weightKg !== undefined ? weightKg : product.weightKg;
        product.lengthCm = lengthCm !== undefined ? lengthCm : product.lengthCm;
        product.widthCm = widthCm !== undefined ? widthCm : product.widthCm;
        product.heightCm = heightCm !== undefined ? heightCm : product.heightCm;
        product.productType = productType !== undefined ? (productType === 'digital' ? 'digital' : 'physical') : product.productType;
        product.isReturnable = isReturnable !== undefined ? (isReturnable !== 'false' && isReturnable !== false) : product.isReturnable;
        product.showDeliveryChecker = showDeliveryChecker !== undefined ? (showDeliveryChecker !== 'false' && showDeliveryChecker !== false) : product.showDeliveryChecker;
        product.customDeliveryEstimate = customDeliveryEstimate !== undefined ? customDeliveryEstimate : product.customDeliveryEstimate;
        product.packQuantity = packQuantity !== undefined ? packQuantity : product.packQuantity;
        product.packUnit = packUnit !== undefined ? packUnit : product.packUnit;
        product.unitSize = unitSize !== undefined ? unitSize : product.unitSize;
        product.unitMeasure = unitMeasure !== undefined ? unitMeasure : product.unitMeasure;
        product.showAddToCart = showAddToCart !== undefined ? (showAddToCart !== 'false' && showAddToCart !== false) : product.showAddToCart;
        product.showBuyNow = showBuyNow !== undefined ? (showBuyNow !== 'false' && showBuyNow !== false) : product.showBuyNow;
        if (req.body.allowedCourierPartners !== undefined) {
            const allowedCourierPartners = normalizeToStringArray(req.body.allowedCourierPartners);
            product.allowedCourierPartners = allowedCourierPartners.length ? allowedCourierPartners : ['BLUEDART', 'DTDC'];
        }
        if (req.body.highlights !== undefined) {
            product.highlights = parseHighlights(req.body.highlights);
        }

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
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        // Find every coupon that references this product before it's gone, so we can pull
        // the reference out rather than leave coupons pointing at a deleted product.
        const linkedCoupons = await Coupon.find({ applicableProducts: product._id });

        await Product.findByIdAndDelete(req.params.id);

        const affectedCoupons: { code: string; deactivated: boolean }[] = [];
        for (const coupon of linkedCoupons) {
            coupon.applicableProducts = coupon.applicableProducts.filter(
                (id) => id.toString() !== (product._id as any).toString()
            );
            // A `type: 'product'` coupon with no applicable products left can never validate
            // against a cart (see validateCoupon) — deactivate it instead of leaving a
            // silently-dead coupon active in the admin's coupon list.
            const deactivated = coupon.type === 'product' && coupon.applicableProducts.length === 0;
            if (deactivated) coupon.isActive = false;
            await coupon.save();
            affectedCoupons.push({ code: coupon.code, deactivated });
        }

        await deleteCloudinaryImages([...(product.images || []), product.image].filter(Boolean));

        // 4. INVALIDATE CACHE: Product deleted, wipe old list!
        await clearProductCache();

        res.json({ msg: 'Product removed', affectedCoupons });
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
