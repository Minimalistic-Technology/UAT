import { Request, Response } from 'express';
import crypto from 'crypto';
import SharedLink from '../models/SharedLink';
import Analytics from '../models/Analytics';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../utils/sendEmail';
import { getNewLinkCreatedEmail } from '../utils/emailTemplates';

export const createShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { selectedProducts, expiryDate, password } = req.body;

        if (!selectedProducts || Number(selectedProducts.length) === 0) {
            res.status(400).json({ error: 'Please select at least one product' });
            return;
        }

        const token = crypto.randomBytes(16).toString('hex');

        const sharedLink = new SharedLink({
            token,
            adminId: req.user._id,
            selectedProducts,
            expiryDate,
            password
        });

        await sharedLink.save();

        // Send email to all Users
        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SmartShare';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const linkUrl = `${frontendUrl}/share/${token}`;

        const htmlContent = getNewLinkCreatedEmail(appName, req.user.role, req.user.name, linkUrl, expiryDate);

        // Find all verified standard users
        const users = await User.find({ role: 'User', isVerified: true }).select('email');
        if (users.length > 0) {
            const emails = users.map(u => u.email);
            // Send email to users. To avoid exposing all emails in "to", we could send individually or use BCC if supported.
            // But we can just loop and send them.
            Promise.all(emails.map(email =>
                sendEmail({
                    to: email,
                    subject: `New Gift Claim Link Available - ${appName}`,
                    htmlContent
                }).catch(err => console.error(`Failed to send link email to ${email}:`, err))
            ));
        }

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
        // If Admin, fetch all links. If HR, only fetch links created by themselves.
        const filter = req.user.role === 'Admin' ? {} : { adminId: req.user._id };

        const links = await SharedLink.find(filter)
            .populate('selectedProducts')
            .populate('adminId', 'name email role');

        const linkIds = links.map(l => l._id);

        const analytics = await Analytics.find({ linkId: { $in: linkIds } }).populate('linkId');
        res.json({ links, analytics });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyLinks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const links = await SharedLink.find({ isActive: true })
            .populate('selectedProducts')
            .populate('adminId', 'name email');

        res.json(links);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSharedLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const link = await SharedLink.findById(req.params.id);
        if (!link) {
            res.status(404).json({ error: 'Shared link not found' });
            return;
        }

        if (req.user.role === 'Admin' || link.adminId.toString() === req.user._id.toString()) {
            await link.deleteOne();
            res.json({ message: 'Shared link deleted successfully' });
        } else {
            res.status(403).json({ error: 'Not authorized to delete this link' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
