import { Pagination, Plan } from "@/types/new-index";

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
