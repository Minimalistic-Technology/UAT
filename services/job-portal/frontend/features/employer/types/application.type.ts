export type GetAllEmployerApplicationsResponse = {
  applications: any;
  count: number;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};

export interface DashboardApplication {
  _id: string;
  jobSeeker?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  listing?: {
    title?: string;
  };
  listingType?: string;
  status: string;
  createdAt: string;
}

export interface DashboardApplicationsResponse {
  applications: DashboardApplication[];
  pagination: {
    totalItems: number;
  };
}
