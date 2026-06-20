import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import Job, { ExperienceLevel } from "../models/Job.model.js";
import Internship, { StipendType, DurationType } from "../models/Internship.model.js";
import Company from "../models/Company.model.js";
import User from "../models/User.model.js";
import { config } from "dotenv";
import { 
    EmploymentType, 
    WorkMode, 
    CompanyType, 
    RoleCategory, 
    Industry, 
    DegreeLevel, 
    OpportunityType, 
    GenderPreference, 
    EnglishFluency, 
    JobStatus 
} from "../models/BaseJob.model.js";

config();

const seedRelatedJobs = async () => {
    try {
        await connectDB();
        console.log("Connected to DB, initializing related jobs...");

        // Get a company and an employer user
        let company = await Company.findOne({});
        let user = await User.findOne({ role: "employer" });

        if (!user) {
            user = await User.findOne({}); // Fallback to any user
        }

        if (!company || !user) {
            console.log("Cannot find a company or user to associate the jobs with. Make sure DB has at least one company and user.");
            process.exit(1);
        }

        console.log(`Using Company: ${company._id} and User: ${user._id}`);

        const commonLocation = { city: "Bangalore", state: "Karnataka", country: "India" };
        const commonEducation = { minimumDegree: DegreeLevel.BACHELORS, preferredFields: ["Computer Science"], isRequired: true };

        const jobsToCreate = [
            {
                title: "Frontend Developer (React)",
                description: "We are looking for a skilled Frontend Developer with React experience.",
                company: company._id,
                postedBy: user._id,
                employmentType: EmploymentType.FULL_TIME,
                workMode: WorkMode.HYBRID,
                companyType: CompanyType.STARTUP,
                roleCategory: RoleCategory.SOFTWARE_DEVELOPMENT,
                industry: Industry.INFORMATION_TECHNOLOGY,
                location: commonLocation,
                education: commonEducation,
                skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS"],
                requirements: ["2+ years of React experience"],
                genderPreference: GenderPreference.ANY,
                englishFluency: EnglishFluency.FLUENT,
                openings: 2,
                status: JobStatus.ACTIVE,
                isFeatured: true,
                opportunityType: OpportunityType.JOB,
                experienceLevel: ExperienceLevel.INTERMEDIATE,
                experienceInYears: 2,
                salary: { min: 800000, max: 1200000, currency: "INR", period: "yearly" }
            },
            {
                title: "Frontend Developer (Vue)",
                description: "Looking for a Vue.js developer to join our frontend team.",
                company: company._id,
                postedBy: user._id,
                employmentType: EmploymentType.FULL_TIME,
                workMode: WorkMode.HYBRID,
                companyType: CompanyType.STARTUP,
                roleCategory: RoleCategory.SOFTWARE_DEVELOPMENT,
                industry: Industry.INFORMATION_TECHNOLOGY,
                location: commonLocation,
                education: commonEducation,
                skills: ["Vue", "JavaScript", "HTML", "CSS"],
                requirements: ["1+ years of Vue experience"],
                genderPreference: GenderPreference.ANY,
                englishFluency: EnglishFluency.FLUENT,
                openings: 1,
                status: JobStatus.ACTIVE,
                isFeatured: false,
                opportunityType: OpportunityType.JOB,
                experienceLevel: ExperienceLevel.ENTRY,
                experienceInYears: 1,
                salary: { min: 600000, max: 900000, currency: "INR", period: "yearly" }
            },
            {
                title: "Senior Frontend Engineer",
                description: "Lead our frontend team and architect complex React applications.",
                company: company._id,
                postedBy: user._id,
                employmentType: EmploymentType.FULL_TIME,
                workMode: WorkMode.REMOTE,
                companyType: CompanyType.STARTUP,
                roleCategory: RoleCategory.SOFTWARE_DEVELOPMENT,
                industry: Industry.INFORMATION_TECHNOLOGY,
                location: commonLocation,
                education: commonEducation,
                skills: ["React", "TypeScript", "System Design", "Next.js"],
                requirements: ["5+ years of frontend experience", "Leadership experience"],
                genderPreference: GenderPreference.ANY,
                englishFluency: EnglishFluency.FLUENT,
                openings: 1,
                status: JobStatus.ACTIVE,
                isFeatured: true,
                opportunityType: OpportunityType.JOB,
                experienceLevel: ExperienceLevel.SENIOR,
                experienceInYears: 5,
                salary: { min: 1800000, max: 2500000, currency: "INR", period: "yearly" }
            }
        ];

        const internshipsToCreate = [
            {
                title: "Frontend Development Intern",
                description: "Learn and build with React during this 3 month internship.",
                company: company._id,
                postedBy: user._id,
                employmentType: EmploymentType.INTERNSHIP,
                workMode: WorkMode.HYBRID,
                companyType: CompanyType.STARTUP,
                roleCategory: RoleCategory.SOFTWARE_DEVELOPMENT,
                industry: Industry.INFORMATION_TECHNOLOGY,
                location: commonLocation,
                education: { minimumDegree: DegreeLevel.ANY, isRequired: false },
                skills: ["JavaScript", "HTML", "CSS", "React"],
                requirements: ["Basic knowledge of web development"],
                genderPreference: GenderPreference.ANY,
                englishFluency: EnglishFluency.INTERMEDIATE,
                openings: 3,
                status: JobStatus.ACTIVE,
                isFeatured: false,
                opportunityType: OpportunityType.INTERNSHIP,
                stipend: { type: StipendType.FIXED, amount: 15000, currency: "INR", period: "monthly" },
                duration: { value: 3, unit: DurationType.MONTHS },
                isPPO: true,
                certificateProvided: true
            },
            {
                title: "React Developer Intern",
                description: "Join our frontend team as a React intern.",
                company: company._id,
                postedBy: user._id,
                employmentType: EmploymentType.INTERNSHIP,
                workMode: WorkMode.REMOTE,
                companyType: CompanyType.STARTUP,
                roleCategory: RoleCategory.SOFTWARE_DEVELOPMENT,
                industry: Industry.INFORMATION_TECHNOLOGY,
                location: commonLocation,
                education: { minimumDegree: DegreeLevel.ANY, isRequired: false },
                skills: ["React", "TypeScript", "Tailwind CSS"],
                requirements: ["Familiarity with React components"],
                genderPreference: GenderPreference.ANY,
                englishFluency: EnglishFluency.INTERMEDIATE,
                openings: 2,
                status: JobStatus.ACTIVE,
                isFeatured: false,
                opportunityType: OpportunityType.INTERNSHIP,
                stipend: { type: StipendType.FIXED, amount: 20000, currency: "INR", period: "monthly" },
                duration: { value: 6, unit: DurationType.MONTHS },
                isPPO: false,
                certificateProvided: true
            }
        ];

        const createdJobs = await Job.insertMany(jobsToCreate);
        console.log(`Successfully created ${createdJobs.length} Jobs.`);

        const createdInternships = await Internship.insertMany(internshipsToCreate);
        console.log(`Successfully created ${createdInternships.length} Internships.`);

        console.log("Seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding related jobs:", error);
        process.exit(1);
    }
};

seedRelatedJobs();
