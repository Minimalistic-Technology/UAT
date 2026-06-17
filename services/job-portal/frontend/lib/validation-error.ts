export const getValidationErrorMessage = (errorResponse: any) => {
  const { errors, message } = errorResponse;

  if (errors && Array.isArray(errors) && errors.length > 0) {
    // Get the first error object (e.g., { "undefined": "Resume is required" })
    const firstError = errors[0];

    // Extract the first value regardless of the key name
    return Object.values(firstError)[0];
  }

  // Fallback to the generic message if no specific errors exist
  return message || "Something went wrong";
};
