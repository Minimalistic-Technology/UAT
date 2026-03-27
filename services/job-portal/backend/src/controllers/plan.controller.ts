import { Request, Response } from "express";
import Plan from "../models/Plan.model.js";

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Protected/Super_Admin
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, durationDays, features, isActive } = req.body;

    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, price, and durationDays",
      });
    }

    const plan = await Plan.create({
      name,
      price,
      durationDays,
      features,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all active plans
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true });

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all plans (including inactive)
// @route   GET /api/admin/plans
// @access  Protected/Super_Admin
export const getAllAdminPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find();

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
