import { Router } from 'express';
import { getAccountingDashboard, getExpenses, addExpense, updateExpense, deleteExpense, getLedger, getProductEconomics, getUserFinancials } from '../controllers/accounting.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Secure all accounting routes to accountant and super_admin roles
router.use(auth);
// Allow accountants and admins to view the dashboard
router.use(checkPermission(['accountant', 'super_admin', 'admin', 'finance']));

router.get('/dashboard', getAccountingDashboard);
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);
router.get('/ledger', getLedger);
router.get('/product-economics', getProductEconomics);
router.get('/user-financials', getUserFinancials);
export default router;
