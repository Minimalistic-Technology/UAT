import { z } from "zod";
import { loginSchema, registerSchema } from "../schema/auth-schema";

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
