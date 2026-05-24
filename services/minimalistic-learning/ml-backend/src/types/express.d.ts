import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
       file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};

