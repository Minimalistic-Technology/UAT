import mongoose, { Schema } from 'mongoose';
import { ExperienceLevel, IBaseJob, baseJobSchemaDefinition } from './BaseJob.model.js';

export interface IJob extends IBaseJob {
    experienceLevel: ExperienceLevel;
    experienceInYears: number;
    salary: {
        min?: number;
        max?: number;
        currency: string;
        period: 'hourly' | 'monthly' | 'yearly';
    };
}

export { ExperienceLevel } from './BaseJob.model.js';

const jobSchema = new Schema<IJob>(
    {
        ...baseJobSchemaDefinition,
        experienceLevel: {
            type: String,
            enum: Object.values(ExperienceLevel),
            required: true,
        },
        experienceInYears: {
            type: Number,
            min: 0,
            required: true,
        },
        salary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD',
            },
            period: {
                type: String,
                enum: ['hourly', 'monthly', 'yearly'],
                default: 'yearly',
            },
        },
    },
    { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
jobSchema.index({ roleCategory: 1 });
jobSchema.index({ industry: 1 });
jobSchema.index({ 'education.minimumDegree': 1, 'education.isRequired': 1 });

export default mongoose.model<IJob>('job', jobSchema);