import z from "zod";

export const objectIdSchema = z
  .string()
  .min(1, "Invalid ObjectId")
  .max(24, "Invalid ObjectId")