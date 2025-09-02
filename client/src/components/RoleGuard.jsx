import { useSelector } from 'react-redux';
import { selectUserPermissions, selectUserRole } from '../store/authSlice';

const RoleGuard = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null, 
  fallback = null,
  showForRoles = null,
  hideForRoles = null,
}) => {
  const permissions = useSelector(selectUserPermissions);
  const userRole = useSelector(selectUserRole);
  
  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.every(permission => 
    permissions?.[permission] === true
  );
  
  // Check if user has required role
  const hasRequiredRole = !requiredRole || userRole === requiredRole;
  
  // Check if user's role is in showForRoles
  const shouldShowForRole = !showForRoles || showForRoles.includes(userRole);
  
  // Check if user's role is in hideForRoles
  const shouldHideForRole = hideForRoles && hideForRoles.includes(userRole);
  
  // Determine if component should render
  const shouldRender = hasRequiredPermissions && 
                      hasRequiredRole && 
                      shouldShowForRole && 
                      !shouldHideForRole;
  
  if (!shouldRender) {
    return fallback;
  }
  
  return children;
};

// Convenience components for common permission checks
export const CanCreateTasks = ({ children, fallback = null }) => (
  <RoleGuard requiredPermissions={['canCreateTasks']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanEditTask = ({ children, fallback = null, task }) => {
  const permissions = useSelector(selectUserPermissions);
  const canEdit = useSelector(state => {
    if (!permissions) return false;
    
    // Users can always edit their own tasks
    if (task.createdBy === state.auth.user?.id) {
      return permissions.canEditOwnTasks;
    }
    
    // Check organization task permissions
    if (task.scope === 'org') {
      return permissions.canEditOrgTasks;
    }
    
    return false;
  });
  
  return canEdit ? children : fallback;
};

export const CanDeleteTask = ({ children, fallback = null, task }) => {
  const permissions = useSelector(selectUserPermissions);
  const canDelete = useSelector(state => {
    if (!permissions) return false;
    
    // Users can always delete their own tasks
    if (task.createdBy === state.auth.user?.id) {
      return permissions.canDeleteOwnTasks;
    }
    
    // Check organization task permissions
    if (task.scope === 'org') {
      return permissions.canDeleteOrgTasks;
    }
    
    return false;
  });
  
  return canDelete ? children : fallback;
};

export const CanViewOrgTasks = ({ children, fallback = null }) => (
  <RoleGuard requiredPermissions={['canViewOrgTasks']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanBulkUpdate = ({ children, fallback = null }) => (
  <RoleGuard requiredPermissions={['canBulkUpdate']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanManageUsers = ({ children, fallback = null }) => (
  <RoleGuard requiredPermissions={['canManageUsers']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanViewAnalytics = ({ children, fallback = null }) => (
  <RoleGuard requiredPermissions={['canViewAnalytics']} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Role-based components
export const ForManagers = ({ children, fallback = null }) => (
  <RoleGuard showForRoles={['manager', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ForAdmins = ({ children, fallback = null }) => (
  <RoleGuard showForRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ForUsers = ({ children, fallback = null }) => (
  <RoleGuard showForRoles={['user', 'manager', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export default RoleGuard; 