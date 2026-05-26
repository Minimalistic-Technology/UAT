import mongoose, { Document, Schema ,HydratedDocument } from 'mongoose';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

export enum ListingType {
  JOB = 'job',
  INTERNSHIP = 'internship',
}

export interface IApplication extends Document {
  listing: mongoose.Types.ObjectId;
  listingType: ListingType;
  jobSeeker: mongoose.Types.ObjectId;
  resume: string;
  coverLetter?: string;
  
  status: ApplicationStatus;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    note?: string;
  }>;
  
  interviewDate?: Date;
  employerNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ listing: 1, jobSeeker: 1 }, { unique: true });

// Add initial status to history
applicationSchema.pre(
  'save',
  async function (this: HydratedDocument<IApplication>) {
    if (this.isNew) {
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date(),
      });
    }
  }
);

export default mongoose.model<IApplication>('Application', applicationSchema);