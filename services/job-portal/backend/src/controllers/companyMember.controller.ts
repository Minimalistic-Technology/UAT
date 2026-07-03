import type { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcryptjs";

export const getAllCompanyMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (!currentUser) {
      throw new ApiError(404, "Member record not found.");
    }

    if (currentUser.role !== "OWNER") {
      throw new ApiError(403, "Access denied: Owners only.");
    }

    if (!currentUser.isActive) {
      throw new ApiError(400, "Account deactivated.");
    }

    const members = await prisma.companyMember.findMany({
      where: {
        companyId: currentUser.companyId,
        id: { not: currentUser.id },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

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
  try {
    const ownerMember = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (
      !ownerMember ||
      ownerMember.role !== "OWNER" ||
      !ownerMember.isActive
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized or invalid access." });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId: ownerMember.companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() },
      },
      include: { plan: true },
    });

    if (!activeSubscription) {
      return res.status(403).json({
        success: false,
        message: "You must have an active subscription to add team members.",
      });
    }

    const plan = activeSubscription.plan;

    if (plan.maxTeamMembers !== -1) {
      const currentMemberCount = await prisma.companyMember.count({
        where: {
          companyId: ownerMember.companyId,
          role: { not: "OWNER" },
        },
      });

      if (currentMemberCount >= plan.maxTeamMembers) {
        return res.status(403).json({
          success: false,
          message: `Team member limit reached. Your current plan allows up to ${plan.maxTeamMembers} additional members.`,
        });
      }
    }

    const { firstName, lastName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      await tx.companyMember.create({
        data: {
          userId: newUser.id,
          companyId: ownerMember.companyId,
          role: "HR",
          isActive: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Employee added successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const memberId = Array.isArray(req.params.memberId)
    ? req.params.memberId[0]
    : req.params.memberId;

  const { firstName, lastName, isActive } = req.body;

  if (!memberId) {
    return next(new ApiError(400, "Invalid member ID."));
  }

  try {
    const ownerMember = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (
      !ownerMember ||
      ownerMember.role !== "OWNER" ||
      !ownerMember.isActive
    ) {
      throw new ApiError(403, "Unauthorized: Access denied.");
    }

    const memberToUpdate = await prisma.companyMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToUpdate) {
      throw new ApiError(404, "Member record not found.");
    }

    if (memberToUpdate.companyId !== ownerMember.companyId) {
      throw new ApiError(403, "Cannot update members from other companies.");
    }

    await prisma.$transaction(async (tx) => {
      if (isActive !== undefined) {
        await tx.companyMember.update({
          where: { id: memberId },
          data: { isActive },
        });

        if (isActive === false) {
          await tx.user.update({
            where: { id: memberToUpdate.userId },
            data: { isActive: false },
          });
        }
      }

      if (firstName || lastName) {
        const updateData: any = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;

        await tx.user.update({
          where: { id: memberToUpdate.userId },
          data: updateData,
        });
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Member updated successfully."));
  } catch (error: any) {
    next(error);
  }
};

export const getCompanyMemberById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const memberId = Array.isArray(req.params.memberId)
      ? req.params.memberId[0]
      : req.params.memberId;

    if (!memberId) {
      throw new ApiError(400, "Invalid member ID.");
    }

    const currentUser = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (!currentUser || !currentUser.isActive) {
      throw new ApiError(403, "Unauthorized or inactive account.");
    }

    if (currentUser.role !== "OWNER") {
      throw new ApiError(403, "Access denied: Owners only.");
    }

    const member = await prisma.companyMember.findFirst({
      where: {
        id: memberId,
        companyId: currentUser.companyId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      throw new ApiError(404, "Member not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { member }, "Member fetched successfully"));
  } catch (error) {
    next(error);
  }
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

  try {
    const ownerMember = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (
      !ownerMember ||
      ownerMember.role !== "OWNER" ||
      !ownerMember.isActive
    ) {
      throw new ApiError(403, "Unauthorized: Access denied.");
    }

    const memberToRemove = await prisma.companyMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove) {
      throw new ApiError(404, "Member record not found.");
    }

    if (memberToRemove.companyId !== ownerMember.companyId) {
      throw new ApiError(403, "Cannot delete members from other companies.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.companyMember.delete({ where: { id: memberId } });
      await tx.user.delete({ where: { id: memberToRemove.userId } });
    });

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
    next(error);
  }
};
