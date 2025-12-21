import { Request, Response } from "express";
import QuestionBank from "../models/QuestionBank";

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  const { published, tag, ageGroup, ordered } = req.query;
  const filter: any = {};

  if (published) filter.published = published === "true";
  if (tag) filter.categories = tag;
  if (ageGroup) filter.ageGroup = ageGroup;

  let banks = await QuestionBank.find(filter);
  res.json(banks);
  
};

export const createBank = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;


  const bank = await QuestionBank.create({
    ...data,
    createdBy: (req as any).admin?._id || "admin",
  });
  res.status(201).json(bank);
};

export const getBank = async (req: Request, res: Response): Promise<void> => {
  const bank = await QuestionBank.findById(req.params.id);
  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }
  res.json(bank);
};

export const updateBank = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const bank = await QuestionBank.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });
  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }
  res.json(bank);
};

export const deleteBank = async (req: Request, res: Response): Promise<void> => {
  await QuestionBank.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

export const togglePublish = async (req: Request, res: Response): Promise<void> => {
  const bank = await QuestionBank.findById(req.params.id);
  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }

  bank.published = !bank.published;
  await bank.save();
  res.json(bank);
};
