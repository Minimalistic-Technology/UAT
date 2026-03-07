import { Request, Response } from "express";
import Team from "../../models/teams/team";
import asyncHandler from "../../utils/asyncHandler";
import ErrorHandler from "../../utils/errorHandler";
import mongoose from "mongoose";

export const createTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, position, imageUrl } = req.body;

    if (!name || !position || !imageUrl) {
      throw new ErrorHandler("Name, position and image URL are required", 400);
    }

    if (!imageUrl) {
      throw new ErrorHandler("Image URL is required", 400);
    }

    const memberExists = await Team.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      position: { $regex: `^${position}$`, $options: "i" },
    }).lean();

    if (memberExists) {
      throw new ErrorHandler(
        "The member with this name and position already exists",
        400,
      );
    }

    const newMember = await Team.create({
      name,
      position,
      imageUrl,
    });

    res.status(201).json(newMember);
  },
);

export const getAllTeamMembers = asyncHandler(
  async (_req: Request, res: Response) => {
    const members = await Team.find();
    res.status(200).json(members);
  },
);

export const getTeamMemberById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ErrorHandler("Team member ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ErrorHandler("Invalid team member ID", 400);
    }

    const member = await Team.findById(req.params.id);

    if (!member) {
      throw new ErrorHandler("Team member not found", 404);
    }

    res.status(200).json(member);
  },
);

export const updateTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ErrorHandler("Team member ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ErrorHandler("Invalid team member ID", 400);
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ErrorHandler("Team member not found", 404);
    }

    res.status(200).json(updated);
  },
);

export const deleteTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ErrorHandler("Team member ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ErrorHandler("Invalid team member ID", 400);
    }

    const deleted = await Team.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new ErrorHandler("Team member not found", 404);
    }

    res.status(200).json({ message: "Team member deleted successfully" });
  },
);
