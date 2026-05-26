import mongoose, { Schema } from 'mongoose';
import { IBaseJob, baseJobSchemaDefinition } from './BaseJob.model.js';

export enum StipendType {
    FIXED = 'fixed',
    PERFORMANCE_BASED = 'performance_based',
    UNPAID = 'unpaid',
}

export enum DurationType {
    WEEKS = 'weeks',
    MONTHS = 'months',
}

export interface IInternship extends IBaseJob {
    stipend: {
        type: StipendType;
        amount?: number;
        currency: string;
        period: 'monthly' | 'weekly';
    };

    duration: {
        value: number;
        unit: DurationType;
    };

    isPPO: boolean;
    startDate?: Date;
    certificateProvided: boolean;
}

const internshipSchema = new Schema<IInternship>(
    {
        ...baseJobSchemaDefinition,

        stipend: {
            type: {
                type: String,
                enum: Object.values(StipendType),
                required: true,
            },
            amount: {
                type: Number,
                min: 0,
            },
            currency: {
                type: String,
                default: 'INR',
            },
            period: {
                type: String,
                enum: ['monthly', 'weekly'],
                default: 'monthly',
            },
        },

        duration: {
            value: {
                type: Number,
                required: true,
                min: 1,
            },
            unit: {
                type: String,
                enum: Object.values(DurationType),
                required: true,
            },
        },

        isPPO: {
            type: Boolean,
            default: false,
        },
        startDate: Date,
        certificateProvided: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

internshipSchema.index({ title: 'text', description: 'text' });
internshipSchema.index({ status: 1, createdAt: -1 });
internshipSchema.index({ 'location.city': 1, 'location.country': 1 });
internshipSchema.index({ 'duration.value': 1, 'duration.unit': 1 });
internshipSchema.index({ roleCategory: 1 });
internshipSchema.index({ industry: 1 });
internshipSchema.index({ 'education.minimumDegree': 1, 'education.isRequired': 1 });

export default mongoose.model<IInternship>('Internship', internshipSchema);