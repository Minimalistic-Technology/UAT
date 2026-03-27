import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();
export const uploadSingle = (field = 'file') => multer({ storage }).single(field);

export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  next();
};

