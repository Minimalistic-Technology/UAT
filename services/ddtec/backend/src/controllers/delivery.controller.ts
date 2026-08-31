import { Request, Response } from 'express';
import DeliveryService from '../services/delivery.service';

/**
 * Check delivery serviceability for a given pincode
 * Supports GET /api/delivery/check-pincode?pincode=400001
 * Supports GET /api/delivery/check/:pincode
 * Supports POST /api/delivery/check-serviceability
 */
export const checkPincodeServiceability = async (req: Request, res: Response): Promise<void> => {
    try {
        const pincode = req.query.pincode || req.params.pincode || req.body.pincode;

        if (!pincode) {
            res.status(400).json({
                success: false,
                serviceable: false,
                message: 'Pincode is required to check delivery serviceability.'
            });
            return;
        }

        const result = await DeliveryService.checkServiceability(pincode.toString());

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (error: any) {
        console.error('[DELIVERY-CONTROLLER-ERROR] Error checking serviceability:', error);
        res.status(500).json({
            success: false,
            serviceable: false,
            message: 'Internal server error checking delivery serviceability.',
            error: error?.message
        });
    }
};

/**
 * Get all available delivery courier partners
 * GET /api/delivery/partners
 */
export const getDeliveryPartners = async (req: Request, res: Response): Promise<void> => {
    try {
        const partners = [
            {
                name: 'Blue Dart Express',
                code: 'BLUEDART',
                isDefault: true,
                description: 'India’s premier air and surface express courier network offering swift door-to-door transit.',
                services: ['Blue Dart Apex (Air)', 'Blue Dart Surfaceline', 'Cash on Delivery (COD)', 'Doorstep Inspection'],
                coverage: 'Over 55,000+ PIN locations across India',
                trackingUrlPattern: 'https://www.bluedart.com/tracking?trackNumber={AWB}'
            },
            {
                name: 'DTDC Courier & Cargo',
                code: 'DTDC',
                isDefault: false,
                description: 'Extensive national courier network providing reliable Ground and Air priority distribution.',
                services: ['DTDC Prime', 'DTDC Plus', 'DTDC Lite Cargo', 'Cash on Delivery (COD)'],
                coverage: 'Nationwide coverage across 14,000+ pin code hubs',
                trackingUrlPattern: 'https://www.dtdc.in/tracking/shipment-tracking.asp?awb={AWB}'
            }
        ];

        res.status(200).json({
            success: true,
            defaultPartner: 'BLUEDART',
            partners
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery partners',
            error: error?.message
        });
    }
};

/**
 * Calculate real-time carrier freight rates based on destination pincode and total consignment weight
 * POST /api/delivery/calculate-rates
 * GET /api/delivery/calculate-rates?pincode=400001&weight=25
 */
export const calculateCarrierRatesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const pincode = req.body?.pincode || req.query?.pincode;
        let weightKg = Number(req.body?.weightKg || req.query?.weightKg || req.query?.weight);
        const items = req.body?.items;

        if (!pincode) {
            res.status(400).json({
                success: false,
                message: 'Pincode is required to calculate carrier freight rates.'
            });
            return;
        }

        // If items list is passed without explicit weight, compute from DB products
        if ((!weightKg || isNaN(weightKg) || weightKg <= 0) && Array.isArray(items) && items.length > 0) {
            const Product = (await import('../models/Product')).default;
            let computedWeight = 0;
            for (const item of items) {
                const pId = item.product?._id || item.product || item._id;
                const qty = Number(item.quantity) || 1;
                if (pId) {
                    const prod = await Product.findById(pId).select('weightKg');
                    const singleWeight = prod?.weightKg || 0.5;
                    computedWeight += singleWeight * qty;
                }
            }
            weightKg = Math.max(0.5, computedWeight);
        }

        if (!weightKg || isNaN(weightKg) || weightKg <= 0) {
            weightKg = 1.0;
        }

        const ratesResponse = await DeliveryService.calculateCarrierRates(pincode.toString(), weightKg);
        res.status(200).json(ratesResponse);
    } catch (error: any) {
        console.error('[DELIVERY-CONTROLLER-ERROR] Error calculating carrier rates:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error calculating carrier rates.',
            error: error?.message
        });
    }
};

/**
 * Get curated popular Indian pincodes for quick selection
 * GET /api/delivery/pincodes/popular
 */
export const getPopularPincodes = async (_req: Request, res: Response): Promise<void> => {
    try {
        const popular = DeliveryService.getPopularPincodes();
        res.status(200).json({
            success: true,
            pincodes: popular
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching popular pincodes',
            error: error?.message
        });
    }
};
