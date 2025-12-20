import mongoose, { Schema, Document } from 'mongoose';

interface IMediaAsset {
  url: string;
  fileName: string;
}

interface IPrizeLevel {
  level: number;
  type: 'money' | 'gift';
  value: number | string;
  isSafe: boolean;
  media?: IMediaAsset;
}

interface ILifeline {
  '50:50': boolean;
  'Audience Poll': boolean;
  'Expert Advice': boolean;
  'Flip Question': boolean;
}

export interface IGameConfig extends Document {
  configName: string;
  isActive: boolean;
  selectedBanks: string[];
  prizeLadder: IPrizeLevel[];
  lifelines: ILifeline;
}

const MediaAssetSchema = new Schema({
  url: { type: String, required: true },
  fileName: { type: String, required: true },
});

const PrizeLevelSchema = new Schema({
  level: { type: Number, required: true },
  type: { type: String, enum: ['money', 'gift'], required: true },
  value: { type: Schema.Types.Mixed, required: true },
  isSafe: { type: Boolean, default: false },
  media: { type: MediaAssetSchema, required: false },
});

const LifelineSchema = new Schema({
  '50:50': { type: Boolean, required: true },
  'Audience Poll': { type: Boolean, required: true },
  'Expert Advice': { type: Boolean, required: true },
  'Flip Question': { type: Boolean, required: true },
}, { _id: false });

const GameConfigSchema = new Schema<IGameConfig>({
  configName: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: false, index: true },
  selectedBanks: [{ type: String, required: true }],
  prizeLadder: [PrizeLevelSchema],
  lifelines: { type: (LifelineSchema as any), required: true },
}, { 
  timestamps: true 
});

export default mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);