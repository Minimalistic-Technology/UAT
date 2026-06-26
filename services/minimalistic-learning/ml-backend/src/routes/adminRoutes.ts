import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import checkDbPermission from '../middleware/checkDbPermission';
import {
  getSettings,
  updateSettings,
  getPendingPosts,
  getAllPostsAdmin,
  deletePostAdmin,
  approvePost,
  rejectPost,
  listUsers,
  updateUser,
  deleteUser,
  listPermissions,
  createPermission,
  togglePermission,
  deletePermission,
  updateSiteContent,
  getNewsletterSubscribers
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

router.get('/settings', checkDbPermission, getSettings);
router.patch('/settings', checkDbPermission, updateSettings);

router.get('/posts/pending', checkDbPermission, getPendingPosts);
router.get('/posts/all', checkDbPermission, getAllPostsAdmin);
router.delete('/posts/:postId', checkDbPermission, deletePostAdmin);
router.patch('/posts/:postId/approve', checkDbPermission, approvePost);
router.patch('/posts/:postId/reject', checkDbPermission, rejectPost);

// User CRUD Management
router.get('/users', checkDbPermission, listUsers);
router.put('/users/:userId', checkDbPermission, updateUser);
router.delete('/users/:userId', checkDbPermission, deleteUser);

// Route Permissions Management
router.get('/permissions', checkDbPermission, listPermissions);
router.post('/permissions', checkDbPermission, createPermission);
router.patch('/permissions/:id/toggle', checkDbPermission, togglePermission);
router.delete('/permissions/:id', checkDbPermission, deletePermission);

// Site Content Management
router.put('/content/:page/:section', checkDbPermission, updateSiteContent);

// Subscribers Management
router.get('/subscribers', checkDbPermission, getNewsletterSubscribers);

// Team Management
import { addTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/adminController';
router.post('/team', checkDbPermission, addTeamMember);
router.put('/team/:id', checkDbPermission, updateTeamMember);
router.delete('/team/:id', checkDbPermission, deleteTeamMember);

export default router;
