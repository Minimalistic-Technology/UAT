import { Request, Response } from 'express';
import Settings from '../models/Settings';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { components } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({ components });
        } else {
            settings.components = components;
            await settings.save();
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
