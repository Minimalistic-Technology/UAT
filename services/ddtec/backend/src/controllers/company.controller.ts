import { Request, Response } from 'express';
import Company from '../models/Company';

const sendCompanyError = (res: Response, err: any, fallbackMsg: string) => {
    if (err?.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ msg: messages[0] || fallbackMsg, errors: messages });
        return;
    }
    if (err?.name === 'CastError') {
        res.status(400).json({ msg: `Invalid value for field "${err.path}"` });
        return;
    }
    console.error(fallbackMsg, err);
    res.status(500).json({ msg: fallbackMsg });
};

// @desc    List companies with optional search
// @route   GET /api/companies
export const getCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;
        const query: any = {};
        if (search) {
            const re = new RegExp(String(search), 'i');
            query.$or = [{ name: re }, { location: re }, { gstNumber: re }];
        }
        const companies = await Company.find(query).sort({ createdAt: -1 }).lean();
        res.json(companies);
    } catch (err: any) {
        console.error('Error fetching companies:', err);
        res.status(500).json({ msg: 'Server error fetching companies' });
    }
};

// @desc    Create a company
// @route   POST /api/companies
export const createCompany = async (req: any, res: Response): Promise<void> => {
    try {
        const company = new Company({ ...req.body, createdBy: req.user?._id });
        await company.save();
        res.status(201).json(company);
    } catch (err: any) {
        sendCompanyError(res, err, 'Server error creating company');
    }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!company) {
            res.status(404).json({ msg: 'Company not found' });
            return;
        }
        res.json(company);
    } catch (err: any) {
        sendCompanyError(res, err, 'Server error updating company');
    }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            res.status(404).json({ msg: 'Company not found' });
            return;
        }
        res.json({ msg: 'Company deleted' });
    } catch (err: any) {
        console.error('Error deleting company:', err);
        res.status(500).json({ msg: 'Server error deleting company' });
    }
};
