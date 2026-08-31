import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";

export const getAllInternships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = buildBaseJobQuery(req.query as Record<string, any>, false);
    query.opportunityType = "INTERNSHIP";

    const { experienceLevel, minStipend, maxStipend, stipendType } = req.query;

    if (experienceLevel) {
      query.experienceLevel = experienceLevel.toString().toUpperCase();
    }

    if (minStipend || maxStipend || stipendType) {
      query.internshipDetails = { is: {} };

      if (minStipend || maxStipend) {
        query.internshipDetails.is.stipendAmount = {};
        if (minStipend) query.internshipDetails.is.stipendAmount.gte = Number(minStipend);
        if (maxStipend) query.internshipDetails.is.stipendAmount.lte = Number(maxStipend);
      }

      if (stipendType) {
        query.internshipDetails.is.stipendType = stipendType.toString().toUpperCase();
      }
    }

    const pageNumber = Number(req.query.page) || 1;
    const limitNumber = Number(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [internships, total] = await Promise.all([
      prisma.baseListing.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        include: {
          postedBy: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true, logo: true, locations: { select: { city: true, state: true, country: true } }, industry: true } },
          internshipDetails: true,
        },
        skip,
        take: limitNumber,
      }),
      prisma.baseListing.count({ where: query }),
    ]);

    let formattedInternships = [...internships];

    if (req.user && req.user.role === "USER" && !req.user.isEmployer) {
      const internshipIds = internships.map((internship) => internship.id);

      const applications = await prisma.application.findMany({
        where: {
          jobSeekerId: req.user.id,
          listingId: { in: internshipIds },
        },
      });

      const appliedInternshipIds = new Set(
        applications.map((app) => app.listingId),
      );

      formattedInternships = internships.map((internship) => ({
        ...internship,
        hasApplied: appliedInternshipIds.has(internship.id),
      }));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          internships: formattedInternships,
          totalInternships: total,
          pagination: {
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
        "Internships fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const getMyInternships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember) {
      return next(new ApiError(400, "Company member not found"));
    }

    if (
      companyMember.role === "HR" ||
      companyMember.role === "OWNER"
    ) {
      const internships = await prisma.baseListing.findMany({
        where: { 
          companyId: companyMember.companyId, 
          isDeleted: false,
          opportunityType: "INTERNSHIP" 
        },
        include: {
          company: { select: { id: true, name: true, logo: true } },
          postedBy: { select: { id: true, firstName: true, lastName: true } },
          internshipDetails: true
        }
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            count: internships.length,
            internshipPosts: internships,
          },
          "Internships fetched successfully",
        ),
      );
    } else {
      return next(new ApiError(403, "Not authorized to fetch internships"));
    }
  } catch (error: any) {
    next(error);
  }
};

export const getInternshipById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const internship = await prisma.baseListing.findUnique({
      where: { id },
      include: {
        postedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        company: { select: { id: true, name: true, logo: true, description: true, website: true, locations: true, industry: true, companySize: true } },
        internshipDetails: true,
      }
    });

    if (!internship || internship.opportunityType !== "INTERNSHIP") {
      return next(new ApiError(404, "Internship not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, internship, "Internship fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const createInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyMember) {
      throw new ApiError(400, "Company member doesn't exist.");
    }

    const company = companyMember.company;

    if (!company.isVerified) {
      throw new ApiError(
        403,
        "Your company must be verified before you can post internships.",
      );
    }

    if (
      companyMember.role !== "OWNER" &&
      companyMember.role !== "HR"
    ) {
      throw new ApiError(403, "You're not authorized to create an internship");
    }

const internship = await prisma.$transaction(async (tx) => {
  const subscription = await tx.subscription.findFirst({
    where: {
      companyId: company.id,
      status: "ACTIVE",
      expiryDate: { gt: new Date() },
      OR: [{ postsRemaining: { gt: 0 } }, { postsRemaining: -1 }],
    },
  });

  if (!subscription) {
    throw new ApiError(
      402,
      "You must have an active subscription with remaining job posts. Please upgrade your plan.",
    );
  }

  // Unlimited plans: skip the decrement entirely
  if (subscription.postsRemaining !== -1) {
    const result = await tx.subscription.updateMany({
      where: {
        id: subscription.id,
        postsRemaining: { gt: 0 }, // re-checked at write time, not read time
      },
      data: {
        postsRemaining: { decrement: 1 },
      },
    });

    if (result.count === 0) {
      throw new ApiError(
        402,
        "You must have an active subscription with remaining job posts. Please upgrade your plan.",
      );
    }

    await tx.subscription.updateMany({
      where: { id: subscription.id, postsRemaining: 0, status: "ACTIVE" },
      data: { status: "DEPLETED" },
    });
  }

  const newListing = await tx.baseListing.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      employmentType: req.body.employmentType,
      workMode: req.body.workMode,
      companyType: req.body.companyType,
      roleCategory: req.body.roleCategory,
      industry: req.body.industry,
      experienceLevel: req.body.experienceLevel,
      openings: req.body.openings,
      city: req.body.location?.city,
      state: req.body.location?.state,
      country: req.body.location?.country,
      minimumDegree: req.body.education?.minimumDegree || "ANY",
      preferredFields: req.body.education?.preferredFields || [],
      isDegreeRequired: req.body.education?.isRequired ?? false,
      skills: req.body.skills || [],
      requirements: req.body.requirements || [],
      benefits: req.body.benefits || [],
      genderPreference: req.body.genderPreference || "ANY",
      englishFluency: req.body.englishFluency || "NONE",
      applicationDeadline: req.body.applicationDeadline,
      status: req.body.status ?? "ACTIVE",
      opportunityType: "INTERNSHIP",
      postedById: userId,
      companyId: company.id,
      internshipDetails: {
        create: {
          durationValue: req.body.duration || 1,
          durationUnit: "MONTHS",
          stipendAmount: req.body.stipend?.amount,
          stipendType: req.body.stipend?.type || "FIXED",
          stipendCurrency: req.body.stipend?.currency || "USD",
          stipendPeriod: req.body.stipend?.period || "MONTHLY",
          isPPO: req.body.isPPO ?? false,
          certificateProvided: req.body.certificateProvided ?? true,
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        },
      },
    },
    include: { internshipDetails: true },
  });

  return newListing;
});

    res.status(201).json(new ApiResponse(201, internship, "Internship created successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const updateInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let internship = await prisma.baseListing.findUnique({
      where: { id: req.params.id as string },
      include: { internshipDetails: true },
    });

    if (!internship || internship.opportunityType !== "INTERNSHIP") {
      return next(new ApiError(404, "Internship not found"));
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember || companyMember.companyId !== internship.companyId) {
      return next(
        new ApiError(
          403,
          `${req.user.firstName} ${req.user.lastName} is not a member of the company`,
        ),
      );
    }

    if (
      companyMember.role !== "HR" &&
      companyMember.role !== "OWNER"
    ) {
      return next(new ApiError(403, "Not authorized to update this internship"));
    }

    const {
      stipend,
      duration,
      isPPO,
      startDate,
      certificateProvided,
      education,
      location,
      ...baseUpdates
    } = req.body;

    // Filter out Prisma-incompatible fields and keep only scalar values
    const allowedBaseUpdates = [
      "title", "description", "employmentType", "workMode", "companyType", 
      "roleCategory", "industry", "experienceLevel", "openings", "skills", 
      "requirements", "benefits", "genderPreference", "englishFluency", 
      "applicationDeadline", "status", "isDeleted"
    ];
    
    const filteredBaseUpdates: any = {};
    for (const key of allowedBaseUpdates) {
      if (baseUpdates[key] !== undefined) {
        filteredBaseUpdates[key] = baseUpdates[key];
      }
    }

const updatedInternship = await prisma.$transaction(async (tx) => {
  const currentInternship = await tx.baseListing.findUnique({
    where: { id: internship.id },
    select: { id: true, opportunityType: true },
  });

  if (!currentInternship || currentInternship.opportunityType !== "INTERNSHIP") {
    throw new ApiError(404, "Internship not found");
  }

  await tx.baseListing.update({
    where: { id: currentInternship.id },
    data: {
      ...filteredBaseUpdates,
      ...(location && {
        city: location.city,
        state: location.state,
        country: location.country,
      }),
      ...(education && {
        minimumDegree: education.minimumDegree,
        preferredFields: education.preferredFields,
        isDegreeRequired: education.isRequired,
      }),
    },
  });

  if (stipend || duration !== undefined || isPPO !== undefined || startDate !== undefined || certificateProvided !== undefined) {
    await tx.internship.update({
      where: { listingId: currentInternship.id },
      data: {
        ...(duration !== undefined && { durationValue: duration, durationUnit: "MONTHS" }),
        ...(stipend?.amount !== undefined && { stipendAmount: stipend.amount }),
        ...(stipend?.type && { stipendType: stipend.type }),
        ...(stipend?.currency && { stipendCurrency: stipend.currency }),
        ...(stipend?.period && { stipendPeriod: stipend.period }),
        ...(isPPO !== undefined && { isPPO }),
        ...(certificateProvided !== undefined && { certificateProvided }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      },
    });
  }

  return tx.baseListing.findUnique({
    where: { id: currentInternship.id },
    include: { internshipDetails: true },
  });
});

    res.status(200).json(new ApiResponse(200, updatedInternship, "Internship updated successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const internship = await prisma.baseListing.findUnique({
      where: { id: req.params.id as string },
    });

    if (!internship || internship.opportunityType !== "INTERNSHIP") {
      return next(new ApiError(404, "Internship not found"));
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember || companyMember.companyId !== internship.companyId) {
       return next(new ApiError(403, "You're not authorized to delete the internship"));
    }

    if (
      companyMember.role !== "HR" &&
      companyMember.role !== "OWNER"
    ) {
      return next(new ApiError(403, "You're not authorized to delete the internship"));
    }

    await prisma.baseListing.update({
      where: { id: internship.id },
      data: {
         isDeleted: true,
         status: "CLOSED"
      }
    });

    res.status(200).json(new ApiResponse(200, {}, "Internship deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getRelatedInternships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const internshipId = req.params.id as string;
    const targetInternship = await prisma.baseListing.findUnique({
      where: { id: internshipId }
    });
    
    if (!targetInternship || targetInternship.opportunityType !== "INTERNSHIP") {
      return next(new ApiError(404, "Internship not found"));
    }

    const baseQuery: any = {
      id: { not: targetInternship.id },
      status: "ACTIVE",
      isDeleted: false,
      opportunityType: "INTERNSHIP",
    };

    const orConditions: any[] = [];
    if (targetInternship.roleCategory) {
      orConditions.push({ roleCategory: targetInternship.roleCategory });
    }
    if (targetInternship.city) {
      orConditions.push({ city: targetInternship.city });
    }
    if (targetInternship.skills && targetInternship.skills.length > 0) {
      orConditions.push({ skills: { hasSome: targetInternship.skills } });
    }

    if (orConditions.length > 0) {
      baseQuery.OR = orConditions;
    }

    const candidateInternships = await prisma.baseListing.findMany({
      where: baseQuery,
      include: {
         company: { select: { id: true, name: true, logo: true, locations: { select: { city: true } } } },
         internshipDetails: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const formattedInternships = candidateInternships.map((internship) => ({
      _id: internship.id,
      ...internship,
      listingType: "internship",
    }));

    return res.status(200).json(new ApiResponse(200, formattedInternships, "Related internships fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};