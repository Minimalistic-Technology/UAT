import { Router } from 'express';
import { getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', getBlogs);

// @route   GET api/blogs/slug/:slug
// @desc    Get blog by slug
// @access  Public
router.get('/slug/:slug', getBlogBySlug);

// @route   GET api/blogs/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', getBlogById);

// @route   POST api/blogs
// @desc    Create a blog
// @access  Private/Admin
router.post('/', auth, checkPermission(['marketing']), createBlog);

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private/Admin
router.put('/:id', auth, checkPermission(['marketing']), updateBlog);

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private/Admin
router.delete('/:id', auth, checkPermission(['marketing']), deleteBlog);

export default router;
