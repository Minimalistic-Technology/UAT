import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

import OTP from '../models/OTP';
import Settings from '../models/Settings';
import NotificationService from '../services/notification.service';
import ValidationService from '../services/validation.service';

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req: Request, res: Response) => {
    try {
        let { identifier } = req.body; // email or phone
        if (!identifier) {
            return res.status(400).json({ msg: 'Identifier (email or phone) is required' });
        }
        identifier = identifier.trim();

        // Check if global Signup is disabled for regular users
        const settings = await Settings.findOne();
        if (settings && settings.components && settings.components.Signup === false) {
            return res.status(403).json({ msg: 'Public registration is currently disabled.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email or phone' });
        }

        // Validate Identifier
        const isEmail = identifier.includes('@');
        const validation = isEmail ? ValidationService.isRealEmail(identifier) : ValidationService.isRealPhone(identifier);

        if (!validation.isValid) {
            return res.status(400).json({ msg: validation.msg });
        }

        const otp = generateOTP();

        // Save OTP to DB (upsert)
        await OTP.findOneAndUpdate(
            { identifier },
            { identifier, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 mins
            { upsert: true, new: true }
        );

        // REAL SENDING
        const result = await NotificationService.sendOTP(identifier, otp);

        if (result.success) {
            res.json({ msg: 'OTP sent successfully', success: true });
        } else {
            res.status(500).json({ msg: result.msg || 'Failed to send OTP. Please try again.', success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { identifier, otp } = req.body;

        const otpRecord = await OTP.findOne({ identifier, otp });
        if (!otpRecord) {
            return res.status(400).json({ msg: 'Invalid or expired OTP', isValid: false });
        }

        res.json({ msg: 'OTP verified successfully', isValid: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, password, role, otp, accountType, employmentType, companyDetails, designation } = req.body;

        const disableOtp = process.env.DISABLE_OTP === 'true';
        let otpRecord = null;

        if (!disableOtp) {
            // Verify OTP (Check both email and phone as potential identifiers)
            const identifiers = [email, phone].filter(Boolean);
            otpRecord = await OTP.findOne({
                identifier: { $in: identifiers },
                otp
            });
            if (!otpRecord) {
                return res.status(400).json({ msg: 'Invalid or expired OTP' });
            }
        }

        // Block new user registrations if public login/signup is disabled
        if (!role || role === 'user') {
            const settings = await Settings.findOne();
            if (settings && settings.components && settings.components.Signup === false) {
                return res.status(403).json({ msg: 'Public registration is currently disabled.' });
            }
        }

        // Validate Real Contact Info
        if (email) {
            const emailValidation = ValidationService.isRealEmail(email);
            if (!emailValidation.isValid) return res.status(400).json({ msg: emailValidation.msg });
        }
        if (phone) {
            const phoneValidation = ValidationService.isRealPhone(phone);
            if (!phoneValidation.isValid) return res.status(400).json({ msg: phoneValidation.msg });
        }

        // Check if user exists (Double check)
        const checkQuery = [];
        if (email) checkQuery.push({ email });
        if (phone) checkQuery.push({ phone });

        let user = await User.findOne({ $or: checkQuery });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            firstName,
            lastName,
            name: (firstName && lastName) ? `${firstName} ${lastName}` : "", // Handle missing names
            email,
            phone,
            password,
            role: role || 'user',
            isEmailVerified: !!email,
            isPhoneVerified: !!phone,
        });

        await user.save();

        // Delete used OTP if we verified it
        if (otpRecord) {
            await OTP.deleteOne({ _id: otpRecord._id });
        }

        const payload = {
            id: user.id,
            name: user.name, // Keep using name for payload for compatibility
            email: user.email,
            role: user.role,
            customPages: user.customPages,
            editPages: user.editPages,
            addPages: user.addPages,
            deletePages: user.deletePages
        };

        // Return success message
        res.json({
            msg: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                customPages: user.customPages,
                editPages: user.editPages,
                addPages: user.addPages,
                deletePages: user.deletePages
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        let { email, phone, password } = req.body;
        const identifier = (email || phone || '').trim().toLowerCase();

        // Check if user exists
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate password
        // Note: user.password is explicitly typed as string in schema, but may be undefined in TS if not careful.
        // Mongoose document types can be tricky.
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if user is active (bypass for admins to prevent lockout)
        if (user.role === 'user') {
            if (!user.isActive) {
                return res.status(403).json({ msg: 'Account is deactivated. Please contact admin.' });
            }

            // Note: Per user request, existing users can login even if Login is "disabled" (Maintenance mode)
            // The maintenance block is handled on the frontend for UX.
            // If we wanted to block it here, we would check settings.components.Login.
            // But user said: "in disabled login existing user can login".
        }

        const payload = {
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email, // Including email in payload is useful
            role: user.role,
            customPages: user.customPages,
            editPages: user.editPages,
            addPages: user.addPages,
            deletePages: user.deletePages
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                console.log(`[AUTH] Session created for user ${payload.email}`);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true, // Required for SameSite=None
                    maxAge: 3600000,
                    path: '/',
                    sameSite: 'none' // Allow cross-site cookie
                });
                // Return token in body for fallback
                res.json({ user: payload, token });
            }
        );
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(err);
        }
        res.status(500).send('Server error');
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ msg: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id).select('-password');
        res.json(user);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(err);
        }
        res.status(500).send('Server error');
    }
};

// Admin: Create User directly
export const createUser = async (req: Request, res: Response) => {
    try {
        let { firstName, lastName, email, phone, password, role, customPages, editPages, addPages, deletePages } = req.body;

        // Validate Contact Info
        if (email) {
            const emailValidation = ValidationService.isRealEmail(email);
            if (!emailValidation.isValid) return res.status(400).json({ msg: emailValidation.msg });
        }
        if (phone && phone.trim() !== "") {
            const phoneValidation = ValidationService.isRealPhone(phone);
            if (!phoneValidation.isValid) return res.status(400).json({ msg: phoneValidation.msg });
        } else {
            phone = undefined; // Ensure empty string doesn't trigger unique constraint
        }

        // Robust uniqueness check
        const checkQuery: any[] = [];
        if (email) checkQuery.push({ email });
        if (phone) checkQuery.push({ phone });

        if (checkQuery.length > 0) {
            const existingUser = await User.findOne({ $or: checkQuery });
            if (existingUser) {
                const conflictField = existingUser.email === email ? 'Email' : 'Phone number';
                return res.status(400).json({ msg: `${conflictField} already exists` });
            }
        }

        const user = new User({
            firstName,
            lastName,
            name: `${firstName || ''} ${lastName || ''}`.trim(),
            email,
            phone,
            password, // Will be hashed by pre-save
            role: role || 'user',
            customPages: customPages || [],
            editPages: editPages || [],
            addPages: addPages || [],
            deletePages: deletePages || [],
            isEmailVerified: true, // Admin created, assume verified
            isPhoneVerified: !!phone,
            isActive: true
        });

        await user.save();
        res.status(201).json({ msg: 'User created successfully', user });
    } catch (err: any) {
        console.error("[ERROR] createUser Failed:", err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Admin: Toggle User Status
export const toggleUserStatus = async (req: Request, res: Response) => {
    console.log(`[DEBUG] toggleUserStatus called for ID: ${req.params.id}`);
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log(`[DEBUG] User not found for ID: ${req.params.id}`);
            return res.status(404).json({ msg: 'User not found' });
        }

        let newStatus: boolean;
        let updateQuery: any;

        console.log('[DEBUG] Toggling User Status');
        // Ensure we have a boolean even if undefined
        newStatus = !user.isActive;
        updateQuery = { $set: { isActive: newStatus } };

        console.log('[DEBUG] Updating user with query:', JSON.stringify(updateQuery));

        // Use findByIdAndUpdate to bypass strict schema validation for other fields (like firstName required)
        // that might be missing in legacy data.
        await User.findByIdAndUpdate(req.params.id, updateQuery, { new: true, runValidators: false });

        console.log('[DEBUG] User updated successfully.');

        res.json({ msg: `User ${newStatus ? 'activated' : 'deactivated'}`, isActive: newStatus });
    } catch (err: any) {
        console.error("[ERROR] Toggle Status Failed:", err);
        return res.status(500).json({ msg: 'Server error', error: err.message, stack: err.stack });
    }
};

// Admin: Update User/Company Details
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        // Remove immutable fields if present in updates
        delete updates._id;

        // Use findByIdAndUpdate to merge updates
        // We use $set to update fields. 
        // Note: For nested companyDetails, if we want to update specific fields without overwriting the whole object,
        // we should flatten the object or use dot notation. 
        // For simplicity, we assume the frontend sends the structure we want to save, 
        // or we use $set with the whole object if that's the intent. 
        // If frontend sends { companyDetails: { ... } }, it will overwrite companyDetails.
        // If we want partial, we'd need to flatten. 
        // Let's assume for now the Edit Modal sends the full CompanyDetails object if it edits it.

        const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: false });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User updated successfully', user });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { firstName, lastName, address, phone } = req.body;

        const updateData: any = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (firstName && lastName) updateData.name = `${firstName} ${lastName}`;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const changePassword = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password as string);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        user.password = newPassword; // Will be hashed by pre-save middleware
        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const checkUser = async (req: Request, res: Response) => {
    try {
        let { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ msg: 'Identifier is required' });
        }
        identifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        // Get admin settings to see if public signup is active
        const settings = await Settings.findOne();
        const signupAllowed = settings ? settings.components.Signup !== false : true;

        res.json({
            exists: !!user,
            signupAllowed,
            otpRequired: process.env.DISABLE_OTP !== 'true'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Admin: Update User Credit Balance
export const updateCreditBalance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let { amount, type } = req.body; // type: 'add' or 'set'

        // Convert to number if string
        if (typeof amount === 'string') {
            amount = Number(amount);
        }

        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ msg: 'Amount must be a valid number' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (type === 'set') {
            user.creditBalance = amount;
        } else {
            // Default to adding (can be negative to subtract)
            user.creditBalance = (user.creditBalance || 0) + amount;
        }

        await user.save();

        res.json({ msg: 'Credit balance updated', creditBalance: user.creditBalance, user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// Admin: Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
