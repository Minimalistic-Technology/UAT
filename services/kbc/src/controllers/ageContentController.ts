import { Request, Response } from "express";
import AgeContent from "../models/AgeContent";

export const createAgeContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const content = await AgeContent.create(data);
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to create age content" });
  }
};

export const getContentByAge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ageGroup, category } = req.query;
    const filter: any = {};
    if (ageGroup) filter.ageGroup = ageGroup;
    if (category) filter.category = category;

    const content = await AgeContent.find(filter).sort({ createdAt: -1 });
    res.json(content);
  } catch (err) {
    console.error("Error fetching age content:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAgeContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const content = await AgeContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!content) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to update age content" });
  }
};

export const deleteAgeContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const content = await AgeContent.findByIdAndDelete(req.params.id);
    if (!content) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete age content" });
  }
};
