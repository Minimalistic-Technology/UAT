import { Request, Response } from 'express';
import { TemplateModel } from '../models/template';

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = new TemplateModel(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create template' });
  }
};

export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await TemplateModel.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = await TemplateModel.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
    } else {
      res.json(template);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error finding template' });
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await TemplateModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ error: 'Template not found' });
    } else {
      res.json(updated);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await TemplateModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Template not found' });
    } else {
      res.json({ message: 'Template deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
