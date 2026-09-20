import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import * as controller from '../controllers/upload.controller';

const router = Router();

router.post('/', requireAuth, upload.single('file'), controller.uploadAsset);

export default router;
