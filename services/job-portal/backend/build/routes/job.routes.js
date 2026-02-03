import express from 'express';
import { body } from 'express-validator';
import { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, } from '../controllers/job.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { UserRole } from '../models/User.model.js';
const router = express.Router();
// Validation rules
const jobValidation = [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required'),
    body('jobType').notEmpty().withMessage('Job type is required'),
    body('experienceLevel')
        .notEmpty()
        .withMessage('Experience level is required'),
];
router.get('/', getJobs);
router.get('/my-jobs', protect, authorize(UserRole.EMPLOYER), getMyJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize(UserRole.EMPLOYER), validate(jobValidation), createJob);
router.put('/:id', protect, authorize(UserRole.EMPLOYER), updateJob);
router.delete('/:id', protect, authorize(UserRole.EMPLOYER), deleteJob);
export default router;
