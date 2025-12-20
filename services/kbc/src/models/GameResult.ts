import mongoose, { Schema, Document } from "mongoose";

interface IPrize {
  type: "money" | "gift";
  value: number | string;
}

interface IQuestionHistory {
  text: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
}

export interface IGameResult extends Document {
  userId: string;
  finalScore: number;
  isWinner: boolean;
  prize: IPrize;
  totalTimeSeconds: number;
  lifelinesUsed: string[];
  questionHistory: IQuestionHistory[];
  createdAt: Date;
}

const PrizeSchema = new Schema<IPrize>(
  {
    type: { type: String, enum: ["money", "gift"], required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const QuestionHistorySchema = new Schema<IQuestionHistory>(
  {
    text: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeTakenSeconds: Number,
  },
  { _id: false }
);

const GameResultSchema = new Schema<IGameResult>(
  {
    userId: { type: String, required: true },
    finalScore: { type: Number, required: true },
    isWinner: { type: Boolean, required: true },
    prize: { type: PrizeSchema, required: true },
    totalTimeSeconds: { type: Number, required: true },
    lifelinesUsed: [String],
    questionHistory: [QuestionHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model<IGameResult>("GameResult", GameResultSchema);
