import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        console.log('Register attempt:', { name, email, password: '***' });

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            return res.status(400).json({ msg: 'User already exists' });
        }
        console.log('User does not exist, creating new user');

        user = new User({
            name,
            email,
            password,
        });

        await user.save();
        console.log('User saved to database');

        const payload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,
                    // secure: process.env.NODE_ENV === 'production', // Un-comment in prod
                    maxAge: 3600000 // 1 hour
                });
                res.json({ user: payload.user });
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

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
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

        const payload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email // Including email in payload is useful
            },
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,
                    // secure: process.env.NODE_ENV === 'production', 
                    maxAge: 3600000
                });
                res.json({ user: payload.user });
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
