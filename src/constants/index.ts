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

export const CLOUDINARY_UPLOAD_URL = getRequiredEnvVar('VITE_CLOUDINARY_UPLOAD_URL');
export const CLOUDINARY_CLOUD_NAME = getRequiredEnvVar('VITE_CLOUDINARY_CLOUD_NAME');
export const BACKEND_BASE_URL = getRequiredEnvVar('VITE_BACKEND_BASE_URL');

export const BASE_URL = getRequiredEnvVar('VITE_API_URL');
export const ACCESS_TOKEN_KEY = getRequiredEnvVar('VITE_ACCESS_TOKEN_KEY');
export const REFRESH_TOKEN_KEY = getRequiredEnvVar('VITE_REFRESH_TOKEN_KEY');

export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;

export const CLOUDINARY_UPLOAD_PRESET = getRequiredEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET');