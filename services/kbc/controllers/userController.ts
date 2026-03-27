import { Request, Response } from "express";
import RegisteredUser from "../models/RegisteredUser";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, userName , email, phone, age, password } = req.body;

    if (!firstName || !lastName || !userName  || !age || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await RegisteredUser.findOne({ userName });
    if (existingUser) {
      res.status(402).json({ message: "UserName already Taken " });
      return;
    }

    const user = await RegisteredUser.create({ firstName, lastName, userName ,email, phone, age, password });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await RegisteredUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await RegisteredUser.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await RegisteredUser.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await RegisteredUser.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
