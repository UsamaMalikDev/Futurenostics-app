import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  updateLastActivity, 
  setSessionExpired, 
  logout,
  selectSessionTimeRemaining,
  selectIsSessionExpiringSoon,
  selectIsSessionExpired,
} from '../store/authSlice';

export const useSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  
  const sessionTimeRemaining = useSelector(selectSessionTimeRemaining);
  const isSessionExpiringSoon = useSelector(selectIsSessionExpiringSoon);
  const isSessionExpired = useSelector(selectIsSessionExpired);
  
  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    dispatch(updateLastActivity());
  }, [dispatch]);
  
  // Extend session
  const extendSession = useCallback(() => {
    dispatch(updateLastActivity());
  }, [dispatch]);
  
  // Logout user
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);
  
  // Force logout
  const forceLogout = useCallback(() => {
    dispatch(setSessionExpired(true));
    setTimeout(() => {
      dispatch(logout());
      navigate('/login');
    }, 1000);
  }, [dispatch, navigate]);
  
  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);
  
  // Set up session timeout
  useEffect(() => {
    if (sessionTimeRemaining <= 0) {
      forceLogout();
      return;
    }
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Set warning timeout (5 minutes before expiry)
    if (sessionTimeRemaining > 5 * 60 * 1000) {
      warningTimeoutRef.current = setTimeout(() => {
        // Show warning notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Session Expiring Soon', {
            body: 'Your session will expire in 5 minutes. Click to extend.',
            icon: '/favicon.ico',
          });
        }
      }, sessionTimeRemaining - 5 * 60 * 1000);
    }
    
    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      forceLogout();
    }, sessionTimeRemaining);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [sessionTimeRemaining, forceLogout]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    sessionTimeRemaining,
    isSessionExpiringSoon,
    isSessionExpired,
    updateActivity,
    extendSession,
    logout: handleLogout,
    forceLogout,
  };
}; 