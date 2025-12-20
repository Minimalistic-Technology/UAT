import { Request } from "express";

export interface AuthUserPayload {
  id: string;
  role: "user" | "admin" | "hr" | "super_admin";
  email: string;
  companyID?: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
  cookies: { [key: string]: any };
}

