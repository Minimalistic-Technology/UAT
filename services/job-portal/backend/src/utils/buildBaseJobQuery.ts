import { ApiError } from "./apiError.js";
import {
    JobStatus,
} from "../models/BaseJob.model.js";
import { isValidJobType, isValidWorkMode } from "../controllers/job.controller.js";

export const buildBaseJobQuery = (
    queryParams: Record<string, any>
): Record<string, any> => {
    const { search, jobType, skills, city, state, country, workMode } =
        queryParams;

    const query: Record<string, any> = { status: JobStatus.ACTIVE, isDeleted: { $ne: true } };

    if (jobType && jobType !== "all") {
        const jobTypeArray = Array.isArray(jobType) ? jobType : jobType.split(",");
        const validJobTypes = jobTypeArray.filter(isValidJobType);
        if (validJobTypes.length > 0) {
            query.jobType = { $in: validJobTypes };
        }
    }

    if (workMode && workMode !== "all") {
        const workModeArray = Array.isArray(workMode) ? workMode : workMode.split(",");
        const validWorkModes = workModeArray.filter(isValidWorkMode);
        if (validWorkModes.length > 0) {
            query.workMode = { $in: validWorkModes };
        }
    } else if (queryParams.remote === "true" || queryParams.remote === true) {
        query.workMode = { $in: ["remote", "temporary work from home"] };
    }

    const { roleCategory, companyType } = queryParams;

    if (roleCategory) {
        const roleCategoryArray = Array.isArray(roleCategory) ? roleCategory : roleCategory.split(",");
        if (roleCategoryArray.length > 0) {
            query.roleCategory = { $in: roleCategoryArray };
        }
    }

    if (companyType) {
        const companyTypeArray = Array.isArray(companyType) ? companyType : companyType.split(",");
        if (companyTypeArray.length > 0) {
            query.companyType = { $in: companyTypeArray };
        }
    }

    if (search && typeof search === "string") {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { skills: { $regex: search, $options: "i" } }
        ];
    }

    if (skills) {
        const skillArray = Array.isArray(skills) ? skills : [skills];
        query.skills = { $in: skillArray };
    }

    if (queryParams.experienceRanges) {
        const experienceRangesArray = Array.isArray(queryParams.experienceRanges)
            ? queryParams.experienceRanges
            : queryParams.experienceRanges.split(",");

        const validRanges = experienceRangesArray.filter((r: string) => r && r.trim() !== "");

        if (validRanges.length > 0) {
            const expConditions = validRanges.map((range: string) => {
                const parts = range.split("-");
                const min = parseInt(parts[0]) || 0;
                const max = parseInt(parts[1]) || 20;
                return { experienceInYears: { $gte: min, $lte: max } };
            });
            // If query.$or already exists from search, we must merge them with $and
            if (query.$or) {
                const existingOr = query.$or;
                delete query.$or;
                query.$and = [{ $or: existingOr }, { $or: expConditions }];
            } else if (query.$and) {
                query.$and.push({ $or: expConditions });
            } else {
                query.$or = expConditions;
            }
        }
    }

    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (state) query["location.state"] = { $regex: state, $options: "i" };
    if (country) query["location.country"] = { $regex: country, $options: "i" };

    return query;
};