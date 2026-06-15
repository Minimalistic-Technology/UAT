import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import Draft from "../models/Draft.model.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const saveDraft = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, type, formData } = req.body;
    
    if (!["job", "internship"].includes(type)) {
      throw new ApiError(400, "Invalid draft type");
    }

    const companyMember = await CompanyMember.findOne({ user: req.user._id });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    if (companyMember.role !== CompanyRole.OWNER && companyMember.role !== CompanyRole.HR) {
      throw new ApiError(403, "You're not authorized to save drafts");
    }

    let draft;
    if (id) {
      draft = await Draft.findOne({ _id: id, company: companyMember.company });
      if (!draft) {
        throw new ApiError(404, "Draft not found");
      }
      draft.formData = formData;
      draft.type = type;
      draft.markModified('formData');
      await draft.save();
    } else {
      draft = await Draft.create({
        company: companyMember.company,
        postedBy: req.user._id,
        type,
        formData,
      });
    }

    res.status(200).json(new ApiResponse(200, draft, "Draft saved successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getDrafts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyMember = await CompanyMember.findOne({ user: req.user._id });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const drafts = await Draft.find({ company: companyMember.company }).sort({ updatedAt: -1 });

    res.status(200).json(new ApiResponse(200, drafts, "Drafts fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getDraft = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyMember = await CompanyMember.findOne({ user: req.user._id });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const draft = await Draft.findOne({ _id: req.params.id, company: companyMember.company });
    if (!draft) {
      throw new ApiError(404, "Draft not found");
    }

    res.status(200).json(new ApiResponse(200, draft, "Draft fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteDraft = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyMember = await CompanyMember.findOne({ user: req.user._id });
    if (!companyMember) {
      throw new ApiError(403, "You are not a member of any company");
    }

    const draft = await Draft.findOneAndDelete({ _id: req.params.id, company: companyMember.company });
    if (!draft) {
      throw new ApiError(404, "Draft not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Draft deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};
