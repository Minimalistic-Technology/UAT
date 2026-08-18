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
        console.error("Error fetching settings:", error);
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
            if (components) {
                const currentComponents = (settings.components as any)?.toObject ? (settings.components as any).toObject() : (settings.components || {});
                settings.components = { ...currentComponents, ...components };
                settings.markModified('components');
            }
            if (onboarding) {
                const currentOnboarding = (settings.onboarding as any)?.toObject ? (settings.onboarding as any).toObject() : (settings.onboarding || {});
                settings.onboarding = { ...currentOnboarding, ...onboarding };
                settings.markModified('onboarding');
            }
            await settings.save();
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
