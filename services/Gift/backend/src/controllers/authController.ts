import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';
import { getOtpEmail, getWelcomeEmail, getLoginAlertEmail } from '../utils/emailTemplates';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
    });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            res.status(400).json({ error: 'User already exists and is verified' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 mins

        if (!user) {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'User',
                otp,
                otpExpiry,
                isVerified: false
            });
        } else {
            user.name = name;
            user.password = hashedPassword;
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            user.otpAttempts = 0;
            user.otpLockUntil = undefined;
            await user.save();
        }

        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SmartShare';
        const htmlContent = getOtpEmail(appName, otp);
        await sendEmail({ to: email, subject: 'Your Verification OTP', htmlContent });

        res.status(200).json({ success: true, message: 'OTP sent to email. Please verify.', email: user.email });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpLockUntil');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ error: 'User already verified' });
            return;
        }

        if (user.otpLockUntil && user.otpLockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.otpLockUntil.getTime() - Date.now()) / (1000 * 60));
            res.status(429).json({ error: `OTP verification is locked. Please try again after ${minutesLeft} minute(s).` });
            return;
        }

        if (user.otp !== otp || (user.otpExpiry && new Date() > user.otpExpiry)) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            let errorMessage = 'Invalid or expired OTP';
            if (user.otpAttempts >= 3) {
                user.otpLockUntil = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes lockout
                errorMessage = 'Invalid or expired OTP. Maximum attempts reached. Account locked for OTP verification for 2 minutes.';
            } else {
                errorMessage = `Invalid or expired OTP. Remaining verification attempts: ${3 - user.otpAttempts}`;
            }
            await user.save();
            res.status(400).json({ error: errorMessage });
            return;
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
        user.otpLockUntil = undefined;
        await user.save();

        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SmartShare';
        const welcomeHtml = getWelcomeEmail(appName, user.name);
        await sendEmail({ to: email, subject: 'Welcome to ' + appName, htmlContent: welcomeHtml }).catch(console.error);

        const token = generateToken(user._id as string, user.role);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
            res.status(429).json({ error: `Account is temporarily locked. Please try again after ${minutesLeft} minute(s).` });
            return;
        }

        if (!user.isVerified && user.role !== 'Admin') {
            res.status(403).json({ error: 'Please verify your email first', email: user.email });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            let errorMessage = 'Invalid credentials';
            if (user.loginAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes lockout
                errorMessage = 'Invalid credentials. Maximum attempts reached. Account locked for 2 minutes.';
            } else {
                errorMessage = `Invalid credentials. Remaining login attempts: ${3 - user.loginAttempts}`;
            }
            await user.save();
            res.status(400).json({ error: errorMessage });
            return;
        }

        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const token = generateToken(user._id as string, user.role);

        // Send Login Alert Email
        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SmartShare';
        const loginTime = new Date().toLocaleString();
        const loginAlertHtml = getLoginAlertEmail(appName, user.name, loginTime);
        sendEmail({ to: user.email, subject: 'New Login Alert - ' + appName, htmlContent: loginAlertHtml }).catch(console.error);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password -otp -otpExpiry');
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['Admin', 'HRAdmin', 'User'].includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        user.role = role;
        await user.save();

        res.json({ success: true, message: 'User role updated successfully', user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent self-deletion
        const authReq = req as any;
        if (authReq.user && authReq.user._id.toString() === id) {
            res.status(400).json({ error: 'You cannot delete your own admin account' });
            return;
        }

        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select('+isVerified +otpAttempts +otpLockUntil');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ error: 'User already verified' });
            return;
        }

        if (user.otpLockUntil && user.otpLockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.otpLockUntil.getTime() - Date.now()) / (1000 * 60));
            res.status(429).json({ error: `OTP verification is locked. Please try again after ${minutesLeft} minute(s).` });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 mins

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.otpAttempts = 0;
        user.otpLockUntil = undefined;
        await user.save();

        const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SmartShare';
        const htmlContent = getOtpEmail(appName, otp);
        await sendEmail({ to: email, subject: 'Your Verification OTP', htmlContent });

        res.status(200).json({ success: true, message: 'OTP resent successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
