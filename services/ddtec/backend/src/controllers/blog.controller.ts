import { Request, Response } from 'express';
import StrapiService from '../services/strapi.service';

// Get all blogs
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const articles = await StrapiService.listArticles();
        res.json(articles.map(StrapiService.toBlogDTO));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get blog by slug
export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const article = await StrapiService.getArticleBySlug(req.params.slug);
        if (!article) return res.status(404).json({ msg: 'Blog not found' });
        res.json(StrapiService.toBlogDTO(article));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get blog by ID (Strapi documentId)
export const getBlogById = async (req: Request, res: Response) => {
    try {
        const article = await StrapiService.getArticleByDocumentId(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Blog not found' });
        res.json(StrapiService.toBlogDTO(article));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create blog
export const createBlog = async (req: Request, res: Response) => {
    try {
        const { title, content, author, image, slug, tags } = req.body;

        const existing = await StrapiService.getArticleBySlug(slug);
        if (existing) {
            return res.status(400).json({ msg: 'Blog with this slug already exists' });
        }

        const article = await StrapiService.createArticle({ title, content, author, image, slug, tags });
        res.json(StrapiService.toBlogDTO(article));
    } catch (err: any) {
        console.error(err.response?.data || err);
        res.status(500).json({ msg: err.response?.data?.error?.message || 'Server Error' });
    }
};

// Update blog
export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { title, content, author, image, slug, tags } = req.body;

        const blog = await StrapiService.getArticleByDocumentId(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        if (slug && slug !== blog.slug) {
            const existing = await StrapiService.getArticleBySlug(slug);
            if (existing) {
                return res.status(400).json({ msg: 'Blog with this slug already exists' });
            }
        }

        const updated = await StrapiService.updateArticle(req.params.id, { title, content, author, image, slug, tags });
        res.json(StrapiService.toBlogDTO(updated));
    } catch (err: any) {
        console.error(err.response?.data || err);
        res.status(500).json({ msg: err.response?.data?.error?.message || 'Server Error' });
    }
};

// Delete blog
export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await StrapiService.getArticleByDocumentId(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        await StrapiService.deleteArticle(req.params.id);
        res.json({ msg: 'Blog deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
