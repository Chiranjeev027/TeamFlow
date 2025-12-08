# TeamFlow

A modern, real-time collaborative project management platform built with the MERN stack. TeamFlow enables teams to manage projects, track tasks, collaborate in real-time, and monitor team analytics.

![TeamFlow](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 🌐 Live Demo

**[Visit TeamFlow →](https://team-flow-sigma.vercel.app)**

## 🌟 Features

### Core Functionality
- **Project Management**: Create, organize, and manage multiple projects
- **Task Tracking**: Kanban-style board with drag-and-drop functionality
- **Team Collaboration**: Real-time user presence and online status tracking
- **Team Events**: Shared calendar for meetings, deadlines, and team events
- **Analytics Dashboard**: Comprehensive insights with completion rates, velocity metrics, and project health scores
- **User Settings**: Profile management, security settings, and data privacy controls

### Real-Time Features
- **Live Updates**: Socket.io-powered real-time task updates
- **Online Presence**: See who's currently working on projects
- **Typing Indicators**: Real-time typing indicators for collaborative editing
- **Activity Tracking**: Live activity feed for all project changes

### Security & Privacy
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for enhanced security
- **Session Management**: Active session tracking and management



## 🏗️ Architecture

TeamFlow follows a modern monorepo structure with separate frontend and backend applications:

```
TeamFlow/
├── backend/          # Node.js/Express REST API
├── frontend/         # React/TypeScript SPA
└── README.md         # This file
```

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **React Big Calendar** - Calendar component
- **Material-UI** - Component library
- **TailwindCSS** - Utility-first CSS

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **TypeScript** - Type-safe development
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **BCrypt** - Password hashing
- **Winston** - Logging
- **Helmet** - Security middleware

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd TeamFlow
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/teamflow?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

## 🎯 Quick Start

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend application will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📚 Documentation

For detailed documentation on each component:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
```

### Frontend Scripts
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
TeamFlow/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── socket/         # Socket.io handlers
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   ├── styles/         # Global styles
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔐 Authentication

TeamFlow uses JWT (JSON Web Tokens) for authentication:

1. **Register**: Create a new user account
2. **Login**: Receive JWT token
3. **Access**: Include token in Authorization header for protected routes
4. **Logout**: Client-side token removal

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks?projectId=<id>` - Get tasks by project
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Team Events
- `GET /api/team-events?projectId=<id>` - Get team events
- `POST /api/team-events` - Create team event
- `PUT /api/team-events/:id` - Update team event
- `DELETE /api/team-events/:id` - Delete team event

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Activities
- `GET /api/activities?projectId=<id>` - Get project activities

For complete API documentation, see [Backend README](./backend/README.md)

## 🎨 Key Features Explained

### Real-Time Collaboration
- Socket.io enables instant updates across all connected clients
- See who's online and working on the same project
- Live task movements and status changes
- Real-time typing indicators

### Analytics Dashboard
- **Completion Rate**: Track task completion over time
- **Team Velocity**: Measure tasks completed per sprint
- **Project Health**: Overall project status indicators
- **Custom Reports**: Export data for deeper analysis

### Security Features
- Password encryption using BCrypt
- JWT token-based authentication
- HTTP security headers via Helmet.js
- Rate limiting on API endpoints
- Request logging with Winston

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### TypeScript Compilation Errors
```bash
# Clean and rebuild
cd backend
rm -rf dist node_modules
npm install
npm run build
```


**Built with ❤️ using the MERN Stack**
