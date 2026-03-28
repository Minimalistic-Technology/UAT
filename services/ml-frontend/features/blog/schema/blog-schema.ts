import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title must not exceed 120 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().max(300, "Excerpt must not exceed 300 characters").optional().or(z.literal("")),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string().min(2, "Tag must be at least 2 characters").max(30, "Tag must not exceed 30 characters"))
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed"),
  status: z.enum(["draft", "published"]),
});
