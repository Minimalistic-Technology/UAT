import { Request, Response } from 'express';
import Settings from '../models/Settings';
import RouteConfig from '../models/RouteConfig';

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
        const { components, onboarding } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({ components, onboarding });
        } else {
            if (components) settings.components = { ...settings.components, ...components };
            if (onboarding) settings.onboarding = { ...settings.onboarding, ...onboarding };
            await settings.save();
        }

        // Sync route config path /signup based on onboarding mode
        if (settings.onboarding && settings.onboarding.mode === 'closed') {
            await RouteConfig.updateOne({ path: '/signup' }, { isActive: false });
        } else {
            await RouteConfig.updateOne({ path: '/signup' }, { isActive: true });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
