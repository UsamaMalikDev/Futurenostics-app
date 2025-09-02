# Backend Setup Guide

This document outlines the required backend endpoints and configuration for the React frontend to work properly.

## Required Backend Endpoints

### Authentication Endpoints

#### 1. Login (`POST /auth/login`)
- **Purpose**: Authenticate user and return JWT tokens
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_access_token_here",
    "refresh_token": "jwt_refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "orgId": "organization_id",
      "permissions": ["canCreateTasks", "canEditOwnTasks"]
    }
  }
  ```

#### 2. Register (`POST /auth/register`)
- **Purpose**: Create new user account
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "user_id",
      "email": "newuser@example.com",
      "role": "user",
      "orgId": "organization_id"
    }
  }
  ```

#### 3. Refresh Token (`POST /auth/refresh`)
- **Purpose**: Get new access token using refresh token
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**:
  ```json
  {
    "access_token": "new_jwt_access_token_here",
    "refresh_token": "new_jwt_refresh_token_here"
  }
  ```

### Task Management Endpoints

#### 4. Get Tasks (`GET /api/tasks`)
- **Purpose**: Retrieve tasks with filtering, pagination, and sorting
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `scope`: "my" or "org"
  - `status`: task status filter
  - `priority`: priority filter
  - `tags`: comma-separated tags
  - `q`: search query
  - `cursor`: pagination cursor
  - `limit`: page size
  - `sortBy`: sort field
  - `sortOrder`: "asc" or "desc"
- **Response**:
  ```json
  {
    "tasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "description": "Task Description",
        "status": "pending",
        "priority": "medium",
        "tags": ["frontend", "react"],
        "assignedTo": "user_id",
        "createdBy": "user_id",
        "orgId": "organization_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "nextCursor": "next_cursor_value",
      "hasMore": true,
      "total": 100
    }
  }
  ```

#### 5. Create Task (`POST /api/tasks`)
- **Purpose**: Create new task
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "tags": ["frontend", "react"]
  }
  ```

#### 6. Update Task (`PATCH /api/tasks/:id`)
- **Purpose**: Update existing task
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: Partial task data

#### 7. Delete Task (`DELETE /api/tasks/:id`)
- **Purpose**: Delete task
- **Headers**: `Authorization: Bearer <access_token>`

#### 8. Bulk Update Tasks (`PATCH /api/tasks/bulk`)
- **Purpose**: Update multiple tasks at once
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "taskIds": ["id1", "id2"],
    "updates": {
      "status": "completed",
      "priority": "high"
    }
  }
  ```

### Health Check Endpoints

#### 9. Health Check (`GET /healthz`)
- **Purpose**: Check if backend is running
- **Response**: Health check status

#### 10. Readiness Check (`GET /readinessz`)
- **Purpose**: Check if backend is ready to serve requests
- **Response**: Readiness status

## Environment Configuration

### Frontend Environment Variables
Create a `.env` file in your frontend project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_AUTH_ENDPOINT=/auth
VITE_TASKS_ENDPOINT=/api/tasks
VITE_HEALTH_ENDPOINT=/healthz
VITE_READINESS_ENDPOINT=/readinessz
VITE_ENABLE_DEBUG_MODE=true
VITE_SESSION_TIMEOUT=3600000
VITE_SESSION_WARNING_TIME=300000
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100
VITE_CACHE_DURATION=300000
VITE_POLLING_INTERVAL=30000
```

## Authentication Flow

1. **Login**: User provides email/password → Backend validates → Returns JWT tokens
2. **Token Storage**: Frontend stores tokens in localStorage
3. **API Requests**: Frontend includes `Authorization: Bearer <token>` header
4. **Token Refresh**: When access token expires, use refresh token to get new one
5. **Logout**: Clear tokens and redirect to login

## CORS Configuration

Your backend must enable CORS for the frontend origin:

```typescript
// In your NestJS main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

## Testing the Integration

1. Start your NestJS backend on `localhost:3000`
2. Start the React frontend: `npm run dev`
3. Navigate to `/login` and test authentication
4. Test task management features
5. Verify error handling for various HTTP statuses

## Error Handling

The frontend expects these HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

## Role-Based Access Control

The frontend supports these user roles:
- **user**: Basic task management
- **manager**: Can view org tasks, bulk operations
- **admin**: Full access to all features

Each role has specific permissions that control UI elements and API access.
