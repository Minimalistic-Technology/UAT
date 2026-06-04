import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteConfig extends Document {
    path: string;
    name: string;
    description: string;
    isActive: boolean;
}

const RouteConfigSchema: Schema = new Schema({
    path: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model<IRouteConfig>('RouteConfig', RouteConfigSchema);
