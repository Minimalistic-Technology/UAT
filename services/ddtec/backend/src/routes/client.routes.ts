import { Router } from 'express';
import {
    getClients,
    getClientStats,
    createClient,
    updateClient,
    deleteClient,
    createClientProject,
    updateClientProject,
    deleteClientProject
} from '../controllers/client.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

const adminOnly = checkPermission(['admin', 'super_admin']);

// @route   GET /api/clients/stats
router.get('/stats', auth, adminOnly, getClientStats);

// @route   GET /api/clients
router.get('/', auth, adminOnly, getClients);

// @route   POST /api/clients
router.post('/', auth, adminOnly, createClient);

// @route   PUT /api/clients/:id
router.put('/:id', auth, adminOnly, updateClient);

// @route   DELETE /api/clients/:id
router.delete('/:id', auth, adminOnly, deleteClient);

// @route   POST /api/clients/:id/projects
router.post('/:id/projects', auth, adminOnly, createClientProject);

// @route   PUT /api/clients/:clientId/projects/:projectId
router.put('/:clientId/projects/:projectId', auth, adminOnly, updateClientProject);

// @route   DELETE /api/clients/:clientId/projects/:projectId
router.delete('/:clientId/projects/:projectId', auth, adminOnly, deleteClientProject);

export default router;
