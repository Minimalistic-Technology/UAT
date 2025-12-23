require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";

export const app = express();
app.use(express.json({ limit: "50mb" }));
import cors from "cors";
import cookieParser from "cookie-parser";
import AccessControlRoutes from './routes/AccessControlRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import companyRoutes from './routes/companyRoutes';
import documentRoutes from './routes/documentRoutes';
import connectDB from './utils/db';

require('dotenv').config();

connectDB();

app.use(
  cors({

    origin: ["https://minimalistic-hrm.onrender.com"],
    credentials: true,
  })
);



const bodyParser = require('body-parser');

app.use(cookieParser());


app.use('/hrm/auth', AccessControlRoutes);
app.use('/hrm/attendance', attendanceRoutes);
app.use('/hrm/leaves', leaveRoutes);
app.use('/hrm/company', companyRoutes);
app.use('/hrm/documents', documentRoutes);

export default app;