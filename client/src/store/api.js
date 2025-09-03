import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env, apiEndpoints, debugLog } from '../config/env';

// Enhanced error handling with retry logic
const createRetryableBaseQuery = (baseQueryFn, maxRetries = 3) => {
  return async (args, api, extraOptions) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await baseQueryFn(args, api, extraOptions);
        
        // Handle successful responses
        if (result.data) {
          return result;
        }
        
        // Handle errors with retry logic
        if (result.error) {
          const { status } = result.error;
          
          // Don't retry on client errors (4xx) except 429
          if (status >= 400 && status < 500 && status !== 429) {
            return result;
          }
          
          // Don't retry on 401/403 (authentication/authorization)
          if (status === 401 || status === 403) {
            return result;
          }
          
          // Retry on server errors (5xx) and rate limiting (429)
          if (i < maxRetries && (status >= 500 || status === 429)) {
            lastError = result.error;
            
            // Exponential backoff for retries
            const delay = Math.min(1000 * Math.pow(2, i), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          return result;
        }
        
        return result;
      } catch (error) {
        lastError = { status: 'FETCH_ERROR', error: error.message };
        
        // Retry on network errors
        if (i < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
    
    return { error: lastError };
  };
};

// Real API base query
const realBaseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Add request ID for tracking
    headers.set('x-request-id', crypto.randomUUID());
    
    // Add user agent
    headers.set('user-agent', navigator.userAgent);
    
    // Add content type for non-GET requests
    if (headers.get('content-type') === null && headers.get('content-type') !== 'multipart/form-data') {
      headers.set('content-type', 'application/json');
    }
    
    return headers;
  },
  // Add timeout from environment
  timeout: env.API_TIMEOUT,
});

// Create API with retry logic
export const api = createApi({
  reducerPath: 'api',
  baseQuery: createRetryableBaseQuery(realBaseQuery, 3),
  tagTypes: ['Task', 'User'],
  
  // Global error handling
  keepUnusedDataFor: env.CACHE_DURATION / 1000, // Convert to seconds
  
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation({
      query: (credentials) => ({
        url: apiEndpoints.login,
        method: 'POST',
        body: credentials,
      }),
      // Invalidate user data on login
      invalidatesTags: ['User'],
      // Transform response to match our expected format
      transformResponse: (response) => ({
        token: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        loginTime: new Date().toISOString(),
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: apiEndpoints.register,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Token refresh
    refreshToken: builder.mutation({
      query: () => ({
        url: apiEndpoints.refresh,
        method: 'POST',
      }),
      // Update auth state on successful refresh
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update token in auth slice
          dispatch({ 
            type: 'auth/refreshToken', 
            payload: {
              token: data.access_token,
              refreshToken: data.refresh_token,
            }
          });
        } catch (error) {
          // Handle refresh failure
          console.error('Token refresh failed:', error);
        }
      },
    }),
    
    // User profile
    getUserProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
      // Cache user profile for longer
      keepUnusedDataFor: 3600, // 1 hour
    }),
    
    // Tasks
    getTasks: builder.query({
      query: (params) => {
        // Clean up parameters - remove empty strings and undefined values
        const cleanParams = {};
        
        if (params.scope) cleanParams.scope = params.scope;
        if (params.status && params.status !== '') cleanParams.status = params.status;
        if (params.priority && params.priority !== '') cleanParams.priority = params.priority;
        if (params.tags && params.tags.length > 0) {
          // Ensure tags is sent as comma-separated string for query parameters
          cleanParams.tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
        }
        if (params.q && params.q.trim() !== '') cleanParams.q = params.q.trim();
        if (params.page) cleanParams.page = params.page;
        if (params.sortBy) cleanParams.sortBy = params.sortBy;
        if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
        
        // Always include limit
        cleanParams.limit = Math.min(params.limit || env.DEFAULT_PAGE_SIZE, env.MAX_PAGE_SIZE);
        
        return {
          url: apiEndpoints.tasks,
          params: cleanParams,
        };
      },
      providesTags: (result, error, arg) => 
        result?.tasks 
          ? [
              ...result.tasks.map(({ id }) => ({ type: 'Task', id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
      
      // Transform response for better caching
      transformResponse: (response) => ({
        ...response,
        tasks: response.tasks.map(task => ({
          ...task,
          // Normalize dates
          createdAt: new Date(task.createdAt).toISOString(),
          updatedAt: new Date(task.updatedAt).toISOString(),
        })),
        fetchedAt: new Date().toISOString(),
      }),
      
      // Optimistic updates
      async onQueryStarted({ scope, ...params }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Handle query errors
          debugLog('Tasks query failed:', error);
        }
      },
    }),
    
    createTask: builder.mutation({
      query: (task) => ({
        url: apiEndpoints.tasks,
        method: 'POST',
        body: task,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      
      // Force refetch of all task queries after successful creation
      async onQueryStarted(task, { dispatch, queryFulfilled, getState }) {
        try {
          const result = await queryFulfilled;
          console.log('Task created successfully:', result.data);
          
          // Invalidate all task queries to ensure fresh data
          dispatch(api.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
          dispatch(api.util.invalidateTags(['Task']));
          
          // Force refetch the current tasks query
          const state = getState();
          const currentQuery = state.api.queries;
          Object.keys(currentQuery).forEach(queryKey => {
            if (queryKey.startsWith('getTasks')) {
              dispatch(api.util.refetchTags(['Task']));
            }
          });
          
        } catch (error) {
          console.error('Create task failed:', error);
        }
      },
    }),
    
    updateTask: builder.mutation({
      query: ({ id, ...task }) => ({
        url: apiEndpoints.task(id),
        method: 'PATCH',
        body: task,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
      
      // Force refetch after successful update
      async onQueryStarted({ id, ...updates }, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Task updated successfully:', result.data);
          
          // Invalidate all task queries to ensure fresh data
          dispatch(api.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
          dispatch(api.util.invalidateTags(['Task']));
          
        } catch (error) {
          console.error('Update task failed:', error);
        }
      },
    }),
    
    deleteTask: builder.mutation({
      query: (id) => ({
        url: apiEndpoints.task(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
      
      // Force refetch after successful deletion
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Task deleted successfully:', result);
          
          // Invalidate all task queries to ensure fresh data
          dispatch(api.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
          dispatch(api.util.invalidateTags(['Task']));
          
        } catch (error) {
          console.error('Delete task failed:', error);
        }
      },
    }),
    
    bulkUpdateTasks: builder.mutation({
      query: ({ ids, updates }) => ({
        url: apiEndpoints.bulkUpdate,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
    
    // Health check
    healthCheck: builder.query({
      query: () => apiEndpoints.health,
      keepUnusedDataFor: 60, // 1 minute
    }),
    
    // Readiness check
    readinessCheck: builder.query({
      query: () => apiEndpoints.readiness,
      keepUnusedDataFor: 60, // 1 minute
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetUserProfileQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkUpdateTasksMutation,
  useHealthCheckQuery,
  useReadinessCheckQuery,
} = api; 