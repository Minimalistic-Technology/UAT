import request from "supertest";
import { app } from "../../src/index.js";
import User, { GlobalRole } from "../../src/models/User.model.js";
import Company from "../../src/models/Company.model.js";
import CompanyMember from "../../src/models/CompanyMember.model.js";
import Subscription from "../../src/models/Subscription.model.js";
import { generateToken } from "../../src/utils/jwt.js";

process.env.NODE_ENV = "test";

describe("Employer Panel - Job Posting API Tests", () => {
    let employerToken: string;
    let jobSeekerToken: string;
    let companyId: string;
    let createdJobId: string;

    beforeAll(async () => {
        // 1. Create an Employer User first (so they can be the owner)
        const employer = await User.create({
            firstName: "Jeff",
            lastName: "Employer",
            email: "employer@amazon.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });

        // 2. Create the dummy Company with owner provided
        const company = await Company.create({
            name: "Meta Platforms",
            industry: "Technology",
            companySize: "1000+",
            location: { city: "Seattle", country: "USA" },
            owner: employer._id,
            isVerified: true
        });
        companyId = (company._id as unknown as string);

        // 3. Link them via CompanyMember
        await CompanyMember.create({
            user: employer._id,
            company: company._id,
            role: "owner"
        });
        employerToken = generateToken((employer._id as any).toString());

        // 4. Create Active Subscription for Employer
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await Subscription.create({
            employerId: employer._id,
            companyId: company._id, // Added missing required field
            planId: employer._id, // dummy ObjectId for planId to satisfy schema
            status: "active",
            startDate: new Date(),
            expiryDate: oneYearFromNow,
            postsRemaining: -1, // Unlimited posts for tests
            totalPostsGranted: 999 // Added missing required field
        });

        // 5. Create a normal Job Seeker User
        const jobSeeker = await User.create({
            firstName: "Mark",
            lastName: "Seeker",
            email: "seeker@amazon.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });
        jobSeekerToken = generateToken((jobSeeker._id as any).toString());
    });

    describe("Security & Authorization", () => {
        it("should reject unauthenticated users attempting to access job post route", async () => {
            const res = await request(app).post("/api/jobs").send({ title: "Hacker" });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should reject Job Seekers (non-employers) from posting jobs", async () => {
            const res = await request(app)
                .post("/api/jobs")
                .set("Authorization", `Bearer ${jobSeekerToken}`)
                .send({ title: "Hacker" });

            // Expected to fail RBAC middleware
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe("Job Posting Operations (CRUD)", () => {

        // Fully valid payload mapped precisely 1-to-1 to job.validation.ts and Enums
        const validJobPayload = {
            title: "Senior Full Stack Dev",
            description: "We are looking for a Node.js and React expert.",
            employmentType: "full_time",
            workMode: "remote",
            companyType: "mnc",
            roleCategory: "software_development",
            industry: "software",
            experienceLevel: "senior",
            experienceInYears: 5,
            openings: 3,
            location: { city: "Remote", state: "Remote", country: "Remote" },
            education: { minimumDegree: "bachelors" },
            salary: { min: 80000, max: 120000, currency: "USD", period: "yearly" },
            skills: ["React.js", "Node.js", "Jest"],
            requirements: ["5+ years of scaling architectures", "Team leadership"],
            opportunityType: "job"
        };

        it("should CREATE a new job successfully directly into the database", async () => {
            const res = await request(app)
                .post("/api/jobs")
                .set("Authorization", `Bearer ${employerToken}`)
                .send(validJobPayload);

            if (res.status === 400) console.log("Validation Error:", res.body);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(validJobPayload.title);
            expect(res.body.data.company.toString()).toBe(companyId.toString());

            createdJobId = res.body.data._id; // Save for next tests
        });

        it("should FAIL to create a job if critical fields are completely missing", async () => {
            const res = await request(app)
                .post("/api/jobs")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    description: "Forgot the job title!",
                    employmentType: "Full-time"
                });

            // Based on express-validator logic catching missing "title", "skills", etc.
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it("should UPDATE an existing job description", async () => {
            const res = await request(app)
                .patch(`/api/jobs/${createdJobId}`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    description: "Updated testing description with more details"
                });

            expect(res.status).toBe(200);
            expect(res.body.data.description).toBe("Updated testing description with more details");
        });

        it("should fetch the newly created job for sanity checking", async () => {
            const res = await request(app).get(`/api/jobs/${createdJobId}`);
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe(validJobPayload.title);
        });

        it("should DELETE/ARCHIVE an existing job", async () => {
            const res = await request(app)
                .delete(`/api/jobs/${createdJobId}`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
