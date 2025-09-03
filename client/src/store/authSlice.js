import { createSlice, createSelector } from '@reduxjs/toolkit';
import { env } from '../config/env';
import { secureStorage, sessionStorage, securityUtils } from '../utils/secureStorage';

// Role-based permissions configuration
const ROLE_PERMISSIONS = {
  user: {
    canCreateTasks: true,
    canEditOwnTasks: true,
    canDeleteOwnTasks: true,
    canViewOrgTasks: false,
    canEditOrgTasks: false,
    canDeleteOrgTasks: false,
    canBulkUpdate: false,
    canManageUsers: false,
    canViewAnalytics: false,
  },
  manager: {
    canCreateTasks: true,
    canEditOwnTasks: true,
    canDeleteOwnTasks: true,
    canViewOrgTasks: true,
    canEditOrgTasks: true,
    canDeleteOrgTasks: false,
    canBulkUpdate: true,
    canManageUsers: false,
    canViewAnalytics: true,
  },
  admin: {
    canCreateTasks: true,
    canEditOwnTasks: true,
    canDeleteOwnTasks: true,
    canViewOrgTasks: true,
    canEditOrgTasks: true,
    canDeleteOrgTasks: true,
    canBulkUpdate: true,
    canManageUsers: true,
    canViewAnalytics: true,
  },
};

const initialState = {
  token: null, // Never store in localStorage
  refreshToken: null, // Never store in localStorage
  user: null, // Never store in localStorage - fetch from server
  isAuthenticated: false, // Determined by token presence
  permissions: null, // Calculated from user role
  lastActivity: sessionStorage.getItem('lastActivity') || null,
  sessionTimeout: env.SESSION_TIMEOUT,
  isSessionExpired: false,
  isRefreshing: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user;
      state.lastActivity = Date.now();
      state.isSessionExpired = false;
      state.isRefreshing = false;
      
      // Only store minimal session data - NO sensitive data in localStorage
      sessionStorage.setItem('lastActivity', state.lastActivity.toString());
    },
    
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.permissions = null;
      state.lastActivity = null;
      state.isSessionExpired = false;
      state.isRefreshing = false;
      
      // Clear all sensitive data
      securityUtils.clearSensitiveData();
      sessionStorage.clear();
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.permissions = ROLE_PERMISSIONS[state.user.role] || ROLE_PERMISSIONS.user;
      
      // NO localStorage storage - user data stays in memory only
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
      sessionStorage.setItem('lastActivity', state.lastActivity.toString());
    },
    
    setSessionExpired: (state, action) => {
      state.isSessionExpired = action.payload;
    },
    
    refreshToken: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.lastActivity = Date.now();
      state.isSessionExpired = false;
      state.isRefreshing = false;
      
      // NO localStorage storage - tokens stay in memory only
      sessionStorage.setItem('lastActivity', state.lastActivity.toString());
    },
    
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    
    clearSession: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.permissions = null;
      state.lastActivity = null;
      state.isSessionExpired = true;
      state.isRefreshing = false;
      
      // Clear all sensitive data
      securityUtils.clearSensitiveData();
      sessionStorage.clear();
    },
    
    // New action to set user data from server (no localStorage storage)
    setUserData: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user;
      // NO localStorage storage - user data stays in memory only
    },
  },
});

export const { 
  setCredentials, 
  logout, 
  updateUser, 
  updateLastActivity, 
  setSessionExpired,
  refreshToken,
  setRefreshing,
  clearSession,
  setUserData,
} = authSlice.actions;

// Selectors with memoization
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectIsSessionExpired = (state) => state.auth.isSessionExpired;
export const selectIsRefreshing = (state) => state.auth.isRefreshing;

// Role-based permission selectors
export const selectCanCreateTasks = createSelector(
  [selectUserPermissions],
  (permissions) => permissions?.canCreateTasks || false
);

export const selectCanEditTask = createSelector(
  [selectUserPermissions, selectCurrentUser, (state, task) => task],
  (permissions, user, task) => {
    if (!permissions) return false;
    
    // Users can always edit their own tasks
    if (task.createdBy === user?.id) {
      return permissions.canEditOwnTasks;
    }
    
    // Check organization task permissions
    if (task.scope === 'org') {
      return permissions.canEditOrgTasks;
    }
    
    return false;
  }
);

export const selectCanDeleteTask = createSelector(
  [selectUserPermissions, selectCurrentUser, (state, task) => task],
  (permissions, user, task) => {
    if (!permissions) return false;
    
    // Users can always delete their own tasks
    if (task.createdBy === user?.id) {
      return permissions.canDeleteOwnTasks;
    }
    
    // Check organization task permissions
    if (task.scope === 'org') {
      return permissions.canDeleteOrgTasks;
    }
    
    return false;
  }
);

export const selectCanViewOrgTasks = createSelector(
  [selectUserPermissions],
  (permissions) => permissions?.canViewOrgTasks || false
);

export const selectCanBulkUpdate = createSelector(
  [selectUserPermissions],
  (permissions) => permissions?.canBulkUpdate || false
);

export const selectCanManageUsers = createSelector(
  [selectUserPermissions],
  (permissions) => permissions?.canManageUsers || false
);

export const selectCanViewAnalytics = createSelector(
  [selectUserPermissions],
  (permissions) => permissions?.canViewAnalytics || false
);

// Session management selectors
export const selectSessionTimeRemaining = createSelector(
  [selectUserPermissions, (state) => state.auth.lastActivity, (state) => state.auth.sessionTimeout],
  (permissions, lastActivity, sessionTimeout) => {
    if (!lastActivity || !permissions) return 0;
    
    const elapsed = Date.now() - lastActivity;
    const remaining = sessionTimeout - elapsed;
    
    return Math.max(0, remaining);
  }
);

export const selectIsSessionExpiringSoon = createSelector(
  [selectSessionTimeRemaining],
  (timeRemaining) => timeRemaining < env.SESSION_WARNING_TIME
);

// User role selector
export const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role || 'user'
);

// User scope selector (for task filtering)
export const selectUserScope = createSelector(
  [selectCurrentUser, selectCanViewOrgTasks],
  (user, canViewOrg) => {
    if (!user) return 'my';
    if (canViewOrg && user.preferredScope === 'org') return 'org';
    return 'my';
  }
);

export default authSlice.reducer; 