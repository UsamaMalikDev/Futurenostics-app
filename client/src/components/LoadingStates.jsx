import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';

// Loading spinner component
export const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Skeleton loading component
export const Skeleton = ({ className = '', lines = 1, height = 'h-4' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Table skeleton for loading states
export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Error state component
export const ErrorState = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  showDetails = false,
  className = '' 
}) => {
  const isNetworkError = error?.status === 'FETCH_ERROR' || 
                        error?.message?.includes('network') ||
                        error?.message?.includes('fetch');
  
  const isAuthError = error?.status === 401 || error?.status === 403;
  const isRateLimitError = error?.status === 429;
  const isServerError = error?.status >= 500;

  const getErrorIcon = () => {
    if (isNetworkError) return <WifiOff className="h-12 w-12 text-red-500" />;
    if (isAuthError) return <AlertCircle className="h-12 w-12 text-yellow-500" />;
    if (isRateLimitError) return <Clock className="h-12 w-12 text-orange-500" />;
    if (isServerError) return <AlertCircle className="h-12 w-12 text-red-500" />;
    return <AlertCircle className="h-12 w-12 text-gray-500" />;
  };

  const getErrorMessage = () => {
    if (isNetworkError) return 'Unable to connect to the server. Please check your internet connection.';
    if (isAuthError) return 'Your session may have expired. Please log in again.';
    if (isRateLimitError) return 'Too many requests. Please wait a moment and try again.';
    if (isServerError) return 'Server error. Our team has been notified.';
    
    // Handle different error formats
    if (error?.data) {
      return typeof error.data === 'string' ? error.data : JSON.stringify(error.data);
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      return JSON.stringify(error);
    }
    
    return 'An unexpected error occurred.';
  };

  const getErrorTitle = () => {
    if (isNetworkError) return 'Connection Error';
    if (isAuthError) return 'Authentication Error';
    if (isRateLimitError) return 'Rate Limited';
    if (isServerError) return 'Server Error';
    return title;
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mb-4">
        {getErrorIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {getErrorTitle()}
      </h3>
      
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {getErrorMessage()}
      </p>

      {showDetails && error && (
        <details className="text-left mb-4 p-4 bg-gray-100 rounded-lg max-w-md mx-auto">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Error Details
          </summary>
          <div className="text-sm text-gray-600 space-y-2">
            {error.status && (
              <div>
                <strong>Status:</strong> {typeof error.status === 'object' ? JSON.stringify(error.status) : error.status}
              </div>
            )}
            {error.timestamp && (
              <div>
                <strong>Time:</strong> {new Date(error.timestamp).toLocaleString()}
              </div>
            )}
            {error.data && (
              <div>
                <strong>Message:</strong> {typeof error.data === 'object' ? JSON.stringify(error.data) : error.data}
              </div>
            )}
            {error.message && (
              <div>
                <strong>Error:</strong> {error.message}
              </div>
            )}
          </div>
        </details>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  icon = null,
  title = 'No items found',
  description = 'There are no items to display.',
  action = null,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Success state component
export const SuccessState = ({ 
  icon = <CheckCircle className="h-12 w-12 text-green-500" />,
  title = 'Success!',
  description = 'Operation completed successfully.',
  action = null,
  className = '' 
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mb-4">
        {icon}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Network status indicator
export const NetworkStatus = ({ isOnline, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-700">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-700">Offline</span>
        </>
      )}
    </div>
  );
};

// Loading overlay for modals and forms
export const LoadingOverlay = ({ isLoading, children, className = '' }) => {
  if (!isLoading) return children;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
        <LoadingSpinner size="lg" text="Processing..." />
      </div>
    </div>
  );
}; 