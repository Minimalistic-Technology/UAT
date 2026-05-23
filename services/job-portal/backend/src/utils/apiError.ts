class ApiError extends Error {
  statusCode: number;
  message: string;
  success: boolean;
  data: null;
  errors: unknown[]; // Flexible type for errors array, can be refined based on use case
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Internal server error",
    errors: unknown[] = [],
    errStack: string = "",
  ) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = errors;

    if (errStack) {
      this.stack = errStack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };