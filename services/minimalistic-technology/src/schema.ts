import z from "zod";

export const getTeamMemberByIdSchema = z.object({
  id: z.string().nonoptional("Id is required"),
});

export const deleteTeamMemberSchema = getTeamMemberByIdSchema;

export const createTeamMemberSchema = z.object({
  name: z.string().nonoptional("Name is required"),
  position: z.string().nonoptional("Position is required"),
  imageUrl: z.string().nonoptional("Image URL is required"),
});

export const updateTeamMemberBodySchema = createTeamMemberSchema;

export const updateTeamMemberParamsSchema = z.object({
    id: z.string().nonoptional("Id is required"),
});