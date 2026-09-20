export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  details?: ApiErrorDetail[];
  success: false;

  constructor(statusCode: number, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;
  }
}

export default ApiError;
