import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUserProfileQuery } from '../store/api';
import { setUserData, logout, setSessionExpired } from '../store/authSlice';
import { securityUtils } from '../utils/secureStorage';

/**
 * Secure authentication hook that:
 * - Never stores sensitive data in localStorage
 * - Fetches user data from server when needed
 * - Manages session security
 */
export const useSecureAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  // Fetch user profile when authenticated but no user data
  const { 
    data: userProfile, 
    error: profileError, 
    isLoading: profileLoading 
  } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated || !!user, // Skip if not authenticated or user already exists
    retry: false, // Don't retry on error to avoid infinite loops
  });

  // Set user data when profile is fetched
  useEffect(() => {
    if (userProfile && !user) {
      dispatch(setUserData(userProfile));
    }
  }, [userProfile, user, dispatch]);

  // Handle profile fetch errors
  useEffect(() => {
    if (profileError && profileError.status === 401) {
      // Token is invalid, logout user
      dispatch(logout());
    }
  }, [profileError, dispatch]);

  // Security checks
  useEffect(() => {
    if (isAuthenticated) {
      // Check if we're in a secure context
      if (!securityUtils.isSecureContext()) {
        console.warn('Application is not running in a secure context. Authentication may not work properly.');
      }

      // Validate token format
      if (token && !securityUtils.isValidToken(token)) {
        console.warn('Invalid token format detected. Logging out for security.');
        dispatch(logout());
      }
    }
  }, [isAuthenticated, token, dispatch]);

  // Clear sensitive data on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any sensitive data that might be in memory
      securityUtils.clearSensitiveData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    isAuthenticated,
    user,
    token,
    isLoading: profileLoading,
    error: profileError,
  };
};

export default useSecureAuth;
