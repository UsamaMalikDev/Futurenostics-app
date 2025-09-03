/**
 * Secure storage utilities for handling sensitive data
 * Only stores minimal, non-sensitive data in localStorage
 * Sensitive data is fetched from server when needed
 */

// Configuration for what can be safely stored
const STORAGE_CONFIG = {
  // Safe to store in localStorage (non-sensitive UI preferences)
  SAFE_KEYS: ['theme', 'language', 'preferences', 'lastActivity'],
  // Never store these sensitive items
  SENSITIVE_KEYS: ['token', 'refreshToken', 'user', 'role', 'permissions', 'email', 'password']
};

/**
 * Secure storage wrapper that only allows safe data
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      // Only allow safe keys to be stored
      if (STORAGE_CONFIG.SAFE_KEYS.includes(key)) {
        localStorage.setItem(key, value);
      } else {
        console.warn(`Attempted to store sensitive data: ${key}. This is not allowed for security reasons.`);
      }
    } catch (error) {
      console.warn(`Failed to store ${key}:`, error);
    }
  },

  getItem: (key) => {
    try {
      if (STORAGE_CONFIG.SAFE_KEYS.includes(key)) {
        return localStorage.getItem(key);
      } else {
        console.warn(`Attempted to retrieve sensitive data: ${key}. This is not allowed for security reasons.`);
        return null;
      }
    } catch (error) {
      console.warn(`Failed to retrieve ${key}:`, error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      if (STORAGE_CONFIG.SAFE_KEYS.includes(key)) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error);
    }
  },

  clear: () => {
    try {
      // Only clear safe keys, don't touch sensitive data
      STORAGE_CONFIG.SAFE_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }
};

/**
 * Session storage for temporary data (cleared when tab closes)
 * Only for very minimal session data
 */
export const sessionStorage = {
  setItem: (key, value) => {
    try {
      // Only allow minimal session data
      if (key === 'sessionId' || key === 'lastActivity') {
        window.sessionStorage.setItem(key, value);
      } else {
        console.warn(`Attempted to store sensitive data in session: ${key}. This is not allowed.`);
      }
    } catch (error) {
      console.warn(`Failed to store session data ${key}:`, error);
    }
  },

  getItem: (key) => {
    try {
      if (key === 'sessionId' || key === 'lastActivity') {
        return window.sessionStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn(`Failed to retrieve session data ${key}:`, error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove session data ${key}:`, error);
    }
  },

  clear: () => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }
};

/**
 * Security utilities
 */
export const securityUtils = {
  // Check if we're in a secure context
  isSecureContext: () => {
    return window.isSecureContext || window.location.protocol === 'https:';
  },

  // Validate token format
  isValidToken: (token) => {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  },

  // Clear all sensitive data
  clearSensitiveData: () => {
    // Clear any sensitive data that might be in memory
    STORAGE_CONFIG.SENSITIVE_KEYS.forEach(key => {
      localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
    
    // Also clear any old data that might exist
    const sensitiveKeys = ['token', 'refreshToken', 'user', 'role', 'permissions', 'email', 'password', 'id', 'orgId', 'roles'];
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
  }
};

export default {
  secureStorage,
  sessionStorage,
  securityUtils
};
