import { Request, Response } from "express";
import { LeaveModel, ILeave } from "../models/leave";
import { AuthUserModel } from "../models/authUser";
import mongoose from "mongoose";
import { AuthRequest } from "../utils/types";

export const applyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const email = authReq.user?.email;
    const companyID = authReq.user?.companyID;

    console.log(userId , email , companyID);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: user not found in token" });
      return;
    }

    const { from, to, reason , leaveType } = req.body;
    if (!from || !to || !reason || !leaveType) {
      res.status(400).json({ message: "Missing required fields: from, to, reason" });
      return;
    }

    const leave = new LeaveModel({
      user_id: userId,
      email,
      companyID,
      from,
      to,
      reason,
      leaveType,
      status: "Pending",
      appliedAt: new Date(),
    });

    await leave.save();

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ message: "Server error applying leave" });
  }
};


export const editLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    if (leave.status !== "Pending") {
      res.status(400).json({ message: "Cannot edit leave once it is handled" });
      return;
    }

    if (leave.user_id !== userId) {
      res.status(403).json({ message: "Forbidden: cannot edit other's leave" });
      return;
    }



    const { from, to, reason } = req.body;
    leave.from = from ?? leave.from;
    leave.to = to ?? leave.to;
    leave.reason = reason ?? leave.reason;

    await leave.save();
    res.status(200).json({ message: "Leave updated successfully", leave });
  } catch (error) {
    console.error("Edit leave error:", error);
    res.status(500).json({ message: "Server error editing leave" });
  }
};

export const handleLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const handledBy = (req as AuthRequest).user?.id;


    if (!handledBy) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!["Approved", "Rejected"].includes(action)) {
      res.status(400).json({ message: "Invalid action. Must be 'Approved' or 'Rejected'" });
      return;
    }

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    if (leave.status !== "Pending") {
      res.status(400).json({ message: "Leave has already been handled" });
      return;
    }

    leave.status = action as "Approved" | "Rejected";
    leave.handledBy = handledBy;
    await leave.save();

    res.status(200).json({ message: `Leave ${action.toLowerCase()} successfully`, leave });
  } catch (error) {
    console.error("Handle leave error:", error);
    res.status(500).json({ message: "Server error handling leave" });
  }
};



export const getLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    let leaves;
    if (!userId) {
      res.status(402).json({ message: "User not found" });
      return;
    }

    leaves = await LeaveModel.find({ user_id: userId }).sort({ appliedAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error("Get leaves error:", error);
    res.status(500).json({ message: "Server error fetching leaves" });
  }
};



export const getLeavesAll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { role, companyID, id: userId } = user;

    // Only admin, hr, super_admin allowed
    if (!["admin", "hr", "super_admin"].includes(role)) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const { status } = req.query;

    let query: any = {};

    // 🔹 Admin & HR → company leaves EXCEPT their own
    if (role === "admin" || role === "hr") {
      query.companyID = companyID;
      query.user_id = { $ne: userId }; 
    }

    // 🔹 Super admin → no restriction
    // (can see everything including own)

    

    const leaves = await LeaveModel.find(query).sort({ appliedAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error("Get leaves error:", error);
    res.status(500).json({ message: "Server error fetching leaves" });
  }
};

export const getLeaveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leave = await LeaveModel.findById(id);

    if (!leave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    res.status(200).json(leave);
  } catch (error) {
    console.error("Get leave by ID error:", error);
    res.status(500).json({ message: "Server error fetching leave" });
  }
};



export const deleteLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id;

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }
    // only user can delete if pending only 
    // if ( req.user?.role !== "Admin") {
    //   res.status(403).json({ message: "Forbidden: cannot delete this leave" });
    //   return;
    // }

    await leave.deleteOne();
    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    console.error("Delete leave error:", error);
    res.status(500).json({ message: "Server error deleting leave" });
  }
};
