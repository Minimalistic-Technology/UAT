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
        query.$text = { $search: search };
    }

    if (skills) {
        const skillArray = Array.isArray(skills) ? skills : [skills];
        query.skills = { $in: skillArray };
    }

    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (state) query["location.state"] = { $regex: state, $options: "i" };
    if (country) query["location.country"] = { $regex: country, $options: "i" };

    return query;
};