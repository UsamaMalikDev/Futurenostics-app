import { useState, useEffect } from 'react';
import { useHealthCheckQuery, useReadinessCheckQuery } from '../store/api';
import { Wifi, WifiOff, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const HealthStatus = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthCheckQuery();
  const { data: readinessData, isLoading: readinessLoading, error: readinessError } = useReadinessCheckQuery();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (healthError || readinessError) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (healthLoading || readinessLoading) return <Clock className="h-4 w-4 text-blue-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  
  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (healthError || readinessError) return 'Backend Issues';
    if (healthLoading || readinessLoading) return 'Checking...';
    return 'Healthy';
  };
  
  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (healthError || readinessError) return 'text-yellow-600';
    if (healthLoading || readinessLoading) return 'text-blue-600';
    return 'text-green-600';
  };
  
  const getStatusBg = () => {
    if (!isOnline) return 'bg-red-50';
    if (healthError || readinessError) return 'bg-yellow-50';
    if (healthLoading || readinessLoading) return 'bg-blue-50';
    return 'bg-green-50';
  };
  
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusBg()}`}>
        {getStatusIcon()}
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
      </div>
      
      {/* Show detailed status on hover */}
      <div className="relative group">
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex items-center justify-between">
              <span>Network:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Health Check:</span>
              <span className={healthError ? 'text-red-600' : 'text-green-600'}>
                {healthLoading ? 'Checking...' : healthError ? 'Failed' : 'OK'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Readiness:</span>
              <span className={readinessError ? 'text-red-600' : 'text-green-600'}>
                {readinessLoading ? 'Checking...' : readinessError ? 'Failed' : 'OK'}
              </span>
            </div>
            
            {healthData && (
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Last checked: {new Date().toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
