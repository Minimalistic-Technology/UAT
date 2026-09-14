import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

// Helper to create slug
const createSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, parent, description, image } = req.body;
        const slug = createSlug(name);

        const category = new Category({
            name,
            slug,
            parent: parent || null,
            description,
            image
        });

        await category.save();
        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().populate('parent', 'name');
        res.status(200).json(categories);
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id).populate('parent', 'name');
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name, parent, description, image } = req.body;
        const slug = name ? createSlug(name) : undefined;

        const updateData: any = { name, parent, description, image };
        if (slug) updateData.slug = slug;

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });

        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                msg: `Cannot delete "${category.name}" because it has ${productCount} product${productCount > 1 ? 's' : ''} assigned to it. Move or delete those products first.`
            });
        }

        const subCategoryCount = await Category.countDocuments({ parent: req.params.id });
        if (subCategoryCount > 0) {
            return res.status(400).json({
                msg: `Cannot delete "${category.name}" because it has ${subCategoryCount} subcategor${subCategoryCount > 1 ? 'ies' : 'y'}. Delete or reassign those first.`
            });
        }

        await category.deleteOne();
        res.status(200).json({ msg: 'Category deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};
