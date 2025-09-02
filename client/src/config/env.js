// Environment configuration utility
// All environment variables are prefixed with VITE_ for Vite to expose them

export const env = {
  // Backend API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Authentication Endpoints
  AUTH_ENDPOINT: import.meta.env.VITE_AUTH_ENDPOINT || '/auth',
  TASKS_ENDPOINT: import.meta.env.VITE_TASKS_ENDPOINT || '/api/tasks',
  HEALTH_ENDPOINT: import.meta.env.VITE_HEALTH_ENDPOINT || '/healthz',
  READINESS_ENDPOINT: import.meta.env.VITE_READINESS_ENDPOINT || '/readinessz',
  
  // Feature Flags
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // Session Configuration
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '1800000'), // 30 minutes
  SESSION_WARNING_TIME: parseInt(import.meta.env.VITE_SESSION_WARNING_TIME || '300000'), // 5 minutes
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'),
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  
  // Cache Configuration
  CACHE_DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'), // 5 minutes
  POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '30000'), // 30 seconds
  
  // Environment
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// API URL builder
export const buildApiUrl = (endpoint) => {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Full API endpoints
export const apiEndpoints = {
  login: `${env.AUTH_ENDPOINT}/login`,
  register: `${env.AUTH_ENDPOINT}/register`,
  refresh: `${env.AUTH_ENDPOINT}/refresh`,
  tasks: env.TASKS_ENDPOINT,
  task: (id) => buildApiUrl(`${env.TASKS_ENDPOINT}/${id}`),
  bulkUpdate: buildApiUrl(env.TASKS_ENDPOINT + '/bulk'),
  health: env.HEALTH_ENDPOINT,
  readiness: env.READINESS_ENDPOINT,
};

// Validation function
export const validateEnv = () => {
  const required = [
    'VITE_API_BASE_URL',
    'VITE_AUTH_ENDPOINT',
    'VITE_TASKS_ENDPOINT',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};

// Debug mode logging
export const debugLog = (...args) => {
  if (env.ENABLE_DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
};

export default env;
