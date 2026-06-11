import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
    userId: mongoose.Types.ObjectId;
    driveItemId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    mimeType?: string;
    webUrl: string;
    downloadUrl?: string;
    createdAt: Date;
    modifiedAt: Date;
    designation: string;
    isDuplicate: boolean;
    isLargeFile: boolean;
    checksum?: string;
    lastSyncedAt: Date;
}

const FileSchema = new Schema<IFile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driveItemId: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    mimeType: { type: String },
    webUrl: { type: String, required: true },
    downloadUrl: { type: String },
    createdAt: { type: Date, required: true },
    modifiedAt: { type: Date, required: true },
    designation: {
        type: String,
        enum: ['UNCLASSIFIED', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET'],
        default: 'UNCLASSIFIED'
    },
    isDuplicate: { type: Boolean, default: false },
    isLargeFile: { type: Boolean, default: false },
    checksum: { type: String },
    lastSyncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

FileSchema.index({ userId: 1, fileType: 1 });
FileSchema.index({ userId: 1, designation: 1 });

// Ensure id field is returned to match frontend expectation
FileSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model<IFile>('File', FileSchema);
