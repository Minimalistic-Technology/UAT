import express from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController';

const router = express.Router();

router.post('/create', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.put('/update/:id', updateTemplate);
router.delete('/delete/:id', deleteTemplate);

export default router;
