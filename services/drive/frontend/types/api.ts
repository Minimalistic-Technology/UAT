export interface ApiSuccessResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  success: boolean;
  errors?: any[]; // For validation errors (e.g., from Zod/Joi on backend)
  stack?: string; // Only present in development mode
}