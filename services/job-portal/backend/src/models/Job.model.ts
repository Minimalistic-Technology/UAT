import mongoose, { Document, Schema } from 'mongoose';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export interface IJob extends Document {
  title: string;
  description: string;
  company: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };
  
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  
  skills: string[];
  requirements: string[];
  benefits?: string[];
  
  applicationDeadline?: Date;
  openings: number;
  
  status: JobStatus;
  isFeatured: boolean;
  
  applicationsCount: number;
  viewsCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobType: {
      type: String,
      enum: Object.values(JobType),
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
      remote: {
        type: Boolean,
        default: false,
      },
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
    skills: [String],
    requirements: [String],
    benefits: [String],
    applicationDeadline: Date,
    openings: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });

export default mongoose.model<IJob>('Job', jobSchema);