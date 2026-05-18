import { Schema, model, Types } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, default: "Untitled Story" },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: String, default: "" }, // Not required for initial drafts
    description: { type: String, trim: true, maxlength: 300 },
    coverImage: {
      url: { type: String, default: "" },
      alt: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    readTime: { type: Number, default: 0 },
    tags: [{ type: String, index: true }],
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'pending',
      index: true,
    },
    category: { type: String, trim: true, maxLength: 30, default: "Uncategorized" },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    viewCount: { type: Number, default: 0, index: true },
    // Stores hashed viewer identifiers (userId or IP-based fingerprint) — for deduplication
    viewedBy: { type: [String], default: [], select: false },
  },
  { timestamps: true },
);

function stripToPlainText(content: string): string {
  if (!content) return "";
  return content
    .replace(/<[^>]+>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/\n+/g, " ")
    .trim();
}

PostSchema.pre("save", function () {
  if (this.isModified("content") && this.content) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);

    const plain = stripToPlainText(this.content);
    this.description = plain.length > 300 ? plain.slice(0, 297) + "..." : plain;
  }
});

PostSchema.index({ title: "text", content: "text", description: "text" });

export default model("Post", PostSchema);
