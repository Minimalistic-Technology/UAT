import { User } from "@/types";

export interface IKycApplication {
  _id: string;
  user: User;
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photoUrl: string;
  lightbillUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedKycApplications {
  success: boolean;
  message: string;
  data: {
    count: number;
    applications: IKycApplication[];
    pagination: {
      totalPages: number;
      currentPage: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}