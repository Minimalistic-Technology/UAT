import mongoose, { Schema, HydratedDocument } from 'mongoose';

export type TokenType = 'refresh' | 'reset';

export interface IToken {
  user: Schema.Types.ObjectId;
  tokenHash: string;
  type: TokenType;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type TokenDocument = HydratedDocument<IToken>;

const tokenSchema = new Schema<IToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    type: { type: String, enum: ['refresh', 'reset'], required: true },
    expiresAt: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

tokenSchema.index({ user: 1 });
tokenSchema.index({ type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.models.Token || mongoose.model<IToken>('Token', tokenSchema);
export default Token;

