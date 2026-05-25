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

    const query: Record<string, any> = { status: JobStatus.ACTIVE };

    if (jobType && jobType !== "all") {
        if (!isValidJobType(jobType)) throw new ApiError(400, "Invalid job type");
        query.jobType = jobType;
    }

    if (workMode && workMode !== "all") {
        if (!isValidWorkMode(workMode)) throw new ApiError(400, "Invalid work mode");
        query.workMode = workMode;
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