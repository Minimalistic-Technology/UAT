import { Request, Response } from "express";
import { AttendanceModel, IAttendance, ICheckInCheckOut } from "../models/attendance";
import { AuthUserModel } from "../models/authUser";
import mongoose from "mongoose";






export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: user not found in token" });
      return;
    }


    const { city, state, country, ip, lat, long } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let attendance = await AttendanceModel.findOne({ user: userId, date: today });


    const checkInData: ICheckInCheckOut = {
      dateTime: new Date(),
      city,
      state,
      country,
      ip,
      lat,
      long,
    };

    if (!attendance) {
      attendance = new AttendanceModel({
        user: userId,
        date: today,
        sessions: [{ checkIn: checkInData }],
      });
    } else {
      const lastSession = attendance.sessions[attendance.sessions.length - 1];

      if (lastSession && !lastSession.checkOut) {
        res.status(400).json({ message: "Already checked in, please checkout first." });
        return;
      }

      attendance.sessions.push({ checkIn: checkInData });
    }

    await attendance.save();

    res.status(200).json({
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error during check-in" });
  }
};


export const checkOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: user not found in token" });
      return;
    }

    const { city, state, country, ip, lat, long } = req.body;
    const today = new Date().toISOString().split("T")[0];


    const attendance = await AttendanceModel.findOne({ user: userId, date: today });
    if (!attendance) {
      res.status(404).json({ message: "No attendance record found for today" });
      return;
    }

    const lastSession = attendance.sessions[attendance.sessions.length - 1];
    if (!lastSession || lastSession.checkOut) {
      res.status(400).json({ message: "No active check-in found for checkout" });
      return;
    }

    const checkOutData: ICheckInCheckOut = {
      dateTime: new Date(),
      city,
      state,
      country,
      ip,
      lat,
      long,
    };

    lastSession.checkOut = checkOutData;


    let total = 0;
    for (const session of attendance.sessions) {
      if (session.checkIn?.dateTime && session.checkOut?.dateTime) {
        const diff =
          new Date(session.checkOut.dateTime).getTime() -
          new Date(session.checkIn.dateTime).getTime();
        total += diff / (1000 * 60 * 60);
      }
    }

    attendance.totalHours = total;
    await attendance.save();

    res.status(200).json({
      message: "Checked out successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Server error during check-out" });
  }
};





export const getAttendanceByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const records = await AttendanceModel.find({ date });
    res.status(200).json(records);
  } catch (error) {
    console.error("Get by date error:", error);
    res.status(500).json({ message: "Server error fetching attendance by date" });
  }
};



export const getAttendanceByEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const records = await AttendanceModel.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Get by employee error:", error);
    res.status(500).json({ message: "Server error fetching attendance by employee" });
  }
};


export const getAttendanceByEmployeeSelf = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const records = await AttendanceModel.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Get by employee error:", error);
    res.status(500).json({ message: "Server error fetching attendance by employee" });
  }
};


export const getAbsentEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;

    const allUsers = await AuthUserModel.find({}, "_id username email");

    const presentRecords = await AttendanceModel.find({ date }, "user");
    const presentUserIds = presentRecords.map((r) => r.user.toString());

    const absentUsers = allUsers.filter(
      (user) => !presentUserIds.includes(user._id.toString())
    );

    res.status(200).json({ date, absentUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch absent users" });
  }

}
