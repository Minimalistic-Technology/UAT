import { Request, Response } from 'express';
import mongoose from 'mongoose';

import NotificationService from '../services/notification.service';

export const getHome = (req: Request, res: Response) => {
    res.send('DDTEC Backend is running');
};

const checkDatabase = async () => {
    const start = process.hrtime.bigint();
    try {
        if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
            return { status: 'disconnected' };
        }
        await mongoose.connection.db.admin().ping();
        const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
        return { status: 'operational', latencyMs: Math.round(latencyMs * 100) / 100 };
    } catch (error) {
        return {
            status: 'disconnected',
            message: error instanceof Error ? error.message : String(error)
        };
    }
};

export const getHealth = async (req: Request, res: Response) => {
    const [emailStatus, database] = await Promise.all([
        NotificationService.checkStatus(),
        checkDatabase()
    ]);

    const isHealthy = database.status === 'operational';

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        service: 'ddtec',
        email: emailStatus,
        database
    });
};
