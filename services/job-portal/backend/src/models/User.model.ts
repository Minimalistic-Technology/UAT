import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum GlobalRole {
  USER = "user",
  SUPER_ADMIN = "super_admin",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  phoneVerified: boolean;
  role: GlobalRole;
  avatar?: string;

  // Job Seeker Specific
  resume?: string;
  resumeOriginalName?: string;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    fieldOfStudy: string;
  }>;
  location?: {
    city: string;
    state: string;
    country: string;
  };

  // Employer Specific
  company?: mongoose.Types.ObjectId;

  // OAuth
  googleId?: string;

  // Status
  isActive: boolean;
  isVerified: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;

  // Password Reset
  resetPasswordOtp?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(GlobalRole),
      default: GlobalRole.USER,
    },
    avatar: String,

    // Job Seeker Fields
    resume: String,
    resumeOriginalName: String,
    skills: [String],
    languages: [String],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        graduationYear: Number,
        fieldOfStudy: String,
      },
    ],
    location: {
      city: String,
      state: String,
      country: String,
    },

    // OAuth
    googleId: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Password Reset
    resetPasswordOtp: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
