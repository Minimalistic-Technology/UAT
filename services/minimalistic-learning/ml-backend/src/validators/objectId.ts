import z from "zod";

export const objectIdSchema = z
  .string()
  .min(1, "Invalid ID")
  .max(100, "Invalid ID");