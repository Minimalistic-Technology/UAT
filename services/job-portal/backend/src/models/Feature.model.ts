import mongoose, { Schema, Document } from "mongoose";

export enum FeatureStatus {
    DISABLED = "disabled",
    BETA = "beta",
    PUBLIC = "public",
}

export interface IFeature extends Document {
    name: string;
    slug: string;       // e.g. "ai-resume-builder"
    description: string;
    status: FeatureStatus;
}

const FeatureSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        status: {
            type: String,
            enum: Object.values(FeatureStatus),
            default: FeatureStatus.DISABLED
        },
    },
    { timestamps: true }
);

export default mongoose.model<IFeature>("Feature", FeatureSchema);
