import type { NextFunction, Response } from "express";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import User, { GlobalRole } from "../models/User.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getAllCompanyMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = await CompanyMember.findOne({ user: req.user._id });

    if (!currentUser) {
      throw new ApiError(404, "Member record not found.");
    }

    if (currentUser.role !== CompanyRole.OWNER) {
      throw new ApiError(403, "Access denied: Owners only.");
    }

    if (!currentUser.isActive) {
      throw new ApiError(400, "Account deactivated.");
    }

    const members = await CompanyMember.find({
      company: currentUser.company,
      _id: { $ne: currentUser._id },
    })
      .populate("user", "firstName lastName email avatar")
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: members.length, members },
          "Members fetched successfully",
        ),
      );
  } catch (error: any) {
    next(error);
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
          role: CompanyRole.HR,
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

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let { memberId } = req.params;

  if (!memberId) {
    throw new ApiError(400, "Member ID is required.");
  }

  if (Array.isArray(memberId)) {
    memberId = memberId[0];
  }

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, "Invalid member ID format.");
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
      throw new ApiError(403, "Unauthorized: Access denied.");
    }

    console.log("memberId", memberId);

    const memberToRemove =
      await CompanyMember.findById(memberId).session(session);

    console.log("Member to remove: ", memberToRemove);

    if (!memberToRemove) {
      throw new ApiError(404, "Member record not found.");
    }

    // 4. Cross-Company Security Check: Ensure member belongs to the owner's company
    if (memberToRemove.company.toString() !== ownerMember.company.toString()) {
      throw new ApiError(403, "Cannot delete members from other companies.");
    }

    // 5. Atomic Deletion: Remove the member link and the user account
    // We remove the member link first
    await CompanyMember.findByIdAndDelete(memberId, { session });
    // Then remove the actual user document
    await User.findByIdAndDelete(memberToRemove.user, { session });

    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Member and associated account deleted successfully.",
        ),
      );
  } catch (error: any) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
