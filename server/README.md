<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Task Management API

A robust NestJS-based task management system with MongoDB, JWT authentication, RBAC, background jobs, caching, and observability.

## Features

- **User Management**: User CRUD with role-based access control
- **Task Management**: Full CRUD operations with filtering, search, and pagination
- **Authentication**: JWT with access and refresh tokens
- **RBAC**: User, Manager, and Admin roles with different permissions
- **Background Jobs**: Automated overdue task flagging every minute
- **Caching**: Read-through cache with org-based invalidation
- **Observability**: Structured logging, request timing, health checks
- **MongoDB**: Optimized with proper indexes for performance

## Architecture

### Models

- **User**: `{ email, passwordHash, roles, orgId, isActive, timestamps }`
- **Task**: `{ orgId, ownerId, title, status, tags, dueDate, priority, isOverdue, timestamps }`

### RBAC Permissions

- **User**: CRUD own tasks only
- **Manager**: CRUD org tasks, bulk operations
- **Admin**: CRUD across all orgs

### API Endpoints

- `GET /api/tasks` - List tasks with cursor pagination, filters, and search
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update specific task
- `PATCH /api/tasks/bulk` - Bulk update tasks (Manager+ only)

### Background Jobs

- **Overdue Task Checker**: Runs every minute to flag overdue tasks

### Caching Strategy

- Read-through cache for GET /api/tasks
- Org-based cache invalidation on writes
- Configurable TTL and max items

## Prerequisites

- Node.js 18+
- MongoDB 5+
- Redis (optional, for production caching)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_ACCESS_TOKEN_EXPIRES_IN=15m
   JWT_REFRESH_TOKEN_EXPIRES_IN=7d
   
   # Redis (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # App
   PORT=3000
   NODE_ENV=development
   ```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Database Setup

The application will automatically create the necessary collections and indexes on first run. Key indexes include:

- User: `email`, `orgId`, `orgId + roles`
- Task: `orgId`, `ownerId`, `status`, `priority`, `dueDate`, `isOverdue`
- Text search: `title`, `tags`
- Compound indexes for query optimization

## API Usage Examples

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use returned access token in subsequent requests
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/api/tasks
```

### Task Operations

```bash
# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete project", "priority": "high", "dueDate": "2024-12-31"}'

# List tasks with filters
curl "http://localhost:3000/api/tasks?status=todo&priority=high&limit=10" \
  -H "Authorization: Bearer <token>"

# Update task
curl -X PATCH http://localhost:3000/api/tasks/<task_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# Bulk update (Manager+ only)
curl -X PATCH http://localhost:3000/api/tasks/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tasks": [{"id": "<task_id>", "updates": {"priority": "urgent"}}]}'
```

## Health Checks

- `GET /healthz` - Health check endpoint
- `GET /readinessz` - Readiness check endpoint

## Monitoring

The application includes comprehensive logging:

- Structured JSON logs
- Request/response timing
- User context (ID, org, roles)
- Error tracking with stack traces
- Performance metrics

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Performance Features

- **Database Indexes**: Optimized for common query patterns
- **Cursor Pagination**: Efficient for large datasets
- **Caching**: Reduces database load for read operations
- **Background Jobs**: Non-blocking task processing
- **Rate Limiting**: Prevents API abuse

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Comprehensive DTO validation
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Configurable cross-origin access

## Production Considerations

1. **Environment Variables**: Use strong JWT secrets
2. **Database**: Use MongoDB Atlas or managed MongoDB service
3. **Caching**: Configure Redis for production caching
4. **Monitoring**: Integrate with APM tools
5. **Logging**: Use structured logging aggregation
6. **Security**: Enable HTTPS, configure CORS properly

## Contributing

1. Follow NestJS best practices
2. Add tests for new features
3. Update documentation
4. Follow the existing code style

## License

This project is licensed under the MIT License.
