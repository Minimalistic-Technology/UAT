// Validation utilities for authentication forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 * Requirements: ≥8 characters, 1 uppercase, 1 number, 1 special character
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validates required text field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validates contact number (basic validation)
 */
export const validateContactNumber = (contactNumber: string): ValidationResult => {
  if (!contactNumber || contactNumber.trim() === '') {
    return { isValid: false, error: 'Contact number is required' };
  }

  // Remove spaces, dashes, and parentheses for validation
  const cleaned = contactNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it contains only digits and has reasonable length (7-15 digits)
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Contact number must contain only digits' };
  }

  if (cleaned.length < 7 || cleaned.length > 15) {
    return { isValid: false, error: 'Contact number must be between 7 and 15 digits' };
  }

  return { isValid: true };
};

/**
 * Validates name field
 */
export const validateName = (name: string, fieldName: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { isValid: true };
};

