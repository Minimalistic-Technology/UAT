// controllers/authController.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthUserModel } from '../models/authUser';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '7d';

const createToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const sendTokenResponse = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// 👇 IMPORTANT: type as RequestHandler and don't return Response
export const register: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyID,
      role = "user",
      contact,
      address,
      photoURL,
    } = req.body;

    if (!name || !email || !password || !companyID) {
      res.status(400).json({
        message: "Name, email, password and companyID are required",
      });
      return;
    }

    const existingUser = await AuthUserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await AuthUserModel.create({
      name,
      email,
      password: hashedPassword,
      companyID,
      role,
      contact,
      address,
      photoURL,
    });

    const token = createToken(user._id.toString(), user.role);
    sendTokenResponse(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        address: user.address,
        dateOfJoin: user.dateOfJoin,
        photoURL: user.photoURL,
      },
    });
    return;
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await AuthUserModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = createToken(user._id.toString(), user.role);
    sendTokenResponse(res, token);

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        address: user.address,
        dateOfJoin: user.dateOfJoin,
        photoURL: user.photoURL,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getMe: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user?.id;

    const user = await AuthUserModel.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUsers: RequestHandler = async (req: any, res) => {
  try {
    const { role, companyID } = req.user;

    let users;

    if (role === "super_admin") {
      users = await AuthUserModel.find().select("-password");
    } else if (role === "admin") {
      users = await AuthUserModel.find({ companyID }).select("-password");
    } else {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("GetUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser: RequestHandler = async (req: any, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    const userToUpdate = await AuthUserModel.findById(id);
    if (!userToUpdate) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Permission checks
    if (
      requester.role !== "super_admin" &&
      requester.id !== id &&
      requester.companyID !== userToUpdate.companyID
    ) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const allowedFields = [
      "name",
      "contact",
      "address",
      "photoURL",
      "role", // admin/super_admin only
    ];

    const updates: any = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only admin/super_admin can change role
    if (
      updates.role &&
      !["admin", "super_admin"].includes(requester.role)
    ) {
      delete updates.role;
    }

    const updatedUser = await AuthUserModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("UpdateUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser: RequestHandler = async (req: any, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    const user = await AuthUserModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Prevent self-delete
    if (requester.id === id) {
      res.status(400).json({ message: "Cannot delete your own account" });
      return;
    }

    // Permission checks
    if (
      requester.role !== "super_admin" &&
      (requester.role !== "admin" ||
        requester.companyID !== user.companyID)
    ) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DeleteUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateProfile: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Only allow these fields to be updated by user
    const allowedFields = ["name", "contact", "address", "photoURL"];

    const updates: any = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Prevent empty update
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    const updatedUser = await AuthUserModel.findByIdAndUpdate(
      userId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};