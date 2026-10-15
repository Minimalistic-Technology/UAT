import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'quotation-items',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    } as any
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

export const uploadQuotationItemImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadQuotationItemImageMiddleware = (req: any, res: any, next: any) => {
    uploadQuotationItemImage.single('image')(req, res, (err: any) => {
        if (err) {
            console.error('[UPLOAD ERROR] Quotation item image upload error:', err);
            return res.status(400).json({ msg: err.message || 'Failed to upload quotation item image' });
        }
        next();
    });
};

const productImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    } as any
});

export const uploadProductImages = multer({
    storage: productImageStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadProductImagesMiddleware = (req: any, res: any, next: any) => {
    uploadProductImages.array('images', 6)(req, res, (err: any) => {
        if (err) {
            console.error('[UPLOAD ERROR] Product image upload error:', err);
            return res.status(400).json({ msg: err.message || 'Failed to upload product image(s)' });
        }
        next();
    });
};

const blogImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'blogs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    } as any
});

export const uploadBlogImage = multer({
    storage: blogImageStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadBlogImageMiddleware = (req: any, res: any, next: any) => {
    uploadBlogImage.single('image')(req, res, (err: any) => {
        if (err) {
            console.error('[UPLOAD ERROR] Blog image upload error:', err);
            return res.status(400).json({ msg: err.message || 'Failed to upload blog image' });
        }
        next();
    });
};

const purchaseImageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: Express.Multer.File) => {
        const folder = file.fieldname === 'billScreenshot' || req.query?.folder === 'purchases' || req.body?.folder === 'purchases'
            ? 'purchases'
            : 'products';
        return {
            folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        };
    }
});

export const uploadPurchaseImages = multer({
    storage: purchaseImageStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadPurchaseImagesMiddleware = (req: any, res: any, next: any) => {
    uploadPurchaseImages.fields([
        { name: 'image', maxCount: 1 },
        { name: 'billScreenshot', maxCount: 1 }
    ])(req, res, (err: any) => {
        if (err) {
            console.error('[UPLOAD ERROR] Purchase images upload error:', err);
            return res.status(400).json({ msg: err.message || 'Failed to upload image(s)' });
        }
        next();
    });
};

export const uploadSinglePurchaseImageMiddleware = (req: any, res: any, next: any) => {
    uploadPurchaseImages.fields([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
        { name: 'billScreenshot', maxCount: 1 }
    ])(req, res, (err: any) => {
        if (err) {
            console.error('[UPLOAD ERROR] Single purchase image upload error:', err);
            return res.status(400).json({ msg: err.message || 'Failed to upload image' });
        }
        next();
    });
};

