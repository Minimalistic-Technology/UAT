import { Router } from 'express';
import { getHubs, createHub, updateHub, deleteHub } from '../controllers/hub.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Only Super Admins and Admins can manage the global physical hub network
router.use(auth);
router.use(checkPermission(['super_admin', 'admin']));

router.get('/', getHubs);
router.post('/', createHub);
router.put('/:id', updateHub);
router.delete('/:id', deleteHub);

export default router;
