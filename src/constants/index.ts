export const DEPARTMENTS = ['CS', 'Math', 'English'];

export const DEPARTMENTS_OPTIONS = DEPARTMENTS.map((department) => ({
    value: department,
    label: department,
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

// Cloudinary constants - optional, will be undefined if not configured
// This allows the app to run without Cloudinary configured until it's actually needed
// When Cloudinary integration is added, these should be set in .env
export const CLOUDINARY_UPLOAD_URL = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_URL');
export const CLOUDINARY_CLOUD_NAME = getOptionalEnvVar('VITE_CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_UPLOAD_PRESET = getOptionalEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET');

// Required constants - these are needed for the app to function
export const BACKEND_BASE_URL = getRequiredEnvVar('VITE_BACKEND_BASE_URL');

// Optional constants - for future authentication features
// These will be undefined if not configured, allowing the app to run without auth initially
export const BASE_URL = getOptionalEnvVar('VITE_API_URL');
export const ACCESS_TOKEN_KEY = getOptionalEnvVar('VITE_ACCESS_TOKEN_KEY');
export const REFRESH_TOKEN_KEY = getOptionalEnvVar('VITE_REFRESH_TOKEN_KEY');

// REFRESH_TOKEN_URL is only defined if BASE_URL is set
export const REFRESH_TOKEN_URL = BASE_URL ? `${BASE_URL}/refresh-token` : undefined;