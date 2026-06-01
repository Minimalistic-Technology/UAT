import { Router } from 'express';
import { FilesController } from '../controllers/files.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const filesController = new FilesController();

// All file routes require auth
router.use(authMiddleware);

router.get('/', filesController.getFiles);
router.post('/sync', filesController.syncFiles);
router.patch('/:id/designation', filesController.updateDesignation);

export default router;
