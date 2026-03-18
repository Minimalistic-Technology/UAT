import mongoose, { Schema } from 'mongoose';
export var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["REVIEWED"] = "reviewed";
    ApplicationStatus["SHORTLISTED"] = "shortlisted";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["INTERVIEW"] = "interview";
    ApplicationStatus["OFFERED"] = "offered";
    ApplicationStatus["ACCEPTED"] = "accepted";
    ApplicationStatus["WITHDRAWN"] = "withdrawn";
})(ApplicationStatus || (ApplicationStatus = {}));
const applicationSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    jobSeeker: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: String,
        required: true,
    },
    coverLetter: String,
    status: {
        type: String,
        enum: Object.values(ApplicationStatus),
        default: ApplicationStatus.PENDING,
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: Object.values(ApplicationStatus),
            },
            changedAt: {
                type: Date,
                default: Date.now,
            },
            changedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            note: String,
        },
    ],
    employerNotes: String,
}, {
    timestamps: true,
});
// Prevent duplicate applications
applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });
// Add initial status to history
applicationSchema.pre('save', async function () {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
        });
    }
});
export default mongoose.model('Application', applicationSchema);
