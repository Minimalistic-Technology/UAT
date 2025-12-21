import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActiveSession extends Document {
  userId: Types.ObjectId;
  gameConfigId: Types.ObjectId;
  questions: Record<string, any>[];
  currentQuestionIndex: number;
  prizeLadder: Record<string, any>[];
  lifelines: Record<string, boolean>;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

const ActiveSessionSchema = new Schema<IActiveSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "RegisteredUser", required: true },
    gameConfigId: { type: Schema.Types.ObjectId, ref: "GameConfig", required: true },

    // ✅ Use generic object array instead of Schema.Types.Mixed[]
    questions: {
      type: [Object],
      required: true,
      default: [],
    },

    prizeLadder: {
      type: [Object],
      required: true,
      default: [],
    },

    currentQuestionIndex: { type: Number, default: 0 },
    lifelines: { type: Schema.Types.Mixed, default: {} },
    isCompleted: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IActiveSession>("ActiveSession", ActiveSessionSchema);