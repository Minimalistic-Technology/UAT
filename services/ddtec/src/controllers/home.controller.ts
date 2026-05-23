import { Request, Response } from 'express';

import NotificationService from '../services/notification.service';

export const getHome = (req: Request, res: Response) => {
    res.send('DDTEC Backend is running');
};

export const getHealth = async (req: Request, res: Response) => {
    const emailStatus = await NotificationService.checkStatus();
    res.json({
        status: 'ok',
        service: 'ddtec',
        email: emailStatus
    });
};
