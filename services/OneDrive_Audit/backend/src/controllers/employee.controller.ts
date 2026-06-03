import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

export class EmployeeController {
    // Admin creates an employee
    public createEmployee = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user?.id;
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password, and name are required' });
            }

            // Verify the requester is an admin
            const admin = await User.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                return res.status(403).json({ error: 'Only admins can create employees' });
            }

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create employee
            const employee = await User.create({
                email,
                name,
                password: hashedPassword,
                role: 'employee',
                adminId: admin._id
            });

            res.status(201).json({
                message: 'Employee created successfully',
                employee: {
                    id: employee._id,
                    name: employee.name,
                    email: employee.email
                }
            });
        } catch (error) {
            console.error('Create employee error:', error);
            res.status(500).json({ error: 'Server error creating employee' });
        }
    };

    // Admin lists their employees
    public listEmployees = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user?.id;
            const employees = await User.find({ adminId, role: 'employee' }).select('name email createdAt');
            res.status(200).json({ employees });
        } catch (error) {
            res.status(500).json({ error: 'Failed to list employees' });
        }
    };

    // Employee Login
    public loginEmployee = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const user = await User.findOne({ email, role: 'employee' }).select('+password');
            if (!user || !user.password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Issue JWT containing the employee ID, role, and the linked adminId
            const payload = {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                adminId: user.adminId?.toString()
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

            res.status(200).json({
                message: 'Login successful',
                token,
                user: payload
            });
        } catch (error) {
            console.error('Login employee error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    };

    // Delete Employee (Admin only)
    public deleteEmployee = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user?.id;
            const employeeId = req.params.id;

            const deleted = await User.findOneAndDelete({ _id: employeeId, adminId, role: 'employee' });
            if (!deleted) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            res.status(200).json({ message: 'Employee deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete employee' });
        }
    };
}
