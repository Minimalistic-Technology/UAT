import mongoose, { Schema, Document } from "mongoose";

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


export interface IQuestion extends Document {
  bankId: mongoose.Types.ObjectId;
  text: string;
  options: Option[];
  correctIndex: number;
  categories: string[];
  mediaRef?: IMediaRef;
  status: "draft" | "published";
  versions: QuestionVersion[];
  scheduledAt?: Date;
  createdBy: string;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<Option>(
  {
    text: { type: String, required: true },
    mediaRef: String,
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
    format : { type: String, required: true },
  },
  { _id: false }
);


const QuestionSchema = new Schema<IQuestion>(
  {
    bankId: { type: Schema.Types.ObjectId, ref: "QuestionBank", required: true },
    text: { type: String, required: true },
    options: {
      type: [OptionSchema],
      validate: [(v: Option[]) => v.length === 4, "Options must have exactly 4 entries."],
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    categories: [String],
    mediaRef: MediaRefSchema,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    versions: [VersionSchema],
    scheduledAt: Date,
    createdBy: String,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
     
