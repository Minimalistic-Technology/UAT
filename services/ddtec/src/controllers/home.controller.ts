import { Request, Response } from 'express';
import mongoose from 'mongoose';

import NotificationService from '../services/notification.service';

export const getHome = (req: Request, res: Response) => {
    res.send('DDTEC Backend is running');
};

const DB_STATES: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

const checkDatabase = async () => {
    const readyState = mongoose.connection.readyState;
    const state = DB_STATES[readyState] || 'unknown';

    if (readyState !== 1) {
        return { status: 'error', state };
    }

    try {
        await mongoose.connection.db?.admin().ping();
        return { status: 'ok', state };
    } catch (error) {
        return {
            status: 'error',
            state,
            message: error instanceof Error ? error.message : String(error),
        };
    }
};

export const getHealth = async (req: Request, res: Response) => {
    const [emailStatus, database] = await Promise.all([
        NotificationService.checkStatus(),
        checkDatabase(),
    ]);

    const healthy = database.status === 'ok';

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'error',
        service: 'ddtec',
        database,
        email: emailStatus,
    });
};
