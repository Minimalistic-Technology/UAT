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
