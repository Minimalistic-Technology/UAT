import { Router } from 'express';
import { getHubs, createHub, updateHub, deleteHub } from '../controllers/hub.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Allow inventory managers to fetch warehouse data for their dashboards, but only admins can edit/create.
router.use(auth);

router.get('/', checkPermission(['super_admin', 'admin', 'inventory_manager', 'warehouse']), getHubs);
router.post('/', checkPermission(['super_admin', 'admin']), createHub);
router.put('/:id', checkPermission(['super_admin', 'admin']), updateHub);
router.delete('/:id', checkPermission(['super_admin', 'admin']), deleteHub);

export default router;
