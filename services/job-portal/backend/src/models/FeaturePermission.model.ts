import mongoose, { Schema, Document } from "mongoose";

export interface IFeaturePermission extends Document {
    feature: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;     // Specific user mapping
    company?: mongoose.Types.ObjectId;  // Specific company mapping
}

const FeaturePermissionSchema: Schema = new Schema(
    {
        feature: { type: Schema.Types.ObjectId, ref: "Feature", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        company: { type: Schema.Types.ObjectId, ref: "Company" },
    },
    { timestamps: true }
);

// A user/company shouldn't be mapped to the same feature twice
FeaturePermissionSchema.index({ feature: 1, user: 1 }, { unique: true, sparse: true });
FeaturePermissionSchema.index({ feature: 1, company: 1 }, { unique: true, sparse: true });

export default mongoose.model<IFeaturePermission>("FeaturePermission", FeaturePermissionSchema);
