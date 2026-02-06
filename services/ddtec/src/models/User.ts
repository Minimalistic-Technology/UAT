import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    if (typeof this.password === "string") {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

export default mongoose.model("User", UserSchema);
