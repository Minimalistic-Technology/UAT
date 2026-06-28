import { Request, Response } from 'express';
import Hub from '../models/Hub';

export const getHubs = async (req: Request, res: Response): Promise<void> => {
    try {
        const hubs = await Hub.find().sort({ createdAt: -1 });
        res.status(200).json(hubs);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching hubs', error: error.message });
    }
};

export const createHub = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, code, address, city, pincodes, contactPhone, contactEmail } = req.body;

        // Pincodes should be a comma-separated string converted to array
        const pincodesArray = typeof pincodes === 'string' ? pincodes.split(',').map(p => p.trim()) : pincodes;

        const newHub = new Hub({
            name, code, address, city, pincodes: pincodesArray, contactPhone, contactEmail
        });

        await newHub.save();
        res.status(201).json({ message: 'Store Hub successfully registered', hub: newHub });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Hub Code must be unique.' });
            return;
        }
        res.status(500).json({ message: 'Error creating hub', error: error.message });
    }
};

export const updateHub = async (req: Request, res: Response): Promise<void> => {
    try {
        let updateData = { ...req.body };
        if (updateData.pincodes && typeof updateData.pincodes === 'string') {
            updateData.pincodes = updateData.pincodes.split(',').map((p: string) => p.trim());
        }

        const hub = await Hub.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!hub) {
            res.status(404).json({ message: 'Hub not found' });
            return;
        }
        res.status(200).json({ message: 'Hub updated successfully', hub });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating hub', error: error.message });
    }
}

export const deleteHub = async (req: Request, res: Response): Promise<void> => {
    try {
        const hub = await Hub.findByIdAndDelete(req.params.id);
        if (!hub) {
            res.status(404).json({ message: 'Hub not found' });
            return;
        }
        res.status(200).json({ message: 'Hub deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting hub', error: error.message });
    }
}
