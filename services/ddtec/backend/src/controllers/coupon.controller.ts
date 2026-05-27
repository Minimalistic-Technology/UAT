import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import Product from '../models/Product';

// Generate a random 10-digit alphanumeric code
const generateCouponCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const getCouponById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id).populate('applicableProducts', 'name');
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupon', error });
    }
};

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, ...updates } = req.body;

        // If code is provided and different, check for uniqueness
        if (code) {
            const existing = await Coupon.findOne({ code, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: 'Coupon code already exists' });
            }
            updates.code = code;
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.status(200).json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon', error });
    }
};

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderValue,
            type,
            applicableProducts,
            usageLimit,
            expiresAt
        } = req.body;

        // If code is not provided, generate one
        const finalCode = code ? code.toUpperCase() : generateCouponCode();

        // Check if code exists
        const existingCoupon = await Coupon.findOne({ code: finalCode });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const newCoupon = new Coupon({
            code: finalCode,
            description,
            discountType,
            discountValue,
            minOrderValue,
            type,
            applicableProducts,
            usageLimit,
            expiresAt
        });

        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error });
    }
};

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }).populate('applicableProducts', 'name');
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error });
    }
};

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon', error });
    }
};

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, cartTotal, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        let coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            // Check if it exists as a product-level coupon
            const productWithCoupon = await Product.findOne({ couponCode: code.toUpperCase() });
            if (productWithCoupon) {
                // Construct a virtual coupon that follows the Coupon schema structure
                coupon = {
                    code: productWithCoupon.couponCode,
                    description: `Special discount for ${productWithCoupon.name}`,
                    discountType: 'percentage', // Product-level currently only supports percentage in UI
                    discountValue: productWithCoupon.discountPercentage || 0,
                    minOrderValue: 0,
                    type: 'product',
                    applicableProducts: [productWithCoupon._id],
                    isActive: true,
                    usedCount: 0,
                    usageLimit: null,
                    expiresAt: null
                } as any;
            }
        }

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or inactive coupon code' });
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        // Check min order value
        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({ message: `Minimum order value of ${coupon.minOrderValue} required` });
        }

        let discountAmount = 0;

        if (coupon.type === 'product') {
            // For product-specific coupons, check if applicable products are in cart
            // This logic might be complex if done on backend without full cart details
            // expecting cartItems to be array of { product: string (id), price: number, quantity: number }
            if (!cartItems || !Array.isArray(cartItems)) {
                return res.status(400).json({ message: "Cart items required for product-specific coupon validation" });
            }

            let applicableItemFound = false;
            cartItems.forEach(item => {
                if (coupon.applicableProducts.map(p => p.toString()).includes(item.product)) {
                    applicableItemFound = true;
                    // Logic: apply discount to this item? Or just validate?
                    // Usually product coupons apply to the specific product price. 
                    // Let's calculate potential discount.
                    let itemDiscount = 0;
                    if (coupon.discountType === 'percentage') {
                        itemDiscount = (item.price * item.quantity) * (coupon.discountValue / 100);
                    } else {
                        itemDiscount = coupon.discountValue * item.quantity; // Fixed off per unit? or total? 
                        // Usually fixed amount is per item or once per order? 
                        // Requirement says: "assign coupen to products". 
                        // Let's assume fixed discount is per unit for product coupon.
                        // But for safety/simplicity let's assume it applies once if contained? 
                        // Standard: Percentage is per item price. Fixed is usually total. 
                        // Let's stick to percentage for product coupons usually, or fixed off the product price.
                        // Let's assume fixed value is per unit for now if logic allows, or capping at total price.
                        // Actually simplicity: Calculate total applicable amount.
                    }
                    discountAmount += itemDiscount;
                }
            });

            if (!applicableItemFound) {
                return res.status(400).json({ message: 'This coupon is not applicable to any items in your cart' });
            }

        } else if (coupon.type === 'cart') {
            // Check if any product interactions prevent this? 
            // The constraint "Cart-wide coupons only if no product coupons" is a frontend/business logic constraint 
            // that might be hard to enforce here without knowing if other coupons are applied. 
            // However, the `validateCoupon` endpoint just checks if THIS coupon is valid for THIS cart. 
            // The Client should handle the mutual exclusivity.

            if (coupon.discountType === 'percentage') {
                discountAmount = cartTotal * (coupon.discountValue / 100);
            } else {
                discountAmount = coupon.discountValue;
            }
        } else if (coupon.type === 'shipping') {
            // Free shipping or discounted shipping
            // For now return discountAmount = shippingCost (need to pass shipping cost?)
            // Or just return type 'shipping' and let frontend handle zeroing shipping.
            // We will return the coupon details and frontend handles the math for shipping.
        }

        // Cap discount at total?
        if (discountAmount > cartTotal && coupon.type !== 'shipping') {
            discountAmount = cartTotal;
        }

        res.status(200).json({
            isValid: true,
            coupon,
            discountAmount
        });

    } catch (error) {
        res.status(500).json({ message: 'Error validating coupon', error });
    }
};

export const getActiveCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find({ isActive: true }).select('code type discountType discountValue isActive expiresAt description minOrderValue');
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active coupons', error });
    }
};
