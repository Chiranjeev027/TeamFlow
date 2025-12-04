# TeamFlow Frontend

The frontend application for TeamFlow, built with React, TypeScript, and Vite. A modern, responsive single-page application (SPA) for collaborative project management.

## 🚀 Tech Stack

- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time bidirectional communication
- **TailwindCSS** - Utility-first CSS framework
- **Material-UI (MUI)** - Comprehensive component library
- **Recharts** - Composable charting library
- **React Big Calendar** - Full-featured calendar component
- **date-fns** - Modern date utility library
- **React Icons** - Popular icon library
- **DOMPurify** - XSS sanitization
- **Marked** - Markdown parser

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running (see [Backend README](../backend/README.md))

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# API Base URL
VITE_API_URL=http://localhost:5000

# Optional: Enable development tools
VITE_DEV_MODE=true
```

## 🎯 Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Production Build
```bash
npm run build
```

Build output will be in the `dist/` directory

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── settings/    # Settings page components
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── DataPrivacySettings.tsx
│   │   │   └── types.ts
│   │   ├── ActivityFeed.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── Header.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── Navbar.tsx
│   │   ├── OnlineUsers.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   └── TeamMembersPanel.tsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useSocket.ts
│   ├── pages/           # Page components
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ProjectPage.tsx
│   │   ├── Settings.tsx
│   │   └── TeamsPage.tsx
│   ├── styles/          # Global styles
│   │   ├── animations.css
│   │   └── calendar.css
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Root component
│   ├── AppRoutes.tsx    # Route configuration
│   ├── main.tsx         # Application entry point
│   ├── App.css          # App-level styles
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── README.md
```

## 🎨 Key Features

### 1. **Dashboard**
- Overview of all projects
- Quick access to recent tasks
- Activity feed
- Create new projects

### 2. **Project Management**
- Kanban board with drag-and-drop
- Task status columns (Todo, In Progress, Review, Done)
- Real-time task updates
- Team member management
- Online presence indicators

### 3. **Task Management**
- Create, edit, and delete tasks
- Assign tasks to team members
- Set priorities (Low, Medium, High)
- Due date tracking
- Status updates with real-time sync

### 4. **Team Collaboration**
- See who's online in real-time
- Team members panel
- Activity feed for project changes
- Typing indicators (planned feature)

### 5. **Calendar**
- Monthly calendar view
- Team events and deadlines
- Create, edit, and delete events
- Event types: meetings, deadlines, milestones
- Drag-and-drop event scheduling

### 6. **Analytics Dashboard**
- **Completion Rate Trends**: Track task completion over time
- **Task Distribution**: Visual breakdown by status
- **Team Velocity**: Tasks completed per time period
- **Project Health Score**: Overall project status
- **Sprint Burn-down**: Progress tracking
- **Export Reports**: Download analytics data

### 7. **User Settings**
- **Profile Management**: Update name and avatar
- **Security Settings**: Change password, view active sessions
- **Data Privacy**: Export data, delete account
- **Preferences**: Theme and notification settings

### 8. **Real-Time Features**
- Live online user presence
- Instant task updates across clients
- Real-time activity notifications
- WebSocket-based communication

## 🔌 API Integration

### Authentication Context
The `AuthContext` manages user authentication state:

```typescript
const { user, login, logout, register } = useAuth();
```

### Socket Context
The `SocketContext` handles real-time connections:

```typescript
const socket = useSocket();

// Join a project
socket.emit('user-joined', { projectId, user });

// Listen for online users
socket.on('online-users', (users) => {
  setOnlineUsers(users);
});
```

### API Client Setup
Axios instance configured with:
- Base URL from environment variables
- Automatic token injection
- Error handling
- Request/response interceptors

## 🎨 Styling

### TailwindCSS Configuration
Custom theme configuration with:
- Extended color palette
- Custom animations
- Responsive breakpoints
- Dark mode support (planned)

### Component Styling Approach
1. **TailwindCSS**: Utility classes for rapid development
2. **Material-UI**: Pre-built components with theming
3. **Custom CSS**: For complex animations and layouts

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible layouts with CSS Grid and Flexbox

## 🔐 Authentication Flow

### Registration
```typescript
const handleRegister = async (name, email, password) => {
  const response = await axios.post('/api/auth/register', {
    name, email, password
  });
  localStorage.setItem('token', response.data.token);
  setUser(response.data.user);
};
```

### Login
```typescript
const handleLogin = async (email, password) => {
  const response = await axios.post('/api/auth/login', {
    email, password
  });
  localStorage.setItem('token', response.data.token);
  setUser(response.data.user);
};
```

### Protected Routes
```typescript
<Route
  path="/dashboard"
  element={user ? <Dashboard /> : <Navigate to="/auth" />}
/>
```

## 🗺️ Routing Structure

```
/ (root)
├── /auth                 # Login/Register page
├── /dashboard            # Main dashboard
│   ├── /projects/:id     # Project detail view
│   ├── /analytics        # Analytics dashboard
│   ├── /calendar         # Team calendar
│   ├── /teams            # Team management
│   └── /settings         # User settings
```

## 📦 State Management

### Context API Usage
- **AuthContext**: User authentication and authorization
- **SocketContext**: WebSocket connection management

### Local State
- Component-level state with `useState`
- Side effects with `useEffect`
- Custom hooks for reusable logic

### Data Fetching Pattern
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
}, [dependencies]);
```

## 🎭 Component Examples

### Creating a Task
```typescript
const createTask = async (taskData) => {
  const response = await axios.post('/api/tasks', {
    ...taskData,
    projectId: currentProject._id
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  setTasks([...tasks, response.data]);
};
```

### Real-Time Updates
```typescript
useEffect(() => {
  socket.on('task-activity', (activity) => {
    if (activity.type === 'task_moved') {
      // Update local task state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === activity.taskId 
            ? { ...task, status: activity.toStatus }
            : task
        )
      );
    }
  });

  return () => socket.off('task-activity');
}, [socket]);
```

## 🎨 Custom Hooks

### useSocket
```typescript
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
```

## 📊 Analytics Implementation

The Analytics Dashboard uses Recharts for data visualization:
- **Area Chart**: Completion rate trends
- **Pie Chart**: Task distribution by status
- **Bar Chart**: Team velocity and throughput

## 📅 Calendar Integration

React Big Calendar with custom styling:
- Monthly view with events
- Event creation and editing
- Color-coded event types
- Responsive design

## ⚙️ Configuration Files

### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
```

### TypeScript Config
- `tsconfig.json`: Base configuration
- `tsconfig.app.json`: App-specific settings
- `tsconfig.node.json`: Node/Vite configuration

### Tailwind Config
Custom theme with extended colors, animations, and utilities

## 🐛 Troubleshooting

### Common Issues

#### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → TypeScript: Restart TS Server
```

#### Cannot Connect to Backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors


### Environment Variables for Production
Set in your hosting platform:
```
VITE_API_URL=https://your-backend-api.com
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🎯 Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Implement proper error handling
- Follow React hooks best practices

### Performance Optimization
- Lazy load routes with `React.lazy()`
- Memoize expensive calculations with `useMemo`
- Prevent unnecessary re-renders with `React.memo`
- Optimize images and assets

### Security
- Sanitize user inputs with DOMPurify
- Store tokens securely in localStorage
- Implement proper authentication checks
- Validate data on both client and server

**Frontend built with React, TypeScript, and Vite**
