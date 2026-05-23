class ApiError extends Error {
  public statusCode: number;
  public data: null;
  public success: boolean;
  public errors: unknown[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = [],
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    // Maintain proper prototype chain (important in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };