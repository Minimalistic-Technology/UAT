import z from "zod";

export const createTeamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateTeamMemberSchema = z.infer<typeof createTeamMemberSchema>;

export const updateTeamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  isActive: z.boolean(),
});

export type UpdateTeamMemberSchema = z.infer<typeof updateTeamMemberSchema>;