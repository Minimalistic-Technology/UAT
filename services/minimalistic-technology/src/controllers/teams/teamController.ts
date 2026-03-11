import { Request, Response } from "express";
import Team from "../../models/teams/team";
import asyncHandler from "../../utils/asyncHandler";
import ErrorHandler from "../../utils/errorHandler";
import mongoose from "mongoose";
import { cache } from "../../utils/cache/cache";
import { getTeamMemberByIdSchema, deleteTeamMemberSchema, createTeamMemberSchema, updateTeamMemberParamsSchema, updateTeamMemberBodySchema } from "../../schema";

export const createTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createTeamMemberSchema.safeParse(req.body);

    if(!result.success){
      throw new ErrorHandler(`Validation error: ${JSON.stringify(result.error.flatten().fieldErrors)}`, 200);
    }

    const { name, position, imageUrl } = result.data;

    const memberExists = await Team.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      position: { $regex: `^${position}$`, $options: "i" },
    }).lean();

    if (memberExists) {
      throw new ErrorHandler(
        "The member with this name and position already exists",
        200,
      );
    }

    const newMember = await Team.create({
      name,
      position,
      imageUrl,
    });

    await cache.evict("teams", ["all"]);

    res.status(201).json(newMember);
  },
);

export const getAllTeamMembers = asyncHandler(
  async (_req: Request, res: Response) => {
    const cachedMembers = await cache.get("teams", ["all"]);
    if (cachedMembers) {
      res.status(200).json(cachedMembers);
      return;
    }

    const members = await Team.find();
    await cache.set("teams", ["all"], members);

    res.status(200).json(members);
  },
);

export const getTeamMemberById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = getTeamMemberByIdSchema.safeParse(req.body);

    if (!result.success) {
      throw new ErrorHandler(`Validation error: ${JSON.stringify(result.error.flatten().fieldErrors)}`, 200);
    }

    const { id } = result.data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler("Invalid team member ID", 200);
    }

    const cachedMember = await cache.get("team", [id]);
    if (cachedMember) {
      res.status(200).json(cachedMember);
      return;
    }

    const member = await Team.findById(id);

    if (!member) {
      throw new ErrorHandler("Team member not found", 200);
    }

    await cache.set("team", [id], member);

    res.status(200).json(member);
  },
);

export const updateTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsResult = updateTeamMemberParamsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      throw new ErrorHandler(`Validation error: ${JSON.stringify(paramsResult.error.flatten().fieldErrors)}`, 200);
    }

    const bodyResult = updateTeamMemberBodySchema.safeParse(req.body);

    if (!bodyResult.success) {
      throw new ErrorHandler(`Validation error: ${JSON.stringify(bodyResult.error.flatten().fieldErrors)}`, 200);
    }

    if (!mongoose.Types.ObjectId.isValid(paramsResult.data.id)) {
      throw new ErrorHandler("Invalid team member ID", 200);
    }

    const updated = await Team.findByIdAndUpdate(paramsResult.data.id, bodyResult.data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ErrorHandler("Team member not found", 200);
    }

    await cache.evict("teams", ["all"]);
    await cache.evict("team", [paramsResult.data.id]);

    res.status(200).json(updated);
  },
);

export const deleteTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const result = deleteTeamMemberSchema.safeParse(req.body);

    if (!result.success) {
      throw new ErrorHandler(`Validation error: ${JSON.stringify(result.error.flatten().fieldErrors)}`, 200);
    }

    const { id } = result.data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler("Invalid team member ID", 200);
    }

    const deleted = await Team.findByIdAndDelete(id);

    if (!deleted) {
      throw new ErrorHandler("Team member not found", 200);
    }

    await cache.evict("teams", ["all"]);
    await cache.evict("team", [id]);

    res.status(200).json({ message: "Team member deleted successfully" });
  },
);
