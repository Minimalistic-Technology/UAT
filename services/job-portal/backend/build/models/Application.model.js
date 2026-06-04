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
export var ListingType;
(function (ListingType) {
    ListingType["JOB"] = "job";
    ListingType["INTERNSHIP"] = "internship";
})(ListingType || (ListingType = {}));
const applicationSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        // No static `ref` here — we use refPath for dynamic population
        refPath: 'listingType',
        required: true,
    },
    listingType: {
        type: String,
        enum: Object.values(ListingType),
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
    interviewDate: Date,
    employerNotes: String,
}, {
    timestamps: true,
});
// Prevent duplicate applications
applicationSchema.index({ listing: 1, jobSeeker: 1 }, { unique: true });
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
