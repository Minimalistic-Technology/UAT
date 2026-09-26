import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { createLinkSchema, updateLinkSchema, reorderLinksSchema } from '../validations/link.validation';
import * as controller from '../controllers/link.controller';

const router = Router();

router.use(requireAuth);
router.get('/', controller.getMyLinks);
router.post('/', validateBody(createLinkSchema), controller.createLink);
router.put('/reorder', validateBody(reorderLinksSchema), controller.reorderLinks);
router.patch('/:id', validateBody(updateLinkSchema), controller.updateLink);
router.delete('/:id', controller.deleteLink);

export default router;
