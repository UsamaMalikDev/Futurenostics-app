# React Task Management App

A modern, feature-rich task management application built with React, Redux Toolkit, and RTK Query. Features include role-based access control, real-time data fetching, and a responsive design.

## Features

### Authentication & Authorization
- **Login/Logout**: Secure JWT-based authentication
- **Sign Up**: User registration with email, password, and role selection
- **Role-Based Access Control**: User, Manager, and Admin roles with granular permissions
- **Session Management**: Automatic session timeout and refresh token handling

### Task Management
- **Scope Toggle**: Switch between personal tasks and organization-wide view
- **Advanced Filtering**: Filter by status, priority, tags, and search queries
- **Cursor Pagination**: Efficient pagination for large datasets
- **Inline CRUD**: Create, read, update, and delete tasks directly in the interface
- **Bulk Operations**: Update multiple tasks simultaneously (managers and admins)

### User Experience
- **URL-Driven Filters**: All filters and search parameters are stored in the URL for shareable links
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Loading States**: Comprehensive loading indicators and skeletons
- **Error Handling**: Robust error handling for network issues, authentication, and server errors
- **Real-time Status**: Backend health monitoring and network status indicators

### Technical Features
- **State Management**: Redux Toolkit with RTK Query for efficient data fetching
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **Retry Logic**: Exponential backoff for failed requests
- **Caching**: Intelligent cache management with automatic invalidation
- **Type Safety**: Full TypeScript support (optional)

## Tech Stack

- **Frontend Framework**: React 19 with Vite
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Build Tool**: Vite with PostCSS and Autoprefixer

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see Backend Setup section)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your backend configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── RoleGuard.jsx   # Role-based access control
│   ├── ErrorBoundary.jsx # Global error handling
│   ├── LoadingStates.jsx # Loading and skeleton components
│   └── ...
├── pages/              # Page components
│   ├── LoginPage.jsx   # Authentication page
│   ├── SignUpPage.jsx  # User registration page
│   └── TasksPage.jsx   # Main task management page
├── store/              # Redux store and slices
│   ├── api.js         # RTK Query API configuration
│   ├── authSlice.js   # Authentication state management
│   └── index.js       # Store configuration
├── hooks/              # Custom React hooks
│   ├── useSession.js  # Session management
│   └── useUrlParams.js # URL parameter management
├── utils/              # Utility functions
├── config/             # Configuration files
└── assets/             # Static assets
```

## Backend Integration

This frontend is designed to work with a NestJS backend. See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed backend requirements and configuration.

### Required Backend Endpoints

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/refresh`
- **Tasks**: `/api/tasks` (GET, POST, PATCH, DELETE, bulk operations)
- **Health Checks**: `/healthz`, `/readinessz`

### Environment Variables

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

## Usage

### Authentication

1. **Sign Up**: Navigate to `/signup` to create a new account
   - Choose your role (User, Manager, or Admin)
   - Provide email and password
   - Confirm your password

2. **Login**: Use your credentials to sign in at `/login`
   - JWT tokens are automatically managed
   - Session timeout warnings are displayed

3. **Role-Based Access**: Different features are available based on your role:
   - **User**: Manage personal tasks
   - **Manager**: View organization tasks, bulk operations
   - **Admin**: Full access to all features

### Task Management

1. **Viewing Tasks**: 
   - Toggle between "My Tasks" and "Organization Tasks"
   - Use filters to narrow down results
   - Search across task titles and descriptions

2. **Creating Tasks**:
   - Click "Create Task" button
   - Fill in title, description, status, priority, and tags
   - Submit to create the task

3. **Editing Tasks**:
   - Click the edit button on any task
   - Modify fields inline
   - Save changes

4. **Bulk Operations**:
   - Select multiple tasks using checkboxes
   - Choose bulk actions (update status, priority, tags)
   - Apply changes to all selected tasks

### URL Management

- All filters, search terms, and pagination are stored in the URL
- Share URLs to show specific filtered views
- Browser back/forward navigation works with filters
- Filters persist across page refreshes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- ESLint configuration for code quality
- Prettier for consistent formatting
- TypeScript support (optional)
- Component-based architecture
- Custom hooks for reusable logic

### State Management

- **Redux Toolkit**: Centralized state management
- **RTK Query**: Automatic data fetching, caching, and synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error management
- **Cache Invalidation**: Automatic cache updates

## Troubleshooting

### Common Issues

1. **Tailwind CSS not working**: Ensure PostCSS and Tailwind are properly configured
2. **API connection errors**: Check backend URL and CORS configuration
3. **Authentication issues**: Verify JWT token format and expiration
4. **Build errors**: Check Node.js version compatibility

### Debug Mode

Enable debug logging by setting `VITE_ENABLE_DEBUG_MODE=true` in your `.env` file. This will log:
- API requests and responses
- State changes
- Cache operations
- Error details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
