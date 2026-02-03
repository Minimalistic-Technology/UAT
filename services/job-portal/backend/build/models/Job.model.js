import mongoose, { Schema } from 'mongoose';
export var JobType;
(function (JobType) {
    JobType["FULL_TIME"] = "full_time";
    JobType["PART_TIME"] = "part_time";
    JobType["CONTRACT"] = "contract";
    JobType["INTERNSHIP"] = "internship";
    JobType["FREELANCE"] = "freelance";
})(JobType || (JobType = {}));
export var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["ENTRY"] = "entry";
    ExperienceLevel["INTERMEDIATE"] = "intermediate";
    ExperienceLevel["SENIOR"] = "senior";
    ExperienceLevel["EXPERT"] = "expert";
})(ExperienceLevel || (ExperienceLevel = {}));
export var JobStatus;
(function (JobStatus) {
    JobStatus["ACTIVE"] = "active";
    JobStatus["CLOSED"] = "closed";
    JobStatus["PENDING"] = "pending";
    JobStatus["REJECTED"] = "rejected";
})(JobStatus || (JobStatus = {}));
const jobSchema = new Schema({
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
}, {
    timestamps: true,
});
// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
export default mongoose.model('Job', jobSchema);
