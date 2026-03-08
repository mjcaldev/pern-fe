import { GraduationCap, School } from "lucide-react";

export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.STUDENT,
    label: "Student",
    icon: GraduationCap,
  },
  {
    value: USER_ROLES.TEACHER,
    label: "Teacher",
    icon: School,
  },
];

export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Education",
  "Fine Arts",
  "Music",
  "Physical Education",
  "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/**
 * Validates and retrieves a required environment variable.
 * Throws a descriptive error if the variable is missing or undefined.
 * 
 * @param key - The environment variable key (e.g., 'VITE_API_URL')
 * @returns The environment variable value (guaranteed to be a string)
 * @throws Error if the environment variable is missing or undefined
 */
function getRequiredEnvVar(key: string): string {
  const value = import.meta.env[key];
  
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please ensure ${key} is set in your .env file or environment configuration.`
    );
  }
  
  return value;
}

/**
 * Retrieves an optional environment variable.
 * Returns undefined if the variable is missing or undefined.
 * 
 * @param key - The environment variable key
 * @returns The environment variable value or undefined
 */
function getOptionalEnvVar(key: string): string | undefined {
  const value = import.meta.env[key];
  return value === undefined || value === null || value === '' ? undefined : value;
}

/**
 * Validates that a string is a valid URL format.
 * 
 * @param url - The URL string to validate
 * @param key - The environment variable key for error messages
 * @throws Error if the URL format is invalid
 */
function validateUrl(url: string, key: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid URL format for environment variable ${key}: "${url}". ` +
      `Please provide a valid URL (e.g., https://example.com).`
    );
  }
}

/**
 * Validates that a string is a valid HTTP/HTTPS URL.
 * 
 * @param url - The URL string to validate
 * @param key - The environment variable key for error messages
 * @throws Error if the URL is not HTTP/HTTPS
 */
function validateHttpUrl(url: string, key: string): void {
  validateUrl(url, key);
  const urlObj = new URL(url);
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new Error(
      `Invalid protocol for environment variable ${key}: "${url}". ` +
      `Only HTTP and HTTPS protocols are allowed.`
    );
  }
}

/**
 * Validates Cloudinary configuration consistency.
 * If any Cloudinary env var is set, all should be set.
 * 
 * @throws Error if Cloudinary configuration is incomplete
 */
function validateCloudinaryConfig(): void {
  const uploadUrl = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_URL');
  const cloudName = getOptionalEnvVar('VITE_CLOUDINARY_CLOUD_NAME');
  const uploadPreset = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET');
  
  const cloudinaryVars = [
    { key: 'VITE_CLOUDINARY_UPLOAD_URL', value: uploadUrl },
    { key: 'VITE_CLOUDINARY_CLOUD_NAME', value: cloudName },
    { key: 'VITE_CLOUDINARY_UPLOAD_PRESET', value: uploadPreset },
  ];
  
  const setVars = cloudinaryVars.filter(v => v.value !== undefined);
  const unsetVars = cloudinaryVars.filter(v => v.value === undefined);
  
  if (setVars.length > 0 && unsetVars.length > 0) {
    const missing = unsetVars.map(v => v.key).join(', ');
    throw new Error(
      `Incomplete Cloudinary configuration. ` +
      `The following required environment variables are missing: ${missing}. ` +
      `Either set all Cloudinary variables or leave them all unset.`
    );
  }
  
  // Validate URL format if Cloudinary is configured
  if (uploadUrl) {
    validateHttpUrl(uploadUrl, 'VITE_CLOUDINARY_UPLOAD_URL');
  }
}

/**
 * Validates authentication configuration consistency.
 * If BASE_URL is set, validate its format.
 * 
 * @throws Error if authentication configuration is invalid
 */
function validateAuthConfig(): void {
  const baseUrl = getOptionalEnvVar('VITE_API_URL');
  
  if (baseUrl) {
    validateHttpUrl(baseUrl, 'VITE_API_URL');
  }
}

// Cloudinary constants - optional, will be undefined if not configured
// This allows the app to run without Cloudinary configured until it's actually needed
// When Cloudinary integration is added, these should be set in .env
export const CLOUDINARY_UPLOAD_URL = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_URL');
export const CLOUDINARY_CLOUD_NAME = getOptionalEnvVar('VITE_CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_UPLOAD_PRESET = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET');

// Validate Cloudinary configuration consistency
validateCloudinaryConfig();

// Required constants - these are needed for the app to function
export const BACKEND_BASE_URL = (() => {
  const url = getRequiredEnvVar('VITE_BACKEND_BASE_URL');
  validateHttpUrl(url, 'VITE_BACKEND_BASE_URL');
  // Normalize URL to always end with a trailing slash for consistent URL construction
  return url.endsWith('/') ? url : `${url}/`;
})();

// Optional constants - for future authentication features
// These will be undefined if not configured, allowing the app to run without auth initially
export const BASE_URL = getOptionalEnvVar('VITE_API_URL');
export const ACCESS_TOKEN_KEY = getOptionalEnvVar('VITE_ACCESS_TOKEN_KEY');
export const REFRESH_TOKEN_KEY = getOptionalEnvVar('VITE_REFRESH_TOKEN_KEY');

// Validate authentication configuration
validateAuthConfig();

// REFRESH_TOKEN_URL is only defined if BASE_URL is set
export const REFRESH_TOKEN_URL = (() => {
  if (!BASE_URL) return undefined;
  const url = `${BASE_URL}/refresh-token`;
  validateHttpUrl(url, 'REFRESH_TOKEN_URL');
  return url;
})();