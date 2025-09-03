import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useBulkUpdateTasksMutation } from '../store/api';
import { logout, selectUserPermissions, selectCanViewOrgTasks, selectCanBulkUpdate } from '../store/authSlice';
import { useUrlParams } from '../utils/urlParams';
import { useSession } from '../hooks/useSession';
import { LogOut, Plus, Filter, Search, ChevronLeft, ChevronRight, MoreHorizontal, Edit3, Trash2, Check, X, Share2, Settings, Clock } from 'lucide-react';
import TaskFilters from '../components/TaskFilters';
import TaskRow from '../components/TaskRow';
import CreateTaskModal from '../components/CreateTaskModal';
import BulkActions from '../components/BulkActions';
import RoleGuard, { CanCreateTasks, CanBulkUpdate, CanViewOrgTasks } from '../components/RoleGuard';
import { LoadingSpinner, TableSkeleton, ErrorState, EmptyState } from '../components/LoadingStates';
import ErrorBoundary from '../components/ErrorBoundary';
import HealthStatus from '../components/HealthStatus';

const TasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getParam, setParam, setMultipleParams, getActiveFilters, buildShareableUrl } = useUrlParams();
  const { sessionTimeRemaining, isSessionExpiringSoon } = useSession();
  
  // User permissions
  const permissions = useSelector(selectUserPermissions);
  const canViewOrgTasks = useSelector(selectCanViewOrgTasks);
  const canBulkUpdate = useSelector(selectCanBulkUpdate);
  
  // URL params
  const scope = getParam('scope', 'my');
  const status = getParam('status', '');
  const tags = getParam('tags', '');
  const priority = getParam('priority', '');
  const q = getParam('q', '');
  const page = getParam('page', '1');
  const limit = getParam('limit', '5');
  const sortBy = getParam('sortBy', 'createdAt');
  const sortOrder = getParam('sortOrder', 'desc');
  
  // Local state
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // API queries with enhanced error handling
  const { 
    data: tasksData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    isError 
  } = useGetTasksQuery({
    scope: canViewOrgTasks ? scope : 'my', // Force 'my' scope if user can't view org tasks
    status,
    tags,
    priority,
    q,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  }, {
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Polling for real-time updates (every 30 seconds)
    pollingInterval: 30000,
  });

  // Debug logging
  console.log('Tasks query result:', { tasksData, isLoading, error, isError });
  
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [bulkUpdateTasks, { isLoading: isBulkUpdating }] = useBulkUpdateTasksMutation();
  
  // Session management
  useEffect(() => {
    if (isSessionExpiringSoon) {
      // Show session expiry warning
      const warning = document.createElement('div');
      warning.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
      warning.innerHTML = `
        <div class="flex items-center gap-2">
          <Clock class="h-4 w-4" />
          <span>Your session will expire in ${Math.floor(sessionTimeRemaining / 60000)} minutes</span>
        </div>
      `;
      document.body.appendChild(warning);
      
      setTimeout(() => {
        document.body.removeChild(warning);
      }, 10000);
    }
  }, [isSessionExpiringSoon, sessionTimeRemaining]);
  
  // Auto-scope adjustment based on permissions
  useEffect(() => {
    if (!canViewOrgTasks && scope === 'org') {
      setParam('scope', 'my');
    }
  }, [canViewOrgTasks, scope, setParam]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleScopeChange = (newScope) => {
    if (newScope === 'org' && !canViewOrgTasks) {
      return; // Prevent unauthorized scope change
    }
    
    setMultipleParams({
      scope: newScope,
      page: '1', // Reset to first page when changing scope
    });
  };
  
  const handleFilterChange = (filters) => {
    setMultipleParams({
      ...filters,
      page: '1', // Reset to first page when filters change
    });
  };
  
  const handleSearch = (searchTerm) => {
    console.log('Search term:', searchTerm);
    setParam('q', searchTerm);
    setParam('page', '1'); // Reset to first page when searching
  };
  
  const handlePagination = (direction) => {
    const currentPage = parseInt(page);
    if (direction === 'next' && tasksData?.hasNext) {
      setParam('page', (currentPage + 1).toString());
    } else if (direction === 'prev' && tasksData?.hasPrev) {
      setParam('page', (currentPage - 1).toString());
    }
  };
  
  const handlePageChange = (newPage) => {
    setParam('page', newPage.toString());
  };
  
  const handleTaskSelect = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };
  
  const handleSelectAll = () => {
    if (selectedTasks.size === tasksData?.tasks?.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasksData?.tasks?.map(task => task.id) || []));
    }
  };
  
  const handleBulkUpdate = async (updates) => {
    try {
      await bulkUpdateTasks({
        ids: Array.from(selectedTasks),
        updates,
      }).unwrap();
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };
  
  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      const result = await createTask(taskData).unwrap();
      console.log('Task created successfully:', result);
      setShowCreateModal(false);
      
      // Force refetch the tasks to ensure new task appears
      await refetch();
      
      // Show success message
      console.log('Task created successfully');
    } catch (error) {
      console.error('Create task failed:', error);
      // You could add a toast notification here
      alert('Failed to create task. Please try again.');
    }
  };
  
  const handleUpdateTask = async (taskId, updates) => {
    try {
      console.log('Updating task:', taskId, updates);
      const result = await updateTask({ id: taskId, ...updates }).unwrap();
      console.log('Task updated successfully:', result);
      setEditingTask(null);
      
      // Force refetch the tasks to ensure updated task appears
      await refetch();
    } catch (error) {
      console.error('Update task failed:', error);
      alert('Failed to update task. Please try again.');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('Deleting task:', taskId);
        const result = await deleteTask(taskId).unwrap();
        console.log('Task deleted successfully:', result);
        
        // Force refetch the tasks to ensure deleted task is removed
        await refetch();
      } catch (error) {
        console.error('Delete task failed:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };
  
  const handleShareFilters = () => {
    const url = buildShareableUrl();
    setShareUrl(url);
    setShowShareModal(true);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Show success message
    });
  };
  
  // Error handling with role-based fallbacks
  if (error) {
    if (error.status === 401 || error.status === 403) {
      dispatch(logout());
      navigate('/login');
      return null;
    }
    
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }
  
  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header with session info */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                <HealthStatus />
              </div>
              
              <div className="flex items-center gap-4">
                {/* Session timer */}
                {isSessionExpiringSoon && (
                  <div className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    Session expires in {Math.floor(sessionTimeRemaining / 60000)}m
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Scope Toggle with role-based restrictions */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Task Scope</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleScopeChange('my')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      scope === 'my'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Tasks
                  </button>
                  
                  <CanViewOrgTasks>
                    <button
                      onClick={() => handleScopeChange('org')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        scope === 'org'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Organization Tasks
                    </button>
                  </CanViewOrgTasks>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters and Search */}
          <TaskFilters
            filters={{ status, tags, priority, q }}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
          
          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {activeFilters.map(filter => (
                <span key={filter} className="bg-gray-200 px-2 py-1 rounded">
                  {filter}
                </span>
              ))}
              <button
                onClick={() => setMultipleParams({})}
                className="text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            </div>
          )}
          
          {/* Bulk Actions with role-based visibility */}
          {selectedTasks.size > 0 && (
            <CanBulkUpdate>
              <BulkActions
                selectedCount={selectedTasks.size}
                onBulkUpdate={handleBulkUpdate}
                onClearSelection={() => setSelectedTasks(new Set())}
              />
            </CanBulkUpdate>
          )}
          
          {/* Tasks Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Tasks ({tasksData?.total || 0})
                </h3>
                
                <div className="flex items-center gap-3">
                  {/* Share filters button */}
                  {hasActiveFilters && (
                    <button
                      onClick={handleShareFilters}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Filters
                    </button>
                  )}
                  
                  {/* Create task button with role-based visibility */}
                  <CanCreateTasks>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Task
                    </button>
                  </CanCreateTasks>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : tasksData?.tasks?.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No tasks found"
                description={
                  q 
                    ? `No tasks match "${q}"` 
                    : 'Get started by creating your first task'
                }
                action={
                  !q && (
                    <CanCreateTasks>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                      >
                        Create Task
                      </button>
                    </CanCreateTasks>
                  )
                }
              />
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTasks.size === tasksData?.tasks?.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasksData?.tasks?.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isSelected={selectedTasks.has(task.id)}
                        onSelect={() => handleTaskSelect(task.id)}
                        onEdit={() => setEditingTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                        isEditing={editingTask?.id === task.id}
                        permissions={permissions}
                      />
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {tasksData?.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((parseInt(page) - 1) * parseInt(limit)) + 1} to {Math.min(parseInt(page) * parseInt(limit), tasksData?.total || 0)} of {tasksData?.total || 0} tasks
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePagination('prev')}
                          disabled={!tasksData?.hasPrev}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, tasksData?.totalPages || 0) }, (_, i) => {
                            const startPage = Math.max(1, parseInt(page) - 2);
                            const pageNum = startPage + i;
                            if (pageNum > tasksData?.totalPages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                  pageNum === parseInt(page)
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePagination('next')}
                          disabled={!tasksData?.hasNext}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTask}
            isLoading={isCreating}
          />
        )}
        
        {/* Share Filters Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Filters</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable URL
                </label>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input bg-gray-50"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TasksPage; 