import { Request, Response } from 'express';
import crypto from 'crypto';
import SharedLink from '../models/SharedLink';
import Analytics from '../models/Analytics';
import { AuthRequest } from '../middleware/authMiddleware';

export const createShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { selectedProducts, expiryDate, password, assignedTo } = req.body;

        if (!selectedProducts || Number(selectedProducts.length) === 0) {
            res.status(400).json({ error: 'Please select at least one product' });
            return;
        }

        const token = crypto.randomBytes(16).toString('hex');

        const sharedLink = new SharedLink({
            token,
            adminId: req.user._id,
            assignedTo,
            selectedProducts,
            expiryDate,
            password // in prod, hash this if actually enforcing secure passwords
        });

        await sharedLink.save();
        res.status(201).json(sharedLink);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSharedLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const link = await SharedLink.findOne({ token, isActive: true }).populate('selectedProducts');

        if (!link) {
            res.status(404).json({ error: 'Link not found or inactive' });
            return;
        }

        if (link.expiryDate && new Date() > link.expiryDate) {
            link.isActive = false;
            await link.save();
            res.status(410).json({ error: 'Link has expired' });
            return;
        }

        // Analytics Tracking
        link.totalViews += 1;
        await link.save();

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        await Analytics.create({
            linkId: link._id,
            ipAddress: ip,
            browser: userAgent
        });

        res.json(link);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Analytics for a specific link or overall admin stats
        const links = await SharedLink.find({ adminId: req.user._id });
        const linkIds = links.map(l => l._id);

        const analytics = await Analytics.find({ linkId: { $in: linkIds } }).populate('linkId');
        res.json({ links, analytics });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyLinks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user.role !== 'User') {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        const links = await SharedLink.find({ assignedTo: req.user._id, isActive: true })
            .populate('selectedProducts')
            .populate('adminId', 'name email');

        res.json(links);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
