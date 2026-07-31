import { Request, Response } from 'express';
import WarehouseStock from '../models/WarehouseStock';
import Product from '../models/Product';
import TransferRequest from '../models/TransferRequest';
import mongoose from 'mongoose';

export const getInventoryDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const stocks = await WarehouseStock.find().populate('product', 'name stock price image');
        const products = await Product.find().select('name stock price isActive');

        // Aggregating Data
        let totalItemsStored = 0;
        let warehouseCount = new Set<string>();
        let lowStockAlerts: any[] = [];
        let capacityWarnings: any[] = [];

        stocks.forEach(st => {
            totalItemsStored += st.quantity;
            warehouseCount.add(st.warehouseName);

            // Blinkit style alerts
            if (st.quantity <= 5) {
                lowStockAlerts.push({ ...st.toObject(), warning: 'Critical Low Stock' });
            }
            if (st.quantity >= st.capacity) {
                capacityWarnings.push({ ...st.toObject(), warning: 'Rack Over Capacity!' });
            }
        });

        // Check if DB Product main stock conflicts with warehouse total
        const unassignedProducts = products.filter(p => !stocks.find(s => s.product?._id?.toString() === p._id.toString()));

        res.status(200).json({
            stats: {
                totalActiveWarehouses: warehouseCount.size,
                totalItemsStored,
                totalProductsTracked: products.length,
                lowStockAlertsCount: lowStockAlerts.length,
            },
            alerts: {
                lowStock: lowStockAlerts,
                overCapacity: capacityWarnings,
                unassignedProducts: unassignedProducts.slice(0, 10) // Top 10 unassigned
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching inventory dashboard', error: error.message });
    }
};

export const getWarehouseLocations = async (req: Request, res: Response): Promise<void> => {
    try {
        const stocks = await WarehouseStock.find().sort({ warehouseName: 1, zoneAisle: 1, rack: 1 }).populate('product', 'name price image');
        res.status(200).json(stocks);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
};

export const assignStockLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { product, productName, warehouseName, zoneAisle, rack, shelfRow, quantity, capacity } = req.body;

        // Verify product exists
        const pExists = await Product.findById(product);
        if (!pExists) {
            res.status(404).json({ message: "Product referenced does not exist!" });
            return;
        }

        const newStock = new WarehouseStock({
            product,
            productName: pExists.name,
            warehouseName,
            zoneAisle,
            rack,
            shelfRow,
            quantity: Number(quantity),
            capacity: Number(capacity || 100)
        });

        await newStock.save();
        res.status(201).json({ message: 'Stock assigned to Rack location successfully', stock: newStock });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'This specific rack inside this warehouse already has this product assigned. Please UPDATE instead of adding anew.' });
            return;
        }
        res.status(500).json({ message: 'Error assigning stock', error: error.message });
    }
};

export const updateStockQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { quantity } = req.body;
        const updated = await WarehouseStock.findByIdAndUpdate(req.params.id, { $set: { quantity: Number(quantity) } }, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Stock location not found' });
            return;
        }
        res.status(200).json({ message: 'Rack Stock updated', stock: updated });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
};

export const removeStockLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const removed = await WarehouseStock.findByIdAndDelete(req.params.id);
        if (!removed) {
            res.status(404).json({ message: 'Location not found' });
            return;
        }
        res.status(200).json({ message: 'Stock Location cleared successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error removing stock location', error: error.message });
    }
};

// ** INTER-WAREHOUSE TRANSFERS LOGIC ** //

export const getWarehouseAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const stocks = await WarehouseStock.find({ product: productId }).select('warehouseName zoneAisle rack quantity');
        // Group by warehouse
        const availability: Record<string, number> = {};
        stocks.forEach(st => {
            availability[st.warehouseName] = (availability[st.warehouseName] || 0) + st.quantity;
        });

        const result = Object.keys(availability).map(wh => ({
            warehouse: wh,
            availableStock: availability[wh]
        })).sort((a, b) => b.availableStock - a.availableStock);

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
}

export const getTransferRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const requests = await TransferRequest.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching transfer reqs', error: error.message });
    }
}

export const createTransferRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { product, productName, fromWarehouse, toWarehouse, quantity, notes } = req.body;

        if (fromWarehouse === toWarehouse) {
            res.status(400).json({ message: "Cannot transfer to the same warehouse." });
            return;
        }

        // Verify fromWarehouse actually has enough stock globally
        const stocks = await WarehouseStock.find({ product, warehouseName: fromWarehouse });
        const totalAvailable = stocks.reduce((sum, st) => sum + st.quantity, 0);

        if (totalAvailable < quantity) {
            res.status(400).json({ message: `Source Warehouse (${fromWarehouse}) only has ${totalAvailable} units available. Cannot request ${quantity}.` });
            return;
        }

        const transfer = new TransferRequest({
            product, productName, fromWarehouse, toWarehouse, quantity: Number(quantity), notes
        });

        await transfer.save();
        res.status(201).json({ message: 'Transfer request generated successfully.', request: transfer });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating transfer', error: error.message });
    }
}

export const processTransferRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, rackAssignment } = req.body; // rackAssignment used when status -> 'completed'
        const transfer = await TransferRequest.findById(req.params.id);

        if (!transfer) {
            res.status(404).json({ message: "Transfer not found" });
            return;
        }

        // State Machine
        if (status === 'completed' && transfer.status !== 'completed') {
            if (!rackAssignment || !rackAssignment.zoneAisle || !rackAssignment.rack || !rackAssignment.shelfRow) {
                res.status(400).json({ message: "Must provide physical rack assignment to receive stock into new warehouse." });
                return;
            }

            // Deduct from Source Warehouse (smart deduct across racks)
            let remainingToDeduct = transfer.quantity;
            const sourceStocks = await WarehouseStock.find({ product: transfer.product, warehouseName: transfer.fromWarehouse }).sort({ quantity: 1 });

            for (let st of sourceStocks) {
                if (remainingToDeduct === 0) break;
                if (st.quantity <= remainingToDeduct) {
                    remainingToDeduct -= st.quantity;
                    await WarehouseStock.findByIdAndDelete(st._id);
                } else {
                    st.quantity -= remainingToDeduct;
                    await st.save();
                    remainingToDeduct = 0;
                }
            }

            // If we somehow didn't deduct everything, meaning stock magically vanished mid-transit
            if (remainingToDeduct > 0) {
                res.status(400).json({ message: "Critical Error: Source warehouse no longer has enough physical stock to fulfill this transit!" });
                return;
            }

            // Add to Destination Warehouse Rack
            const newDestStock = new WarehouseStock({
                product: transfer.product,
                productName: transfer.productName,
                warehouseName: transfer.toWarehouse,
                zoneAisle: rackAssignment.zoneAisle,
                rack: rackAssignment.rack,
                shelfRow: rackAssignment.shelfRow,
                quantity: transfer.quantity,
                capacity: rackAssignment.capacity || 100
            });
            await newDestStock.save();

            transfer.completedAt = new Date();
        }

        transfer.status = status;
        await transfer.save();

        res.status(200).json({ message: `Transfer status updated to ${status}`, request: transfer });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: "The destination rack already has this product allocated. Please choose a different rack to receive." });
            return;
        }
        res.status(500).json({ message: 'Error processing transfer', error: error.message });
    }
};
