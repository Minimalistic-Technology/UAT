import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
// export enum UserRole {
//   JOB_SEEKER = "jobseeker",
//   EMPLOYER = "employer",
//   ADMIN = "admin",
// }
export var GlobalRole;
(function (GlobalRole) {
    GlobalRole["USER"] = "user";
    GlobalRole["SUPER_ADMIN"] = "super_admin";
})(GlobalRole || (GlobalRole = {}));
const userSchema = new Schema({
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
}, {
    timestamps: true,
});
// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return await bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model("User", userSchema);
