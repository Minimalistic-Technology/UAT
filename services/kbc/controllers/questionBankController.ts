import { Request, Response } from "express";
import QuestionBank from "../models/QuestionBank";

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  const { published, tag, ageGroup, ordered } = req.query;
  const admin = (req as any).admin;
  const filter: any = {};

  if (published) filter.published = published === "true";
  if (tag) filter.categories = tag;
  if (ageGroup) filter.ageGroup = ageGroup;

  // If user is a questioner, they can only see banks assigned to them
  if (admin && admin.role === "questioner") {
    filter.assignedTo = admin._id;
  }

  let banks = await QuestionBank.find(filter).populate("assignedTo", "name email");
  res.json(banks);
};

export const createBank = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const admin = (req as any).admin;

  let assignedTo = data.assignedTo || [];

  // If questioner creates a bank, they are automatically assigned to it
  if (admin && admin.role === "questioner") {
    // Ensure they can't assign others if that's a rule, or at least ensure they are assigned
    if (!assignedTo.includes(admin._id.toString())) {
      assignedTo.push(admin._id);
    }
  }

  const bank = await QuestionBank.create({
    ...data,
    assignedTo,
    createdBy: admin?._id || "admin",
  });
  res.status(201).json(bank);
};

export const getBank = async (req: Request, res: Response): Promise<void> => {
  const admin = (req as any).admin;
  const bank = await QuestionBank.findById(req.params.id).populate("assignedTo", "name email");

  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }

  // Access check
  if (admin && admin.role === "questioner" && !bank.assignedTo.some((id: any) => id._id.toString() === admin._id.toString())) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(bank);
};

export const updateBank = async (req: Request, res: Response): Promise<void> => {
  const admin = (req as any).admin;
  const data = req.body;

  const bank = await QuestionBank.findById(req.params.id);
  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }

  // Access check
  if (admin && admin.role === "questioner") {
    if (!bank.assignedTo.some((id: any) => id.toString() === admin._id.toString())) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    // Prevent questioner from changing assignedTo list if strictly restricted? 
    // Usually admin manages access. Let's block assignedTo updates for questioners.
    delete data.assignedTo;
  }

  const updatedBank = await QuestionBank.findByIdAndUpdate(req.params.id, data, {
    new: true,
  }).populate("assignedTo", "name email");

  res.json(updatedBank);
};

export const deleteBank = async (req: Request, res: Response): Promise<void> => {
  const admin = (req as any).admin;
  const bank = await QuestionBank.findById(req.params.id);

  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }

  // Access check - Maybe only Admins can delete? Or creators?
  // User prompt: "only one admin ... admin will crreate questiiner he can mange them give them access to questionbanks so thy can edit those qb"
  // Implication: Questioners edit, maybe not delete? Assuming Questioners can delete if they have access for now, or restriction:

  if (admin && admin.role === "questioner") {
    // For now, let's restriction DELETION to Admin only to be safe, unless user specified otherwise.
    // Actually typical flow: Admin creates/deletes, Questioner edits.
    // "give them access to questionbanks so thy can edit those qb" -> "EDIT". Doesn't explicitly say create/delete.
    // But user also said "multiple persons who will create questions and qb". so Questioners CAN create QBs.
    // So they should be able to delete their own QBs (where they are assigned).

    if (!bank.assignedTo.some((id: any) => id.toString() === admin._id.toString())) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  await QuestionBank.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

export const togglePublish = async (req: Request, res: Response): Promise<void> => {
  const admin = (req as any).admin;
  const bank = await QuestionBank.findById(req.params.id);
  if (!bank) {
    res.status(404).json({ error: "Bank not found" });
    return;
  }

  if (admin && admin.role === "questioner" && !bank.assignedTo.some((id: any) => id.toString() === admin._id.toString())) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  bank.published = !bank.published;
  await bank.save();
  res.json(bank);
};
