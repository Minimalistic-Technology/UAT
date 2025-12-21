import mongoose, { Schema, Document , Types } from 'mongoose';

interface IMediaAsset {
  public_id: string;
  url: string;
  type: string;
  format: string;
}

interface IPrizeLevel {
    _id?: Types.ObjectId;      
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
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  format: { type: String, required: true },
});

const PrizeLevelSchema = new Schema({
  level: { type: Number, required: true },
  type: { type: String, enum: ['money', 'gift'], required: true },
  value: { type: Schema.Types.Mixed, required: true},
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

const GameConfig =
  (mongoose.models.GameConfig as mongoose.Model<IGameConfig>) ||
  mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);

export default GameConfig;
