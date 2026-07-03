import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const saveDraft = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, type, formData } = req.body;

    if (!["JOB", "INTERNSHIP"].includes(type?.toUpperCase())) {
      throw new ApiError(400, "Invalid draft type");
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    if (companyMember.role !== "OWNER" && companyMember.role !== "HR") {
      throw new ApiError(403, "You're not authorized to save drafts");
    }

    let draft;
    if (id) {
      draft = await prisma.draft.findUnique({ where: { id } });

      if (!draft || draft.companyId !== companyMember.companyId) {
        throw new ApiError(404, "Draft not found");
      }

      draft = await prisma.draft.update({
        where: { id },
        data: {
          formData,
          type: type.toUpperCase(),
        },
      });
    } else {
      draft = await prisma.draft.create({
        data: {
          companyId: companyMember.companyId,
          postedById: req.user.id,
          type: type.toUpperCase(),
          formData,
        },
      });
    }

    res
      .status(200)
      .json(new ApiResponse(200, draft, "Draft saved successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getDrafts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const drafts = await prisma.draft.findMany({
      where: { companyId: companyMember.companyId },
      orderBy: { updatedAt: "desc" },
    });

    res
      .status(200)
      .json(new ApiResponse(200, drafts, "Drafts fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getDraft = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const draft = await prisma.draft.findUnique({
      where: { id: req.params.id as string },
    });

    if (!draft || draft.companyId !== companyMember.companyId) {
      throw new ApiError(404, "Draft not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, draft, "Draft fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteDraft = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const draft = await prisma.draft.findUnique({
      where: { id: req.params.id as string },
    });

    if (!draft || draft.companyId !== companyMember.companyId) {
      throw new ApiError(404, "Draft not found");
    }

    await prisma.draft.delete({ where: { id: req.params.id as string } });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Draft deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};
