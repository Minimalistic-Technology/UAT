import { Router } from 'express';
import * as controller from '../controllers/public.controller';

const router = Router();

router.get('/:username', controller.getPublicProfile);
router.post('/:username/links/:linkId/click', controller.trackClick);

export default router;
