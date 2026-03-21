import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .min(1, "Invalid ObjectId")
  .max(24, "Invalid ObjectId");

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment is too long"),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment is too long"),
});

export const commentParamsSchema = z.object({
  id: objectIdSchema,
});

export const postCommentsParamsSchema = z.object({
  postId: objectIdSchema,
});
