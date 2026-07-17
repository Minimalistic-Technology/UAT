require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";

export const app = express();
app.use(express.json({ limit: "50mb" }));
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error";

import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import teamRoutes from './Team/routes/teamRoutes';
import templateRoutes from './Template/routes/templateRoutes';
import testimonialRoutes from './Testimonial/routes/testimonialRoutes';

require('dotenv').config();
// const apiLogger = require('./controllers/apiLogger');
// cors => cross origin resource sharing
app.use(
  cors({
    origin: ["https://minimalistictechnology.com", "https://www.minimalistictechnology.com", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use('/api/teams', teamRoutes);
app.use('/api/mt/templates', templateRoutes);
app.use('/api/mt/testimonials', testimonialRoutes);

const limiter = rateLimit({
  windowMs: 60000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (req, res, next) {
    setTimeout(() => {
      next();
    }, 5000);
  }
})

// middleware calls
app.use(limiter);
// app.use(apiLogger)
// routes



// testing api
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "GET API is working fine by Parth Doshi",
  });
});

import { sendMail } from "./utils/sendMail";

app.post("/api/send-mail", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formData, text, html } = req.body;

    // Send email to Admin
    await sendMail({
      email: process.env.BREVO_FROM_EMAIL || "parthdoshi480@gmail.com",
      subject: `New Contact Form Submission from ${formData?.fullName || 'Website'}`,
      text: text,
      html: html
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending mail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});


app.use(errorMiddleware);

export default app;
