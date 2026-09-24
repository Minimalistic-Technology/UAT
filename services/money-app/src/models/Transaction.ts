import { Schema, models, model, Types } from "mongoose";
import { TRANSACTION_CATEGORIES, TransactionCategory } from "@/lib/categories";

export type TransactionType = "debit" | "credit" | "unknown";
export type TransactionStatus = "new" | "pending" | "categorized";

export type { TransactionCategory };

export interface ITransaction {
  userId: Types.ObjectId;
  gmailMessageId: string;
  subject: string;
  from: string;
  receivedAt: Date;
  amount: number | null;
  currency: string | null;
  type: TransactionType;
  merchant: string | null;
  accountLast4: string | null;
  snippet: string;
  status: TransactionStatus;
  category: TransactionCategory | null;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gmailMessageId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    from: { type: String, required: true },
    receivedAt: { type: Date, required: true },
    amount: { type: Number, default: null },
    currency: { type: String, default: null },
    type: { type: String, enum: ["debit", "credit", "unknown"], default: "unknown" },
    merchant: { type: String, default: null },
    accountLast4: { type: String, default: null },
    snippet: { type: String, default: "" },
    status: { type: String, enum: ["new", "pending", "categorized"], default: "new", index: true },
    category: { type: String, enum: [...TRANSACTION_CATEGORIES, null], default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
