import request from "supertest";
import { app } from "../../src/index.js";
import User, { GlobalRole } from "../../src/models/User.model.js";
import Company from "../../src/models/Company.model.js";
import CompanyMember from "../../src/models/CompanyMember.model.js";
import Subscription from "../../src/models/Subscription.model.js";
import Job from "../../src/models/Job.model.js";
import KYC from "../../src/models/KYC.model.js"; // KYC object might be required by application if seeker needs complete profile, actually maybe just User is enough
import { generateToken } from "../../src/utils/jwt.js";

process.env.NODE_ENV = "test";

describe("Employer Panel - Application Management Tests", () => {
    let employerToken: string;
    let jobSeekerToken: string;
    let maliciousEmployerToken: string;

    let companyId: string;
    let createdJobId: string;
    let applicationId: string;

    beforeAll(async () => {
        // 1. Create Employer User
        const employer = await User.create({
            firstName: "Tech",
            lastName: "HR",
            email: "hr@techcompany.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });

        // 2. Create the dummy Company
        const company = await Company.create({
            name: "Tech Solutions",
            industry: "software",
            companySize: "11-50",
            location: { city: "SF", country: "USA" },
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
        employerToken = generateToken((employer._id as unknown as string));

        // 4. Create Active Subscription for Employer
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await Subscription.create({
            employerId: employer._id,
            companyId: company._id,
            planId: employer._id,
            status: "active",
            startDate: new Date(),
            expiryDate: oneYearFromNow,
            postsRemaining: -1,
            totalPostsGranted: 999
        });

        // 5. Create a Job seeker
        const jobSeeker = await User.create({
            firstName: "Frank",
            lastName: "Candidate",
            email: "frank@jobseeker.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true,
            resume: {
                url: "https://example.com/frank_resume.pdf",
                publicId: "frank_123"
            }
        });
        jobSeekerToken = generateToken((jobSeeker._id as unknown as string));

        // Removed KYC block as User.resume handles application reqs

        // 6. Create Malicious Employer (For unauthorized tests)
        const maliciousEmployer = await User.create({
            firstName: "Evil",
            lastName: "HR",
            email: "evil@hacker.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });
        maliciousEmployerToken = generateToken((maliciousEmployer._id as unknown as string));

        // 7. Create a genuine Job posting under the genuine Employer's Company
        const job = await Job.create({
            title: "Backend Engineer",
            description: "Node.js Expert",
            employmentType: "full_time",
            workMode: "remote",
            companyType: "mnc",
            roleCategory: "software_development",
            industry: "software",
            experienceLevel: "intermediate",
            experienceInYears: 3,
            openings: 2,
            location: { city: "Remote", state: "Remote", country: "Remote" },
            education: { minimumDegree: "bachelors", isRequired: true },
            salary: { min: 90000, max: 130000, currency: "USD", period: "yearly" },
            skills: ["Node.js", "Express"],
            requirements: ["3+ years exp"],
            opportunityType: "job",
            status: "active",
            company: company._id,
            postedBy: employer._id
        });
        createdJobId = (job._id as unknown as string);
    });

    describe("Part 1: Job Seeker Applies to the Job", () => {
        it("should allow job seeker to apply for the active job", async () => {
            const res = await request(app)
                .post("/api/applications")
                .set("Authorization", `Bearer ${jobSeekerToken}`)
                .send({
                    listingId: createdJobId,
                    listingType: "job"
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            applicationId = res.body.data._id || (res.body.data as any).id;
            if (!applicationId) console.log("Missing ID in Response Data:", res.body.data);
        });

        it("should prevent duplicate applications from the same user for the same job", async () => {
            const res = await request(app)
                .post("/api/applications")
                .set("Authorization", `Bearer ${jobSeekerToken}`)
                .send({
                    listingId: createdJobId,
                    listingType: "job"
                });

            // Duplicate should be caught either via Express Validator or Mongoose Duplicate Key Error
            // Usually returns 400 or 500 depending on exact error handler setup.
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Part 2: Employer Manages Applications", () => {
        it("should fetch all applications belonging to the employer's company", async () => {
            const res = await request(app)
                .get("/api/applications/company/all")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0]._id.toString()).toBe(applicationId);
            expect(res.body.data[0].jobSeeker).toBeDefined(); // Population check
        });

        it("should fetch all applicants specifically tied to the created Job ID", async () => {
            // This is a POST request per application.routes.ts for `my-applications` listing
            const res = await request(app)
                .post("/api/applications/jobs/my-applications")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    listingId: createdJobId,
                    listingType: "job"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some((app: any) => app._id === applicationId)).toBe(true);
        });

        it("should fetch details of a specific application accurately by ID", async () => {
            const res = await request(app)
                .get(`/api/applications/${applicationId}`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(applicationId);
            expect(res.body.data.status).toBe("pending");
        });

        it("should successfully UPDATE the application status to 'shortlisted'", async () => {
            const updatePayload = {
                status: "shortlisted",
                note: "Impressive background, move to interview round."
            };

            const res = await request(app)
                .put(`/api/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send(updatePayload);

            // Print error if it failed validation so we can debug easily
            if (res.status === 400) console.log("Validation Body:", res.body);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("shortlisted");

            // Check if statusHistory captured the transition
            expect(res.body.data.statusHistory).toBeDefined();
            const history = res.body.data.statusHistory;
            expect(history[history.length - 1].status).toBe("shortlisted");
            expect(history[history.length - 1].note).toBe(updatePayload.note);
        });
    });

    describe("Part 3: Bad Inputs & Interceptors", () => {
        it("should REJECT employer an attempt to update an application with an invalid Enum Status", async () => {
            const res = await request(app)
                .put(`/api/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "fake_invalid_status" });

            expect(res.status).toBe(400); // Bad Request from Validator
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it("should REJECT a Malicious Employer from updating another company's application status", async () => {
            // Note: Actual logic inside `updateApplicationStatus` should ensure `app.companyId === employer.companyId`
            const res = await request(app)
                .put(`/api/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${maliciousEmployerToken}`)
                .send({ status: "rejected" });

            // Depending on implementation, it emits a 403 or 404 (not found for that employer)
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

});
