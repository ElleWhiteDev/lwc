/**
 * Input validation utilities
 * Provides reusable validation functions for common patterns
 */

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.status = 400;
  }
}

/**
 * Email validation
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required", "email");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format", "email");
  }

  return email.trim().toLowerCase();
}

/**
 * Password validation
 */
export function validatePassword(password, minLength = 8) {
  if (!password || typeof password !== "string") {
    throw new ValidationError("Password is required", "password");
  }

  if (password.length < minLength) {
    throw new ValidationError(
      `Password must be at least ${minLength} characters`,
      "password"
    );
  }

  return password;
}

/**
 * Required string validation
 */
export function validateRequiredString(value, fieldName, maxLength = null) {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }

  const trimmed = value.trim();

  if (maxLength && trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be ${maxLength} characters or less`,
      fieldName
    );
  }

  return trimmed;
}

/**
 * Optional string validation
 */
export function validateOptionalString(value, fieldName, maxLength = null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  const trimmed = value.trim();

  if (maxLength && trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be ${maxLength} characters or less`,
      fieldName
    );
  }

  return trimmed || null;
}

/**
 * URL validation
 */
export function validateUrl(url, fieldName = "URL") {
  if (!url) {
    return null;
  }

  try {
    new URL(url);
    return url;
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`, fieldName);
  }
}

/**
 * Boolean validation
 */
export function validateBoolean(value, fieldName, defaultValue = false) {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  // Handle string representations
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }

  throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
}

/**
 * Integer validation
 */
export function validateInteger(value, fieldName, min = null, max = null) {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid integer`, fieldName);
  }

  if (min !== null && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }

  if (max !== null && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
  }

  return num;
}

