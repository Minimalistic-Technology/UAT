import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const employeeController = new EmployeeController();

// Public Employee Login
router.post('/login', employeeController.loginEmployee);

// Protected Admin Routes (Using authMiddleware, which verifies valid tokens)
router.post('/create', authMiddleware, employeeController.createEmployee);
router.get('/list', authMiddleware, employeeController.listEmployees);
router.delete('/:id', authMiddleware, employeeController.deleteEmployee);

export default router;
