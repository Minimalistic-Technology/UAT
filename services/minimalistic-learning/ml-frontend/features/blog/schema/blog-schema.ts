import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(2, "Title is too short").max(120, "Title must not exceed 120 characters"),
  content: z.string().min(1, "Content must not be empty"),
  excerpt: z.string().max(300, "Excerpt must not exceed 300 characters").optional().or(z.literal("")),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string().min(2, "Tag must be at least 2 characters").max(30, "Tag must not exceed 30 characters"))
    .max(5, "Maximum 5 tags allowed"), // Removed .default([]) to avoid input/output type mismatch in Resolver
  category: z.string().min(2, "Category is required").max(30, "Category must not exceed 30 characters"),
  status: z.enum(["draft", "published"]),
});
