import { Schema, model, Types } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 300 },
    coverImage: {
      url: { type: String },
      alt: { type: String, default: "" },
      publicId: { type: String, default: '' },
    },
    readTime: { type: Number, default: 0 }, // in minutes
    tags: [{ type: String, index: true }],
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: false },
    category: { type: String, required: true, trim: true, maxLength: 30 },
    
  },
  { timestamps: true },
);

PostSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  next;
});

function stripToPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`[^`]*`/g, "") // remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[.*?\]\(.*?\)/g, "") // remove links
    .replace(/#{1,6}\s+/g, "") // remove headings
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // remove bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // remove italic
    .replace(/<[^>]+>/g, "") // remove HTML tags
    .replace(/\n+/g, " ") // collapse newlines
    .trim();
}

PostSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    // Auto read time
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);

    // Auto description
    const plain = stripToPlainText(this.content);
    this.description = plain.length > 300 ? plain.slice(0, 297) + "..." : plain;
  }
  next;
});

PostSchema.index({ title: "text", content: "text", description: "text" });

export default model("Post", PostSchema);
