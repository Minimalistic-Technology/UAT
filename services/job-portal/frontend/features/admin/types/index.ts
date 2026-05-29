import { Pagination, User } from "@/types/new-index";

export type FetchAllUsersParams = {
    page?: number;
    limit?: number;
}

export type UserWithCompany = User & {
  _id: string;
  isEmployee: boolean;
  companyId: string | null;
  companyRole: string | null;
  companyName: string | null;
};

export type FetchAllUsersResponse = {
  count: number;
  users: UserWithCompany[];
  pagination: Pagination;
};

export type ToggleUserStatusResponse = {
  updateUser: User;
}