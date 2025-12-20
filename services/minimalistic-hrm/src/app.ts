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


require('dotenv').config();
// const apiLogger = require('./controllers/apiLogger');
// cors => cross origin resource sharing
app.use(
  cors({

    // make sure you don't have / in last 
    // Do "http://localhost:3000"
    // Don't "http://localhost:3000/"

    origin: ["http://localhost:3000"],
    credentials: true,
  })
);


// body parser
const bodyParser = require('body-parser');

// cookie parser
app.use(cookieParser());


app.use('/hrm/auth', AccessControlRoutes);
app.use('/hrm/attendance', attendanceRoutes);
app.use('/hrm/leaves', leaveRoutes);
app.use('/hrm/company', companyRoutes);
app.use('/hrm/documents', documentRoutes);

export default app;