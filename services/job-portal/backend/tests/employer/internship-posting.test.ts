import request from "supertest";
import { app } from "../../src/index.js";
import User, { GlobalRole } from "../../src/models/User.model.js";
import Company from "../../src/models/Company.model.js";
import CompanyMember from "../../src/models/CompanyMember.model.js";
import Subscription from "../../src/models/Subscription.model.js";
import { generateToken } from "../../src/utils/jwt.js";

process.env.NODE_ENV = "test";

describe("Employer Panel - Internship Posting API Tests", () => {
    let employerToken: string;
    let jobSeekerToken: string;
    let companyId: string;
    let createdInternshipId: string;

    beforeAll(async () => {
        // 1. Create an Employer User
        const employer = await User.create({
            firstName: "Mark",
            lastName: "Employer",
            email: "employer@meta.com",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });

        // 2. Create the dummy Company with owner provided
        const company = await Company.create({
            name: "Amazon Core",
            industry: "Technology",
            companySize: "11-50",
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
            firstName: "Student",
            lastName: "Seeker",
            email: "seeker@university.edu",
            password: "password123",
            role: GlobalRole.USER,
            isVerified: true
        });
        jobSeekerToken = generateToken((jobSeeker._id as any).toString());
    });

    describe("Security & Authorization", () => {
        it("should reject UNATHENTICATED users attempting to create internships", async () => {
            const res = await request(app).post("/api/internships").send({ title: "Summer Intern" });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should reject Job Seekers (non-employers) from posting internships", async () => {
            const res = await request(app)
                .post("/api/internships")
                .set("Authorization", `Bearer ${jobSeekerToken}`)
                .send({ title: "Summer Intern" });

            // Expected to fail RBAC
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe("Internship Posting Operations (CRUD)", () => {

        // Fully valid payload mapped precisely 1-to-1 to internship.validations.ts and Enums
        const validInternshipPayload = {
            title: "Frontend Engineering Intern",
            description: "Learn and build React applications during the summer.",
            employmentType: "internship",
            workMode: "remote",
            companyType: "startup",
            roleCategory: "software_development",
            industry: "software",
            openings: 5,
            location: { city: "Remote", state: "Remote", country: "Remote" },
            education: { minimumDegree: "bachelors" },
            stipend: {
                type: "fixed",
                amount: 15000,
                currency: "INR",
                period: "monthly"
            },
            duration: {
                value: 6,
                unit: "months"
            },
            skills: ["React.js", "HTML", "CSS"],
            requirements: ["Basic knowledge of git", "Pursuing CS degree"],
            opportunityType: "internship"
        };

        it("should CREATE a new internship successfully directly into the database", async () => {
            const res = await request(app)
                .post("/api/internships")
                .set("Authorization", `Bearer ${employerToken}`)
                .send(validInternshipPayload);

            if (res.status === 400) console.log("Validation Error:", res.body);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(validInternshipPayload.title);
            expect(res.body.data.company.toString()).toBe(companyId.toString());

            createdInternshipId = res.body.data._id; // Save for next tests
        });

        it("should FAIL to create an internship if strict stipend/duration objects are missing", async () => {
            const res = await request(app)
                .post("/api/internships")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    title: "Internship without proper payload",
                    employmentType: "Internship"
                });

            // Based on express-validator logic catching missing "stipend.type" and "duration.value"
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it("should UPDATE an existing internship title", async () => {
            const res = await request(app)
                .patch(`/api/internships/${createdInternshipId}`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    title: "Updated Frontend Intern"
                });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe("Updated Frontend Intern");
        });

        it("should DELETE/ARCHIVE an existing internship", async () => {
            const res = await request(app)
                .delete(`/api/internships/${createdInternshipId}`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

});
