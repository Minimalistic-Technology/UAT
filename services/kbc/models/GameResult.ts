import mongoose, { Schema, Document, Model } from "mongoose";


interface IPrizeLevel {
  level: number;
  type: "money" | "gift";
  value: number | string;
  isSafe: boolean;
  media?: { public_id?: string; url?: string; type?: string; format?: string } | null;
}

interface ILangPack {
  text: string;
  options: string[];
  categories: string[];
}

type LangMap = Record<string, ILangPack>;

export interface IQuestionLite {
  id: mongoose.Types.ObjectId | string;
  bankId: mongoose.Types.ObjectId | string;
  lang?: LangMap;                
  correctIndex?: number;          
  status?: string;
  media?: { public_id?: string; url?: string; type?: string; format?: string } | null;
}

export interface IGameResult extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  gameConfigId: mongoose.Types.ObjectId;
  finalScore: number;
  isWinner: boolean;
  correctAnswered:number;
  prizeLadder: IPrizeLevel[];
  totalTimeSeconds?: number;
  lifelinesUsed: string[];
  questions: IQuestionLite[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema(
  {
    public_id: { type: String },
    url: { type: String },
    type: { type: String },
    format: { type: String },
  },
  { _id: false }
);

const PrizeLadderSchema = new Schema<IPrizeLevel>(
  {
    level: { type: Number, required: true },
    type: { type: String, enum: ["money", "gift"], required: true },
    value: { type: Schema.Types.Mixed, required: true },
    isSafe: { type: Boolean, required: true },
    media: { type: MediaSchema, required: false, default: null },
  },
  { _id: false }
);


const LangPackSchema = new Schema<ILangPack>(
  {
    text: { type: String, default: "" },
    options: { type: [String], default: [] },
    categories: { type: [String], default: [] },
  },
  { _id: false }
);

const QuestionLiteSchema = new Schema<IQuestionLite>(
  {
    id: { type: Schema.Types.Mixed, required: true },
    bankId: { type: Schema.Types.Mixed, required: true },
    lang: { type: Map, of: LangPackSchema, required: false, default: undefined },
    correctIndex: { type: Number, required: false, min: 0 },
    status: { type: String, required: false },
    media: { type: MediaSchema, required: false, default: null },
  },
  { _id: false }
);


QuestionLiteSchema.pre("validate", function (next) {
  const q = this as any;

  // Ensure at least one language pack and valid correctIndex
  const hasLang =
    q.lang &&
    q.lang.size > 0 &&
    [...q.lang.values()].every(
      (p: any) =>
        typeof p.text === "string" &&
        Array.isArray(p.options) &&
        p.options.length > 0
    );

  if (!hasLang) {
    (this as any).invalidate(
      "lang",
      "At least one language pack (with text and options[]) is required."
    );
  }

  if (typeof q.correctIndex !== "number" || q.correctIndex < 0) {
    (this as any).invalidate("correctIndex", "A valid correctIndex is required.");
  }

  next();
});

/* ------------------ Main GameResult Schema ------------------ */

const GameResultSchema = new Schema<IGameResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "RegisteredUser", required: true },
    userName: { type: String },
    gameConfigId: { type: Schema.Types.ObjectId, ref: "GameConfig", required: true },
    correctAnswered:{ type: Number, required: true },
    finalScore: { type: Number, required: true },
    isWinner: { type: Boolean, required: true },
    totalTimeSeconds: { type: Number },
    lifelinesUsed: { type: [String], default: [] },
    prizeLadder: { type: [PrizeLadderSchema], default: [] },
    questions: { type: [QuestionLiteSchema], required: true, default: [] },
  },
  { timestamps: true }
);


GameResultSchema.index({ userId: 1, createdAt: -1 });
GameResultSchema.index({ gameConfigId: 1, createdAt: -1 });
GameResultSchema.index({ userId: 1, gameConfigId: 1 }, { unique: true });

export default (mongoose.models.GameResult as Model<IGameResult>) ||
mongoose.model<IGameResult>("GameResult", GameResultSchema);
