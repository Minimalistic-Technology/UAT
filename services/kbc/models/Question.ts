import mongoose, { Schema, Document } from "mongoose";

/* -------------------- Interfaces -------------------- */
export interface Option {
  text: string;
  mediaRef?: string;
}

export interface QuestionVersion {
  snapshot: any;
  editedBy: string;
  editedAt: Date;
}

export interface IMediaRef {
  public_id: string;
  url: string;
  type: string;
  format: string;
}

/** Language block (per language) */
export interface LangBlock {
  text: string;
  options: Option[];      // exactly 4
  categories: string[];
}

export interface IQuestion extends Document {
  bankId: mongoose.Types.ObjectId;

  /** Language objects — English required, others optional */
  lang: {
    en: LangBlock;
    hi?: LangBlock;
    gu?: LangBlock;
  };

  correctIndex: number; // shared index for all languages
  mediaRef?: IMediaRef;
  status: "draft" | "published";
  versions: QuestionVersion[];
  scheduledAt?: Date;
  createdBy: string;
  deleted?: boolean;
  isAsked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------- Subschemas -------------------- */
const OptionSchema = new Schema<Option>(
  {
    text: { type: String, required: true },
    mediaRef: String,
  },
  { _id: false }
);

const LangBlockSchema = new Schema<LangBlock>(
  {
    text: { type: String, required: true },
    options: {
      type: [OptionSchema],
      validate: [(v: Option[]) => v.length === 4, "Options must have exactly 4 entries."],
      required: true,
    },
    categories: { type: [String], default: [] },
  },
  { _id: false }
);

const VersionSchema = new Schema<QuestionVersion>(
  {
    snapshot: { type: Schema.Types.Mixed, required: true },
    editedBy: String,
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MediaRefSchema = new Schema<IMediaRef>(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    format: { type: String, required: true },
  },
  { _id: false }
);

/* -------------------- Main Schema -------------------- */
const QuestionSchema = new Schema<IQuestion>(
  {
    bankId: { type: Schema.Types.ObjectId, ref: "QuestionBank", required: true },

    lang: {
      en: { type: LangBlockSchema, required: true },
      hi: { type: LangBlockSchema, required: false },
      gu: { type: LangBlockSchema, required: false },
    },

    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    mediaRef: MediaRefSchema,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    versions: [VersionSchema],
    scheduledAt: Date,
    createdBy: String,
    deleted: { type: Boolean, default: false },
    isAsked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------------------- Validation -------------------- */

QuestionSchema.pre("validate", function (next) {
  const doc = this as any;
  const lang = doc.lang || {};

  // English block must exist
  if (!lang.en) {
    return next(new Error("English (lang.en) is required."));
  }

  // Helper: if a language block exists, it must have exactly 4 options
  const hasFour = (b?: any) => !b || (Array.isArray(b.options) && b.options.length === 4);

  if (!hasFour(lang.en)) {
    return next(new Error("lang.en must have exactly 4 options."));
  }
  if (!hasFour(lang.hi)) {
    return next(new Error("lang.hi must have exactly 4 options when provided."));
  }
  if (!hasFour(lang.gu)) {
    return next(new Error("lang.gu must have exactly 4 options when provided."));
  }

  next();
});
/* -------------------- Export -------------------- */
export default mongoose.model<IQuestion>("Question", QuestionSchema);

