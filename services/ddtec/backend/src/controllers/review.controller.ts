import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Product from '../models/Product';
import redisClient from '../config/redis';

interface AuthRequest extends Request {
    user?: any;
}

// Product listings are cached in Redis; ratings change on every review write.
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

const recalculateProductRating = async (productId: string) => {
    const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avgRating = stats.length > 0 ? stats[0].avgRating : 0;
    const count = stats.length > 0 ? stats[0].count : 0;

    await Product.findByIdAndUpdate(productId, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: count
    });

    await clearProductCache();
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get the logged-in user's own review for a product (to prefill the edit form)
// @route   GET /api/reviews/product/:productId/mine
// @access  Private
export const getMyReview = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const review = await Review.findOne({ product: productId, user: req.user.id });
        res.json(review || null);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or update the logged-in user's review for a product
// @route   POST /api/reviews/product/:productId
// @access  Private
export const submitReview = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const userName = req.user.name
            || [req.user.firstName, req.user.lastName].filter(Boolean).join(' ')
            || 'Customer';

        const review = await Review.findOneAndUpdate(
            { product: productId, user: req.user.id },
            { rating: numericRating, comment: (comment || '').toString().trim().slice(0, 1000), userName },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        await recalculateProductRating(productId);

        res.status(200).json({ msg: 'Review submitted successfully', review });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ msg: 'Review not found' });
        }

        const isOwner = review.user.toString() === req.user.id;
        const adminRoles = ['super_admin', 'admin', 'product_manager'];
        if (!isOwner && !adminRoles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Not authorized to delete this review' });
        }

        const productId = review.product.toString();
        await review.deleteOne();
        await recalculateProductRating(productId);

        res.json({ msg: 'Review deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
