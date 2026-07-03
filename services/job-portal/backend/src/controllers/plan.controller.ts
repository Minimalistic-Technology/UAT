import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      description,
      price,
      currency,
      durationDays,
      jobPostLimit,
      isDefault,
      displayOrder,
      features,
      isActive,
      allowResumeDownload,
      postValidityDays,
      teamMemberLimit,
    } = req.body;

    const existingPlan = await prisma.plan.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingPlan) {
      return next(new ApiError(400, `A plan named "${name}" already exists.`));
    }

    const plan = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.plan.updateMany({ data: { isDefault: false } });
      }

      return tx.plan.create({
        data: {
          name,
          description,
          price: price !== undefined ? Math.round(Number(price)) : 0,
          currency: currency || "INR",
          subscriptionDurationDays: durationDays || 30,
          maxActiveJobPosts: jobPostLimit || -1,
          isDefault: isDefault !== undefined ? isDefault : false,
          displayOrder: displayOrder !== undefined ? displayOrder : 0,
          features: features || [],
          isActive: isActive !== undefined ? isActive : true,
          allowResumeDownload: allowResumeDownload ?? false,
          jobPostValidityDays: postValidityDays ?? 30,
          maxTeamMembers: teamMemberLimit !== undefined ? teamMemberLimit : 1,
        },
      });
    });

    return res
      .status(201)
      .json(new ApiResponse(201, plan, "Plan created successfully"));
  } catch (error: any) {
    if (error.code === "P2002") {
      return next(new ApiError(400, "A plan with this name already exists."));
    }
    next(new ApiError(500, error.message ?? "Server Error"));
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const {
      isDefault,
      durationDays,
      jobPostLimit,
      postValidityDays,
      teamMemberLimit,
      price,
      allowResumeDownload,
      ...updateData
    } = req.body;

    const formattedUpdateData: any = { ...updateData };
    if (durationDays !== undefined)
      formattedUpdateData.subscriptionDurationDays = durationDays;
    if (jobPostLimit !== undefined)
      formattedUpdateData.maxActiveJobPosts = jobPostLimit;
    if (postValidityDays !== undefined)
      formattedUpdateData.jobPostValidityDays = postValidityDays;
    if (teamMemberLimit !== undefined)
      formattedUpdateData.maxTeamMembers = teamMemberLimit;
    if (price !== undefined)
      formattedUpdateData.price = Math.round(Number(price));
    if (allowResumeDownload !== undefined)
      formattedUpdateData.allowResumeDownload = allowResumeDownload;

    const planToUpdate = await prisma.plan.findUnique({ where: { id } });

    if (!planToUpdate) {
      return next(new ApiError(404, "Plan not found"));
    }

    const plan = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.plan.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false },
        });

        return tx.plan.update({
          where: { id },
          data: { ...formattedUpdateData, isDefault: true },
        });
      } else {
        return tx.plan.update({
          where: { id },
          data: formattedUpdateData,
        });
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, plan, "Plan updated successfully"));
  } catch (error: any) {
    if (error.code === "P2002") {
      return next(new ApiError(400, "A plan with this name already exists."));
    }
    return next(error);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const plan = await prisma.plan.findUnique({ where: { id } });

    if (!plan) {
      return next(new ApiError(404, "Plan not found"));
    }

    if (plan.isDefault) {
      return next(new ApiError(400, "Default plan cannot be deleted"));
    }

    const isPlanInUse = await prisma.subscription.findFirst({
      where: { planId: id },
    });

    if (isPlanInUse) {
      const updatedPlan = await prisma.plan.update({
        where: { id },
        data: { isActive: false },
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedPlan,
            "Plan is in use. Marked as inactive instead of deleting.",
          ),
        );
    }

    await prisma.plan.delete({ where: { id } });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Plan deleted successfully"));
  } catch (error: any) {
    return next(error);
  }
};
