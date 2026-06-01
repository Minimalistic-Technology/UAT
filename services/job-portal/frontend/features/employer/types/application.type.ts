export type GetAllEmployerApplicationsResponse = {
  applications: any;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};
