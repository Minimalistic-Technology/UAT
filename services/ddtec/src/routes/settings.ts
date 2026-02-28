import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getSettings);
router.put('/', auth, checkPermission(['super_admin']), updateSettings);

export default router;
