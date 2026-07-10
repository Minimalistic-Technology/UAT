import { Pagination, Plan } from "@/types";

export type GetAllAdminPlans = {
  plans: Plan[];
  pagination: Pagination;
};

export type UpdatePlan = {
  plan: Plan;
};

export type CreatePlan = {
  plan: Plan;
};
