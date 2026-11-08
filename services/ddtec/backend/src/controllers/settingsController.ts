import { Request, Response } from 'express';
import Settings, { DEFAULT_SELLER_DETAILS } from '../models/Settings';
import RouteConfig from '../models/RouteConfig';
import { getCache, setCache, delCache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';
import { deleteCloudinaryImages } from '../utils/cloudinaryCleanup';
import { validateSellerDetails } from '../utils/invoiceValidation';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const cached = await getCache(CACHE_KEYS.SETTINGS);
        if (cached) {
            res.status(200).json(cached);
            return;
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        await setCache(CACHE_KEYS.SETTINGS, settings, CACHE_TTL.SETTINGS);
        res.status(200).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { components, onboarding, delivery, quotationLogoUrl, sellerDetails } = req.body;
        let settings = await Settings.findOne();

        if (sellerDetails) {
            const validation = validateSellerDetails(sellerDetails);
            if (!validation.valid) {
                res.status(400).json({ msg: validation.error });
                return;
            }
        }

        if (!settings) {
            settings = await Settings.create({ components, onboarding, delivery, quotationLogoUrl, sellerDetails });
        } else {
            if (components) {
                const currentComponents = (settings.components as any)?.toObject ? (settings.components as any).toObject() : (settings.components || {});
                settings.components = { ...currentComponents, ...components };
                settings.markModified('components');
            }
            if (onboarding) {
                const currentOnboarding = (settings.onboarding as any)?.toObject ? (settings.onboarding as any).toObject() : (settings.onboarding || {});
                settings.onboarding = { ...currentOnboarding, ...onboarding };
                settings.markModified('onboarding');
            }
            if (delivery) {
                const currentDelivery = (settings.delivery as any)?.toObject ? (settings.delivery as any).toObject() : (settings.delivery || {});
                settings.delivery = { ...currentDelivery, ...delivery };
                settings.markModified('delivery');
            }
            if (quotationLogoUrl !== undefined) {
                settings.quotationLogoUrl = quotationLogoUrl;
            }
            if (sellerDetails) {
                const validation = validateSellerDetails(sellerDetails);
                if (validation.valid) {
                    const currentSeller = (settings.sellerDetails as any)?.toObject
                        ? (settings.sellerDetails as any).toObject()
                        : (settings.sellerDetails || DEFAULT_SELLER_DETAILS);
                    settings.sellerDetails = { ...currentSeller, ...validation.sanitized };
                    settings.markModified('sellerDetails');
                }
            }
            await settings.save();
        }

        // Sync route config path /signup based on onboarding mode
        if (settings.onboarding && settings.onboarding.mode === 'closed') {
            await RouteConfig.updateOne({ path: '/signup' }, { isActive: false });
        } else {
            await RouteConfig.updateOne({ path: '/signup' }, { isActive: true });
        }

        // Invalidate caches touched by this update
        await delCache(CACHE_KEYS.SETTINGS, CACHE_KEYS.ROUTES);

        res.status(200).json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const uploadQuotationLogo = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ msg: "No logo file uploaded" });
            return;
        }

        const uploadedUrl = (req.file as any).path || (req.file as any).secure_url;
        if (!uploadedUrl) {
            res.status(400).json({ msg: "Failed to upload logo image to Cloudinary" });
            return;
        }

        let settings = await Settings.findOne();
        let oldLogoUrl = '';

        if (!settings) {
            settings = await Settings.create({ quotationLogoUrl: uploadedUrl });
        } else {
            oldLogoUrl = settings.quotationLogoUrl || '';
            settings.quotationLogoUrl = uploadedUrl;
            await settings.save();
        }

        // Clean up previous logo from Cloudinary if it was hosted there
        if (oldLogoUrl && oldLogoUrl !== uploadedUrl) {
            await deleteCloudinaryImages([oldLogoUrl]);
        }

        await delCache(CACHE_KEYS.SETTINGS);

        res.status(200).json({
            success: true,
            msg: "Quotation logo uploaded to Cloudinary successfully!",
            quotationLogoUrl: uploadedUrl,
            settings
        });
    } catch (error: any) {
        console.error("Error uploading quotation logo:", error);
        res.status(500).json({ msg: error.message || "Internal Server Error" });
    }
};

export const removeQuotationLogo = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (settings && settings.quotationLogoUrl) {
            const oldLogoUrl = settings.quotationLogoUrl;
            settings.quotationLogoUrl = '';
            await settings.save();
            await deleteCloudinaryImages([oldLogoUrl]);
            await delCache(CACHE_KEYS.SETTINGS);
        }
        res.status(200).json({
            success: true,
            msg: "Quotation logo removed successfully!",
            quotationLogoUrl: ''
        });
    } catch (error: any) {
        console.error("Error removing quotation logo:", error);
        res.status(500).json({ msg: error.message || "Internal Server Error" });
    }
};

/**
 * @route   GET /settings/seller-details (and /seller-details)
 * @desc    Get current official seller details for invoices and quotations
 * @access  Public / Authenticated
 */
export const getSellerDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        const seller = settings.sellerDetails?.name
            ? ((settings.sellerDetails as any).toObject ? (settings.sellerDetails as any).toObject() : settings.sellerDetails)
            : DEFAULT_SELLER_DETAILS;

        res.status(200).json({
            success: true,
            sellerDetails: seller
        });
    } catch (error: any) {
        console.error("Error fetching seller details:", error);
        res.status(500).json({ msg: error.message || "Internal Server Error" });
    }
};

/**
 * @route   PUT /settings/seller-details (and POST /settings/seller-details)
 * @desc    Update or create official seller details
 * @access  Admin / System Admin
 */
export const updateSellerDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateSellerDetails(req.body);
        if (!validation.valid) {
            res.status(400).json({ msg: validation.error });
            return;
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ sellerDetails: validation.sanitized });
        } else {
            const currentSeller = (settings.sellerDetails as any)?.toObject
                ? (settings.sellerDetails as any).toObject()
                : (settings.sellerDetails || DEFAULT_SELLER_DETAILS);

            settings.sellerDetails = {
                ...currentSeller,
                ...validation.sanitized
            };
            settings.markModified('sellerDetails');
            await settings.save();
        }

        await delCache(CACHE_KEYS.SETTINGS);

        res.status(200).json({
            success: true,
            msg: "Seller details updated successfully",
            sellerDetails: settings.sellerDetails
        });
    } catch (error: any) {
        console.error("Error updating seller details:", error);
        res.status(500).json({ msg: error.message || "Internal Server Error" });
    }
};

/**
 * @route   DELETE /settings/seller-details (and /seller-details)
 * @desc    Reset seller details back to system default configuration
 * @access  Admin / System Admin
 */
export const resetSellerDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ sellerDetails: DEFAULT_SELLER_DETAILS });
        } else {
            settings.sellerDetails = { ...DEFAULT_SELLER_DETAILS };
            settings.markModified('sellerDetails');
            await settings.save();
        }

        await delCache(CACHE_KEYS.SETTINGS);

        res.status(200).json({
            success: true,
            msg: "Seller details reset to default successfully",
            sellerDetails: settings.sellerDetails
        });
    } catch (error: any) {
        console.error("Error resetting seller details:", error);
        res.status(500).json({ msg: error.message || "Internal Server Error" });
    }
};

