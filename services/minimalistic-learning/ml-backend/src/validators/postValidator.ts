import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const postParamsSchema = z.object({
  blogId: objectIdSchema,
});

export const createPostSchema = z.object({
  title: z.string().trim().default("Untitled Story"), // Removed min(1) to allow empty drafts
  content: z.string().trim().default(""),
  category: z.string().trim().max(30).default("Uncategorized"),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  published: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional().default(false),
});

export const updatePostSchema = createPostSchema.partial();
