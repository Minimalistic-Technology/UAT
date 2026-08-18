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

