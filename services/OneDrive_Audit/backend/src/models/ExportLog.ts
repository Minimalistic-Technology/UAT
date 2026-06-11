import mongoose, { Schema, Document } from 'mongoose';

export interface IExportLog extends Document {
    userId: mongoose.Types.ObjectId;
    fileName: string;
    fileCount: number;
    generatedAt: Date;
}

const ExportLogSchema = new Schema<IExportLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileCount: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IExportLog>('ExportLog', ExportLogSchema);
