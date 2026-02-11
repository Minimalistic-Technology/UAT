import express from 'express';
import * as controller from '../controllers/mediaAssetController';
import { uploadSingle } from '../middlewares/uploadStream';

const router = express.Router();
router.get('/upload', controller.createSignedParams);
router.post('/upload/server', uploadSingle('file'), controller.uploadServerSide);
router.get('/:id', controller.getMediaById);
router.delete('/:id', controller.deleteMedia);

export default router;