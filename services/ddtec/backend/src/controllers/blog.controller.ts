import { Request, Response } from 'express';
import Blog from '../models/Blog';

// Get all blogs
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get blog by slug
export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get blog by ID
export const getBlogById = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err: any) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create blog
export const createBlog = async (req: Request, res: Response) => {
    try {
        const { title, content, author, image, slug, tags } = req.body;

        // Check if slug already exists
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            return res.status(400).json({ msg: 'Blog with this slug already exists' });
        }

        const newBlog = new Blog({
            title,
            content,
            author,
            image,
            slug,
            tags: tags || []
        });

        const blog = await newBlog.save();
        res.json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update blog
export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { title, content, author, image, slug, tags } = req.body;

        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        // If slug is being changed, check if new slug already exists
        if (slug && slug !== blog.slug) {
            const existingBlog = await Blog.findOne({ slug });
            if (existingBlog) {
                return res.status(400).json({ msg: 'Blog with this slug already exists' });
            }
        }

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content, author, image, slug, tags },
            { new: true }
        );

        res.json(blog);
    } catch (err: any) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Delete blog
export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        await Blog.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Blog deleted' });
    } catch (err: any) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
};
