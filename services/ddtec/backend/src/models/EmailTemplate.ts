import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
    name: string;
    category: string;
    description: string;
    subject: string;
    previewText: string;
    badge: string;
    html: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: "Custom"
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    previewText: {
        type: String,
        trim: true,
        default: ""
    },
    badge: {
        type: String,
        trim: true,
        default: "CUSTOM"
    },
    html: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export default mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
