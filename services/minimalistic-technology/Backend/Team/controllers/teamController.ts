import {Request, Response} from "express";
import Team from "../models/team";
import { cache } from "../../utils/Cache";

export const createTeamMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {name, position, imageUrl} = req.body;
    console.log("Creating team member:", {name, position, imageUrl});
    if (!imageUrl) res.status(400).json({error: "Image URL required"});

    const newMember = new Team({
      name,
      position,
      imageUrl,
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({error: "Failed to create team member"});
  }
};

export const getAllTeamMembers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const cacheMembers: any[] = await cache.get("getAllMembers", []);
    
    if (cacheMembers) {
      console.log("cache hit")
      res.json(cacheMembers);
      return 
    }
    
    console.log("db hit")
    const members = await Team.find({});
    cache.set("getAllMembers", [], members, 24 * 60 * 60);

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(400).json({error: "Failed to fetch team members"});
  }
};

export const getTeamMemberById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) res.status(404).json({error: "Team member not found"});
    res.json(member);
  } catch (err) {
    res.status(500).json({error: "Error fetching team member"});
  }
};

export const updateTeamMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) res.status(404).json({error: "Team member not found"});
    res.json(updated);
  } catch (err) {
    res.status(400).json({error: "Failed to update team member"});
  }
};

export const deleteTeamMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) res.status(404).json({error: "Team member not found"});
    res.json({message: "Team member deleted"});
  } catch (err) {
    res.status(400).json({error: "Failed to delete team member"});
  }
};
