import Application, { ApplicationStatus, ListingType, } from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import Internship from "../models/Internship.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import { sendEmail } from '../utils/email.js';
import { ApiError } from "../utils/apiError.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import { JobStatus } from "../models/BaseJob.model.js";
import Subscription from "../models/Subscription.model.js";
export const createApplication = async (req, res, next) => {
    try {
        const { listingId, listingType } = req.body;
        if (!req.user.resume) {
            throw new ApiError(400, "Resume is required to apply for this job. Please upload your resume in your profile.");
        }
        const listing = listingType === ListingType.JOB
            ? await Job.findById(listingId)
            : await Internship.findById(listingId);
        if (!listing) {
            throw new ApiError(404, `${listingType} not found`);
        }
        if (listing.status === JobStatus.CLOSED) {
            throw new ApiError(400, `This ${listingType} is no longer accepting applications`);
        }
        const existingApplication = await Application.findOne({
            listing: listingId,
            listingType,
            jobSeeker: req.user._id,
            status: { $ne: ApplicationStatus.WITHDRAWN },
        });
        if (existingApplication) {
            throw new ApiError(400, `You have already applied for this ${listingType}`);
        }
        const application = await Application.create({
            listing: listingId,
            listingType,
            jobSeeker: req.user._id,
            resume: req.user.resume.url,
        });
        // Increment applications count
        listing.applicationsCount += 1;
        await listing.save();
        // Send confirmation email
        // await sendEmail({
        //   email: req.user.email,
        //   subject: 'Application Submitted Successfully',
        //   message: `Your application for ${job.title} has been submitted successfully.`,
        // });
        res
            .status(201)
            .json(new ApiResponse(201, application, "Application submitted successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const getMyApplications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [applications, totalApplications] = await Promise.all([
            Application.find({ jobSeeker: req.user._id })
                .populate({
                path: "listing",
                select: "location jobType title company",
                populate: {
                    path: "company",
                    select: "name",
                },
            })
                .sort("-createdAt")
                .skip(skip)
                .limit(limit),
            Application.countDocuments({ jobSeeker: req.user._id }),
        ]);
        const totalPages = Math.ceil(totalApplications / limit);
        return res.status(200).json(new ApiResponse(200, {
            applications,
            pagination: {
                totalItems: totalApplications,
                totalPages,
                currentPage: page,
                limit,
            },
        }, "Applications fetched successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const getMyApplicationStats = async (req, res, next) => {
    try {
        const stats = await Application.aggregate([
            { $match: { jobSeeker: req.user._id } },
            {
                $group: {
                    _id: { status: "$status", listingType: "$listingType" },
                    count: { $sum: 1 },
                },
            },
        ]);
        const formattedStats = {
            total: 0,
            byStatus: Object.values(ApplicationStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {}),
            byListingType: {
                [ListingType.JOB]: 0,
                [ListingType.INTERNSHIP]: 0,
            },
        };
        stats.forEach(({ _id, count }) => {
            formattedStats.total += count;
            formattedStats.byStatus[_id.status] += count;
            formattedStats.byListingType[_id.listingType] += count;
        });
        return res
            .status(200)
            .json(new ApiResponse(200, formattedStats, "Application stats fetched successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const getAllCompanyApplications = async (req, res, next) => {
    try {
        const companyMember = await CompanyMember.findOne({ user: req.user._id });
        if (!companyMember) {
            return next(new ApiError(400, "Company member not found"));
        }
        const companyId = companyMember.company;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, listingType } = req.query;
        // Find all jobs belonging to the company
        const [jobs, internships] = await Promise.all([
            Job.find({ company: companyId }).select("_id"),
            Internship.find({ company: companyId }).select("_id"),
        ]);
        const listingIds = [
            ...jobs.map((j) => j._id),
            ...internships.map((i) => i._id),
        ];
        const query = { listing: { $in: listingIds } };
        if (status) {
            query.status = status;
        }
        if (listingType &&
            Object.values(ListingType).includes(listingType)) {
            query.listingType = listingType;
        }
        const activeSubscription = await Subscription.findOne({
            companyId: companyId,
            status: "active",
            expiryDate: { $gt: new Date() },
        }).populate("planId");
        const plan = activeSubscription?.planId;
        const canViewResume = plan?.allowResumeDownload === true;
        const [applicationsDocs, totalApplications] = await Promise.all([
            Application.find(query)
                .populate({
                path: "listing",
                select: "title location jobType company",
                populate: {
                    path: "company",
                    select: "name",
                },
            })
                .populate("jobSeeker", "firstName lastName email phone resume skills experience education portfolio urls")
                .sort("-createdAt")
                .skip(skip)
                .limit(limit),
            Application.countDocuments(query),
        ]);
        const applications = applicationsDocs.map((app) => {
            const appObj = app.toObject();
            if (!canViewResume) {
                delete appObj.resume;
                if (appObj.jobSeeker) {
                    delete appObj.jobSeeker.resume;
                }
            }
            return appObj;
        });
        const totalPages = Math.ceil(totalApplications / limit);
        return res.status(200).json(new ApiResponse(200, {
            applications,
            pagination: {
                totalItems: totalApplications,
                totalPages,
                currentPage: page,
                limit,
            },
        }, "Company applications fetched successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const getJobApplicants = async (req, res, next) => {
    try {
        const { listingType, listingId } = req.body;
        const listing = listingType === ListingType.JOB
            ? await Job.findById(listingId)
            : await Internship.findById(listingId);
        if (!listing) {
            throw new ApiError(404, `${listingType} not found`);
        }
        const companyMember = await CompanyMember.findOne({
            company: listing.company,
            user: req.user._id,
        });
        if (!companyMember) {
            throw new ApiError(403, "Not authorized to view applicants");
        }
        if (companyMember.role != CompanyRole.OWNER &&
            companyMember.role != CompanyRole.HR) {
            throw new ApiError(403, "Not authorized to view applicants");
        }
        const activeSubscription = await Subscription.findOne({
            companyId: listing.company,
            status: "active",
            expiryDate: { $gt: new Date() },
        }).populate("planId");
        const plan = activeSubscription?.planId;
        const canViewResume = plan?.allowResumeDownload === true;
        const applicationsDocs = await Application.find({
            listing: listingId,
            listingType,
        })
            .populate("jobSeeker", "firstName lastName email phone skills experience education")
            .sort("-createdAt");
        const applications = applicationsDocs.map((app) => {
            const appObj = app.toObject();
            if (!canViewResume) {
                //@ts-ignore
                delete appObj.resume;
            }
            return appObj;
        });
        res
            .status(200)
            .json(new ApiResponse(200, { count: applications.length, applications }, "Applications fetched successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const getApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id)
            .populate({
            path: "listing",
            select: "title location jobType company postedBy status",
            populate: {
                path: "company",
                select: "name logo industry",
            },
        })
            .populate({
            path: "jobSeeker",
            select: "firstName lastName email phone skills experience education resume",
        });
        if (!application) {
            throw new ApiError(404, "Application not found");
        }
        const listing = application.listing;
        const jobSeeker = application.jobSeeker;
        // Authorization checks
        const isJobSeeker = jobSeeker._id.toString() === req.user._id.toString();
        const isEmployer = listing.postedBy.toString() === req.user._id.toString();
        let isCompanyMember = false;
        if (!isJobSeeker && !isEmployer) {
            const companyMember = await CompanyMember.findOne({
                user: req.user._id,
                company: listing.company,
            });
            if (companyMember)
                isCompanyMember = true;
        }
        if (!isJobSeeker && !isEmployer && !isCompanyMember) {
            throw new ApiError(403, "Not authorized to view this application");
        }
        const appObj = application.toObject();
        if (!isJobSeeker && (isEmployer || isCompanyMember)) {
            const activeSubscription = await Subscription.findOne({
                companyId: listing.company,
                status: "active",
                expiryDate: { $gt: new Date() },
            }).populate("planId");
            const plan = activeSubscription?.planId;
            const canViewResume = plan?.allowResumeDownload === true;
            if (!canViewResume) {
                delete appObj.resume;
                if (appObj.jobSeeker) {
                    delete appObj.jobSeeker.resume;
                }
            }
        }
        res
            .status(200)
            .json(new ApiResponse(200, appObj, "Application fetched successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note, interviewDate } = req.body;
        const application = await Application.findById(id)
            .populate("listing")
            .populate("jobSeeker", "email firstName lastName");
        if (!application) {
            throw new ApiError(404, "Application not found");
        }
        // Verify job belongs to employer or user is HR/OWNER of the company
        const listing = application.listing;
        const companyMember = await CompanyMember.findOne({
            user: req.user._id,
            company: listing.company,
        });
        const isEmployer = listing.postedBy.toString() === req.user.id;
        const isAuthorizedMember = companyMember &&
            (companyMember.role === CompanyRole.HR ||
                companyMember.role === CompanyRole.OWNER);
        if (!isEmployer && !isAuthorizedMember) {
            throw new ApiError(403, "Not authorized to update this application");
        }
        // Update status
        application.status = status;
        if (interviewDate) {
            application.interviewDate = new Date(interviewDate);
        }
        application.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user.id,
            note,
        });
        await application.save();
        // Check if the status was changed to accepted
        if (status === ApplicationStatus.ACCEPTED) {
            // Find all accepted applications for this listing
            const acceptedCount = await Application.countDocuments({
                listing: listing._id,
                listingType: application.listingType,
                status: ApplicationStatus.ACCEPTED,
            });
            const targetListing = application.listingType === ListingType.JOB
                ? await Job.findById(listing._id)
                : await Internship.findById(listing._id);
            if (targetListing && acceptedCount >= targetListing.openings) {
                targetListing.status = JobStatus.CLOSED;
                await targetListing.save();
            }
        }
        // Send notification email to job seeker
        // const jobSeeker: any = application.jobSeeker;
        // await sendEmail({
        //   email: jobSeeker.email,
        //   subject: `Application Status Update - ${job.title}`,
        //   message: `Your application status has been updated to: ${status}${
        //     note ? `\n\nNote: ${note}` : ''
        //   }`,
        // });
        res
            .status(200)
            .json(new ApiResponse(200, application, "Application status updated successfully"));
    }
    catch (error) {
        next(error);
    }
};
export const withdrawApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);
        if (!application) {
            throw new ApiError(404, "Application not found");
        }
        // Verify application belongs to user
        if (application.jobSeeker.toString() !== req.user.id) {
            throw new ApiError(403, "Not authorized to withdraw this application");
        }
        if (application.status === ApplicationStatus.WITHDRAWN) {
            throw new ApiError(400, "Application is already withdrawn");
        }
        const listing = application.listingType === ListingType.JOB
            ? await Job.findById(application.listing)
            : await Internship.findById(application.listing);
        if (listing && listing.applicationsCount > 0) {
            listing.applicationsCount -= 1;
            await listing.save();
        }
        application.status = ApplicationStatus.WITHDRAWN;
        await application.save();
        res
            .status(200)
            .json(new ApiResponse(200, null, "Application withdrawn successfully"));
    }
    catch (error) {
        next(error);
    }
};
