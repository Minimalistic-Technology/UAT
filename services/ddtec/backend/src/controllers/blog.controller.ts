import { Request, Response } from 'express';
import Blog from '../models/Blog';
import { deleteCloudinaryImages } from '../utils/cloudinaryCleanup';

// Normalizes a form field that may arrive as undefined, a single string, or an array of
// strings (multipart forms collapse a single repeated field to a plain string).
const normalizeToStringArray = (value: unknown): string[] => {
    if (value === undefined || value === null) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(v => String(v).trim()).filter(Boolean);
};

const extractUploadedImageUrl = (req: Request): string | undefined => {
    const file = req.file as (Express.Multer.File & { path?: string; secure_url?: string }) | undefined;
    return file?.path || file?.secure_url;
};

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
        const { title, content, author, slug } = req.body;
        const tags = normalizeToStringArray(req.body.tags);
        const image = extractUploadedImageUrl(req) || req.body.image || '';

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
            tags
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
        const { title, content, author, slug } = req.body;
        const tags = normalizeToStringArray(req.body.tags);
        const image = extractUploadedImageUrl(req) || req.body.image || '';

        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        // If slug is being changed, check if new slug already exists
        if (slug && slug !== blog.slug) {
            const existingBlog = await Blog.findOne({ slug });
            if (existingBlog) {
                return res.status(400).json({ msg: 'Blog with this slug already exists' });
            }
        }

        const previousImage = blog.image;

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content, author, image, slug, tags },
            { new: true }
        );

        // Clean up the replaced/removed image from Cloudinary now that nothing points at it.
        if (previousImage && previousImage !== image) {
            await deleteCloudinaryImages([previousImage]);
        }

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

        if (blog.image) {
            await deleteCloudinaryImages([blog.image]);
        }

        res.json({ msg: 'Blog deleted' });
    } catch (err: any) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
};
