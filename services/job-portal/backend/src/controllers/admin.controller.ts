import { Request, Response } from "express";
import User from "../models/User.model.js";
import { JobStatus } from "../models/Job.model.js";
import Job from "../models/Job.model.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find()
        .select("-password") // Exclude sensitive data
        .sort({ createdAt: -1 }) // Newest users first
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    if (!users) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to fetch users" });
    }

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: {
        count: totalUsers,
        users,
        pagination: {
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getJobsByStatus = async (req: Request, res: Response) => {
  try {
    let { status, page, limit } = req.query;

    const jobStatus = (status as string) || JobStatus.PENDING;

    const currentPage = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.max(1, parseInt(limit as string) || 10);
    const skip = (currentPage - 1) * pageSize;

    const [jobs, totalJobs] = await Promise.all([
      Job.find({ status: jobStatus })
        .populate("company", "name logo") // Example population
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Job.countDocuments({ status: jobStatus }),
    ]);

    const totalPages = Math.ceil(totalJobs / pageSize);

    return res.status(200).json({
      success: true,
      message: `Jobs with status '${jobStatus}' fetched successfully`,
      data: {
        count: totalJobs,
        jobs,
        pagination: {
          totalPages,
          currentPage,
          limit: pageSize,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching jobs",
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? "activated" : "deactivated"} successfully.`,
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching jobs",
      error: error.message,
    });
  }
};
