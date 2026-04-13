import { GlobalRole } from "@/types";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: GlobalRole;
  avatar?: string;
  isEmployee?: boolean;
  companyId?: string | null;
  companyRole?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}