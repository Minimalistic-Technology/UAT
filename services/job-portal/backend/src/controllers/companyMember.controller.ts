import type { Response } from "express";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import User, { GlobalRole } from "../models/User.model.js";
import mongoose from "mongoose";

export const getAllCompanyMembers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await CompanyMember.findOne({ user: req.user._id });

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Member record not found." });
    }

    if (currentUser.role !== CompanyRole.OWNER) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Owners only." });
    }

    if (!currentUser.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Account deactivated." });
    }

    const members = await CompanyMember.find({
      company: currentUser.company,
      _id: { $ne: currentUser._id },
    })
      .populate("user", "firstName lastName email")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        count: members.length,
        members,
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ownerMember = await CompanyMember.findOne({
      user: req.user._id,
    }).session(session);
    if (
      !ownerMember ||
      ownerMember.role !== CompanyRole.OWNER ||
      !ownerMember.isActive
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized or invalid access." });
    }

    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const [newUser] = await User.create(
      [
        {
          firstName,
          lastName,
          email,
          password,
          role: GlobalRole.USER,
        },
      ],
      { session },
    );

    await CompanyMember.create(
      [
        {
          user: newUser._id,
          company: ownerMember.company,
          role: CompanyRole.ADMIN,
          isActive: true,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Employee added successfully",
    });
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  //
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  let { memberId } = req.params;

  if (!memberId) {
    return res
      .status(400)
      .json({ success: false, message: "Member ID is required." });
  }

  if (Array.isArray(memberId)) {
    memberId = memberId[0];
  }

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid member ID format." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ownerMember = await CompanyMember.findOne({
      user: req.user._id,
    }).session(session);

    if (
      !ownerMember ||
      ownerMember.role !== CompanyRole.OWNER ||
      !ownerMember.isActive
    ) {
      throw new Error("UNAUTHORIZED");
    }

    console.log("memberId", memberId);

    const memberToRemove =
      await CompanyMember.findById(memberId).session(session);

    console.log("Member to remove: ", memberToRemove);

    if (!memberToRemove) {
      throw new Error("NOT_FOUND");
    }

    // 4. Cross-Company Security Check: Ensure member belongs to the owner's company
    if (memberToRemove.company.toString() !== ownerMember.company.toString()) {
      throw new Error("FORBIDDEN");
    }

    // 5. Atomic Deletion: Remove the member link and the user account
    // We remove the member link first
    await CompanyMember.findByIdAndDelete(memberId, { session });
    // Then remove the actual user document
    await User.findByIdAndDelete(memberToRemove.user, { session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Member and associated account deleted successfully.",
    });
  } catch (error: any) {
    await session.abortTransaction();

    // Handle specific error cases
    if (error.message === "UNAUTHORIZED")
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: Access denied." });
    if (error.message === "NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Member record not found." });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({
        success: false,
        message: "Cannot delete members from other companies.",
      });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
