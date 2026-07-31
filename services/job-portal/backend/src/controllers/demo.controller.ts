import type { Request, Response, NextFunction } from "express";
import { sendEmail } from "../utils/email.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { config } from "../config/env.js";

export const bookDemo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, date, time, hiresPerYear } = req.body;

        if (!email || !date || !time) {
            return next(new ApiError(400, "Email, date, and time are required fields."));
        }

        // Default admin receiver, fallback to config.emailUser or a placeholder
        const adminEmail = config.emailUser || "admin@yourdomain.com";

        const subject = `New Demo Call Booking from ${email}`;
        const message = `
You have a new demo call booking!

Details:
- Email: ${email}
- Date: ${date}
- Time: ${time}
- Estimated Hires/Year: ${hiresPerYear}

Please reach out to the user to confirm the call details.
    `;

        await sendEmail({
            email: adminEmail,
            subject,
            message,
        });

        res.status(200).json(new ApiResponse(200, {}, "Demo call booked successfully!"));
    } catch (error: any) {
        next(new ApiError(500, "Failed to book demo call: " + error.message));
    }
};
