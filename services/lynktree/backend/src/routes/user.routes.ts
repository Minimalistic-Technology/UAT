import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { usernameSchema } from '../validations/auth.validation';
import { updateProfileSchema } from '../validations/link.validation';
import * as controller from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);
router.get('/check-username', controller.checkUsernameAvailability);
router.post('/username', validateBody(usernameSchema), controller.setUsername);
router.patch('/me', validateBody(updateProfileSchema), controller.updateProfile);

export default router;
