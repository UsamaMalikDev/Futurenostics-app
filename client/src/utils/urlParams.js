import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

// URL parameter configuration with validation
const PARAM_CONFIG = {
  scope: {
    defaultValue: 'my',
    validValues: ['my', 'org'],
    validate: (value) => PARAM_CONFIG.scope.validValues.includes(value),
  },
  status: {
    defaultValue: '',
    validValues: ['', 'todo', 'in_progress', 'review', 'done'],
    validate: (value) => PARAM_CONFIG.status.validValues.includes(value),
  },
  priority: {
    defaultValue: '',
    validValues: ['', 'low', 'medium', 'high', 'urgent'],
    validate: (value) => PARAM_CONFIG.priority.validValues.includes(value),
  },
  tags: {
    defaultValue: '',
    validate: (value) => typeof value === 'string',
    parse: (value) => value ? value.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    serialize: (value) => Array.isArray(value) ? value.join(',') : value,
  },
  q: {
    defaultValue: '',
    validate: (value) => typeof value === 'string' && value.length <= 100,
  },
  cursor: {
    defaultValue: '',
    validate: (value) => typeof value === 'string',
  },
  limit: {
    defaultValue: '20',
    validValues: ['10', '20', '50', '100'],
    validate: (value) => PARAM_CONFIG.limit.validValues.includes(value),
  },
  sortBy: {
    defaultValue: 'createdAt',
    validValues: ['createdAt', 'updatedAt', 'title', 'priority', 'status'],
    validate: (value) => PARAM_CONFIG.sortBy.validValues.includes(value),
  },
  sortOrder: {
    defaultValue: 'desc',
    validValues: ['asc', 'desc'],
    validate: (value) => PARAM_CONFIG.sortOrder.validValues.includes(value),
  },
};

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized parsed parameters with validation
  const parsedParams = useMemo(() => {
    const params = {};
    for (const [key, config] of Object.entries(PARAM_CONFIG)) {
      const value = searchParams.get(key) || config.defaultValue;
      if (config.validate && config.validate(value)) {
        params[key] = config.parse ? config.parse(value) : value;
      } else {
        params[key] = config.parse ? config.parse(config.defaultValue) : config.defaultValue;
      }
    }
    return params;
  }, [searchParams]);

  // Debounced parameter setter
  const setParamDebounced = useCallback(
    (() => {
      let timeoutId;
      return (key, value, delay = 300) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setParam(key, value);
        }, delay);
      };
    })(),
    []
  );

  const setParam = useCallback((key, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const config = PARAM_CONFIG[key];
    
    if (config && config.validate && !config.validate(value)) {
      value = config.defaultValue;
    }
    
    if (value && value !== '' && value !== config?.defaultValue) {
      const serializedValue = config?.serialize ? config.serialize(value) : value;
      newSearchParams.set(key, serializedValue);
    } else {
      newSearchParams.delete(key);
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const setMultipleParams = useCallback((params, options = {}) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const { replace = true, resetCursor = true } = options;
    
    Object.entries(params).forEach(([key, value]) => {
      const config = PARAM_CONFIG[key];
      
      if (config && config.validate && !config.validate(value)) {
        value = config.defaultValue;
      }
      
      if (value && value !== '' && value !== config?.defaultValue) {
        const serializedValue = config?.serialize ? config.serialize(value) : value;
        newSearchParams.set(key, serializedValue);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    // Reset cursor when filters change (unless explicitly disabled)
    if (resetCursor && newSearchParams.get('cursor')) {
      newSearchParams.delete('cursor');
    }
    
    setSearchParams(newSearchParams, { replace });
  }, [searchParams, setSearchParams]);

  const clearParams = useCallback((keys = null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (keys) {
      keys.forEach(key => newSearchParams.delete(key));
    } else {
      // Clear all except scope
      Object.keys(PARAM_CONFIG).forEach(key => {
        if (key !== 'scope') {
          newSearchParams.delete(key);
        }
      });
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const resetToDefaults = useCallback(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(PARAM_CONFIG).forEach(([key, config]) => {
      if (config.defaultValue !== '') {
        newSearchParams.set(key, config.defaultValue);
      }
    });
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams]);

  // Get parameter with fallback to default
  const getParam = useCallback((key, fallback = null) => {
    return parsedParams[key] ?? fallback ?? PARAM_CONFIG[key]?.defaultValue;
  }, [parsedParams]);

  // Check if parameter has non-default value
  const hasNonDefaultValue = useCallback((key) => {
    const value = searchParams.get(key);
    const defaultValue = PARAM_CONFIG[key]?.defaultValue;
    return value && value !== defaultValue;
  }, [searchParams]);

  // Get all non-default parameters
  const getActiveFilters = useCallback(() => {
    return Object.keys(PARAM_CONFIG).filter(key => 
      key !== 'scope' && hasNonDefaultValue(key)
    );
  }, [hasNonDefaultValue]);

  // Build shareable URL
  const buildShareableUrl = useCallback(() => {
    const baseUrl = window.location.origin + location.pathname;
    const params = new URLSearchParams(searchParams);
    return `${baseUrl}?${params.toString()}`;
  }, [searchParams, location.pathname]);

  return {
    searchParams,
    parsedParams,
    getParam,
    setParam,
    setParamDebounced,
    setMultipleParams,
    clearParams,
    resetToDefaults,
    hasNonDefaultValue,
    getActiveFilters,
    buildShareableUrl,
  };
};

export const parseUrlParams = (searchParams) => {
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    const config = PARAM_CONFIG[key];
    if (config && config.parse) {
      params[key] = config.parse(value);
    } else {
      params[key] = value;
    }
  }
  return params;
};

// Hook for URL parameter persistence across sessions
export const usePersistentUrlParams = (key, defaultValue) => {
  const { getParam, setParam } = useUrlParams();
  const storedValue = localStorage.getItem(`urlParam_${key}`);
  
  const value = getParam(key, storedValue || defaultValue);
  
  const setValue = useCallback((newValue) => {
    setParam(key, newValue);
    if (newValue && newValue !== defaultValue) {
      localStorage.setItem(`urlParam_${key}`, newValue);
    } else {
      localStorage.removeItem(`urlParam_${key}`);
    }
  }, [key, setParam, defaultValue]);
  
  return [value, setValue];
}; 