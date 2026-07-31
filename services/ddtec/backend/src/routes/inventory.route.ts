import { Router } from 'express';
import { getInventoryDashboard, getWarehouseLocations, assignStockLocation, updateStockQuantity, removeStockLocation, getWarehouseAvailability, getTransferRequests, createTransferRequest, processTransferRequest } from '../controllers/inventory.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Secure all inventory routes to warehouse and super_admin roles
router.use(auth);
// Allow warehouse managers, admins, super_admins to view and edit
router.use(checkPermission(['warehouse', 'super_admin', 'admin', 'inventory_manager']));

router.get('/dashboard', getInventoryDashboard);
router.get('/locations', getWarehouseLocations);
router.post('/locations', assignStockLocation);
router.put('/locations/:id', updateStockQuantity);
router.delete('/locations/:id', removeStockLocation);

// Transfers
router.get('/availability/:productId', getWarehouseAvailability);
router.get('/transfers', getTransferRequests);
router.post('/transfers', createTransferRequest);
router.put('/transfers/:id', processTransferRequest);

export default router;
