import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    isEmailVerified: boolean;
    phone?: string;
    isPhoneVerified: boolean;
    password?: string;
    role: 'user' | 'super_admin' | 'product_manager' | 'order_manager' | 'customer_support' | 'finance' | 'marketing' | 'admin' | 'warehouse';
    customPages?: string[];
    editPages?: string[];
    addPages?: string[];
    deletePages?: string[];
    isActive?: boolean;
    creditBalance?: number;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    loginAttempts: number;
    lockUntil?: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    firstName: {
        type: String,
        // required: true, // Made optional for simplified signup
    },
    lastName: {
        type: String,
        // required: true, // Made optional for simplified signup
    },
    // Keeping name for backward compatibility or full name display
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple nulls
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'super_admin', 'product_manager', 'order_manager', 'customer_support', 'finance', 'marketing', 'admin', 'warehouse'],
        default: 'user'
    },
    customPages: [{
        type: String
    }],
    editPages: [{
        type: String
    }],
    addPages: [{
        type: String
    }],
    deletePages: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    creditBalance: {
        type: Number,
        default: 0
    },
    // Address Fields
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (this: IUser) {
    if (!this.isModified("password")) return;

    if (this.password && typeof this.password === "string") {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

export default mongoose.model<IUser>("User", UserSchema);
