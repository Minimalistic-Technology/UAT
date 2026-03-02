import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { auth, checkGranularPermission } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getSettings);
router.put('/', auth as any, checkGranularPermission('components', 'edit'), updateSettings);

export default router;
