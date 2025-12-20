import express from 'express';
import {
} from '../controllers/attendanceController';
import { isUser } from '../middleware/authMiddleware';

const router = express.Router();

import {
  checkIn,
  checkOut,
  getAttendanceByDate,
  getAttendanceByEmployee,
  getAbsentEmployee,
  getAttendanceByEmployeeSelf,
} from "../controllers/attendanceController";


router.post("/checkin", isUser , checkIn);
router.post("/checkout", isUser,  checkOut);
router.get("/absent/:date" , getAbsentEmployee);
router.get("/date/:date",isUser ,  getAttendanceByDate);
router.get("/employee/:eid", isUser , getAttendanceByEmployee);
router.get("/emp/attendance", isUser , getAttendanceByEmployeeSelf);
export default router;