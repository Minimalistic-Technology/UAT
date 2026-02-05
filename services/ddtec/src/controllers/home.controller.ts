import { Request, Response } from 'express';

export const getHome = (req: Request, res: Response) => {
    res.send('DDTEC Backend is running');
};

export const getHealth = (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ddtec' });
};
