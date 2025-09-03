import { Navigate } from 'react-router-dom';
import useSecureAuth from '../hooks/useSecureAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useSecureAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If there's an error fetching user profile, redirect to login
  if (error) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 