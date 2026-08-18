import { Request, Response } from 'express';
import Bill from '../models/Bill';
import Product from '../models/Product';

// Create a new bill (POS)
export const createBill = async (req: Request, res: Response) => {
    try {
        const { items, totalAmount, customerInfo, globalTax, source, user } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ msg: 'No items in bill' });
        }

        const billData = {
            items,
            totalAmount,
            customerInfo,
            globalTax,
            source: source || 'admin_billing',
            user: user || undefined
        };

        const bill = new Bill(billData);

        // Decrement Stock for inventory items
        for (const item of items) {
            if (item.fromInventory && item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    if (product.stock < item.quantity) {
                        return res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        const savedBill = await bill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ msg: 'Server error creating bill' });
    }
};

// Get all bills
export const getAllBills = async (req: Request, res: Response) => {
    try {
        const bills = await Bill.find().sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ msg: 'Bill not found' });
        }

        // Restore Stock for inventory items before deleting
        for (const item of bill.items) {
            if (item.fromInventory && item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        await Bill.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Bill deleted and stock restored' });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update a bill (Admin Only)
export const updateBill = async (req: Request, res: Response) => {
    try {
        const { items, totalAmount, customerInfo, globalTax, source, user } = req.body;
        const billId = req.params.id;

        const existingBill = await Bill.findById(billId);
        if (!existingBill) {
            return res.status(404).json({ msg: 'Bill not found' });
        }

        // Restore stock for old inventory items
        for (const item of existingBill.items) {
            if (item.fromInventory && item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        // Apply stock changes for new inventory items
        for (const item of items) {
            if (item.fromInventory && item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    if (product.stock < item.quantity) {
                        return res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        existingBill.items = items;
        existingBill.totalAmount = totalAmount;
        existingBill.customerInfo = customerInfo;
        existingBill.globalTax = globalTax;
        existingBill.source = source || existingBill.source;
        existingBill.user = user || existingBill.user;

        const updatedBill = await existingBill.save();
        res.json(updatedBill);
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ msg: 'Server error updating bill' });
    }
};

// Get Public Bill Data
export const getPublicBill = async (req: Request, res: Response) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ msg: 'Bill not found' });
        }
        res.json(bill);
    } catch (error) {
        console.error('Error fetching public bill:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};
