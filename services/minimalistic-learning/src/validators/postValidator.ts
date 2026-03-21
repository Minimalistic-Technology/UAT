import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const postParamsSchema = z.object({
  blogId: objectIdSchema,
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  content: z.string().min(1, "Content is required").trim(),
  category: z.string().min(1, "Category is required").max(30).trim(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  published: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional(),
});

export const updatePostSchema = createPostSchema.partial();
