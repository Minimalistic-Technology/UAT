import { Request, Response } from "express";
import CompanyModel from "../models/Company";
import AuthUserModel from "../models/authUser";
import { AuthRequest } from "../utils/types";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";



/* =====================================================
   ADD COMPANY (SUPER ADMIN ONLY)
===================================================== */
export const addCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== "super_admin") {
      res.status(403).json({ message: "Only super admin can create company" });
      return;
    }

    const {
      name,
      companyType
    } = req.body;


    const existingCompany = await CompanyModel.findOne({ name });
    if (existingCompany) {
      res.status(400).json({ message: "Company NAme already exists" });
      return;
    }

    console.log(name,
      companyType,
      authReq.user!.id,)

    const company = await CompanyModel.create({
      name,
      companyType,
      createdBy: authReq.user!.id,
    });



    res.status(201).json({
      message: "Company created successfully",
      company,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Duplicate company ID" });
      return;
    }

    res.status(500).json({ message: "Failed to create company", error });
  }
};

/* =====================================================
   UPDATE COMPANY (SUPER ADMIN / COMPANY ADMIN)
===================================================== */

export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { name, companyType, status, CompanyLeaves } = req.body;

    const company = await CompanyModel.findById(id);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    const isSuperAdmin = authReq.user.role === "super_admin";
    const isCompanyAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyID?.toString() === company._id.toString();

    if (!isSuperAdmin && !isCompanyAdmin) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // 🔹 Update allowed fields
    if (name !== undefined) company.name = name;
    if (companyType !== undefined) company.companyType = companyType;
    if (status !== undefined) company.status = status;

    // 🔹 Update company leave configuration
    if (CompanyLeaves) {
      company.CompanyLeaves = {
        ...company.CompanyLeaves,
        ...CompanyLeaves,
      };
    }

    await company.save();

    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ message: "Failed to update company" });
  }
};


export const getCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let query = {};

    if (req.user.role === "super_admin") {
      // see all
    } else if (req.user.role === "admin" && req.user.companyID) {
      query = { _id: req.user.companyID };
    } else {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const companies = await CompanyModel.find(query);
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
};

/* =====================================================
   ADD USER TO COMPANY (SUPER ADMIN / COMPANY ADMIN)
===================================================== */
export const addUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      name,
      email,
      password,
      role,
      companyID,
      contact,
      address,
      photoURL,
    } = req.body;

    let targetCompanyID = companyID;

    if (authReq.user.role === "super_admin") {
      if (!companyID) {
        res.status(400).json({ message: "Company ID is required for Super Admin" });
        return;
      }
    } else if (authReq.user.role === "admin") {
      targetCompanyID = authReq.user.companyID;
      if (role === "admin" || role === "super_admin") {
        res.status(403).json({ message: "Admin cannot create other admins" });
        return;
      }
    } else {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    console.log(companyID)
    const company = await CompanyModel.findById(companyID);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    const existingUser = await AuthUserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthUserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      companyID: targetCompanyID,
      contact,
      address,
      photoURL,
    });

    // Increment employee count
    company.employeeCount = (company.employeeCount || 0) + 1;
    await company.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyID: newUser.companyID,
      },
    });
  } catch (error) {
    console.error("Add User Error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};
