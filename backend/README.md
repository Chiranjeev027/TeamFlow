# TeamFlow Backend

The backend API server for TeamFlow, built with Node.js, Express, MongoDB, and Socket.io. Provides RESTful APIs and real-time communication for the TeamFlow project management platform.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express 5** - Fast, minimalist web framework
- **TypeScript** - Typed superset of JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional event-based communication
- **JWT** - JSON Web Tokens for authentication
- **BCrypt** - Password hashing library
- **Winston** - Logging library
- **Helmet** - Security middleware
- **Express Validator** - Request validation
- **Express Rate Limit** - Rate limiting middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/teamflow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 3. MongoDB Setup

#### Using MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

#### Using Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/teamflow
```

## 🎯 Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic controllers
│   │   └── authController.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── security.ts      # Helmet security headers
│   │   ├── rateLimit.ts     # Rate limiting
│   │   ├── requestLogger.ts # Request logging
│   │   └── errorHandler.ts  # Error handling
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Task.ts
│   │   ├── TeamEventModel.ts
│   │   └── Activity.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── users.ts
│   │   ├── teamEventRoutes.ts
│   │   └── activities.ts
│   ├── socket/              # Socket.io handlers
│   │   └── handlers.ts
│   ├── types/               # TypeScript type definitions
│   │   └── express.d.ts
│   ├── utils/               # Utility functions
│   │   └── logger.ts
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Projects (`/api/projects`)

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "members": ["user_id_1", "user_id_2"]
}
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Tasks (`/api/tasks`)

#### Get Tasks by Project
```http
GET /api/tasks?projectId=<project_id>
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "projectId": "project_id",
  "assignedTo": "user_id"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Team Events (`/api/team-events`)

#### Get Team Events
```http
GET /api/team-events?projectId=<project_id>
Authorization: Bearer <token>
```

#### Create Team Event
```http
POST /api/team-events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Sprint planning",
  "startTime": "2024-12-15T10:00:00Z",
  "endTime": "2024-12-15T11:00:00Z",
  "projectId": "project_id",
  "type": "meeting"
}
```

#### Update Team Event
```http
PUT /api/team-events/:id
Authorization: Bearer <token>
```

#### Delete Team Event
```http
DELETE /api/team-events/:id
Authorization: Bearer <token>
```

### Users (`/api/users`)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "avatar": "avatar_url"
}
```

### Activities (`/api/activities`)

#### Get Project Activities
```http
GET /api/activities?projectId=<project_id>
Authorization: Bearer <token>
```

### Health Check

#### Basic Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "message": "Server is running!",
  "database": "Connected",
  "timestamp": "2024-12-01T10:30:00.000Z"
}
```

#### Detailed Health Check
```http
GET /api/health/detailed
```

## 🔌 Socket.io Events

### Client → Server Events

#### Join Project
```javascript
socket.emit('user-joined', {
  projectId: 'project_id',
  user: {
    userId: 'user_id',
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

#### Leave Project
```javascript
socket.emit('user-left', {
  projectId: 'project_id',
  userId: 'user_id'
});
```

#### Join Project for Updates
```javascript
socket.emit('join-project', 'project_id');
```

#### User Typing
```javascript
socket.emit('user-typing', {
  projectId: 'project_id',
  taskId: 'task_id', // optional
  userId: 'user_id',
  userName: 'John Doe'
});
```

#### Task Moved
```javascript
socket.emit('task-moved', {
  projectId: 'project_id',
  taskId: 'task_id',
  fromStatus: 'todo',
  toStatus: 'in-progress',
  movedBy: 'user_id'
});
```

### Server → Client Events

#### Online Users Update
```javascript
socket.on('online-users', (users) => {
  // Array of online users in the project
  console.log(users);
});
```

#### Task Activity
```javascript
socket.on('task-activity', (activity) => {
  // Real-time task activity updates
  console.log(activity);
});
```

#### User Typing Indicator
```javascript
socket.on('user-typing', ({ userId, userName, taskId, isTyping }) => {
  // Handle typing indicator
});
```

## 🗄️ Database Models

### User Model
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```typescript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [ObjectId (User)],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```typescript
{
  title: String,
  description: String,
  status: String (todo|in-progress|review|done),
  priority: String (low|medium|high),
  projectId: ObjectId (Project),
  assignedTo: ObjectId (User),
  createdBy: ObjectId (User),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TeamEvent Model
```typescript
{
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  projectId: ObjectId (Project),
  createdBy: ObjectId (User),
  attendees: [ObjectId (User)],
  type: String (meeting|deadline|milestone),
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Model
```typescript
{
  projectId: ObjectId (Project),
  userId: ObjectId (User),
  action: String,
  entityType: String,
  entityId: ObjectId,
  metadata: Object,
  createdAt: Date
}
```

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Password hashing with BCrypt (10 rounds)
- Token expiration (configurable)

### Middleware Protection
- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configured for specific client origin
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Logging**: All requests logged with Winston

### Input Validation
- Express Validator for request validation
- Sanitization of user inputs
- MongoDB injection prevention

## 📊 Logging

Winston logger configuration:
- **Development**: Console output with colors
- **Production**: File-based logging
- Log levels: error, warn, info, debug

## ⚙️ Configuration

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | required |
| `JWT_SECRET` | JWT signing secret | required |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🐛 Debugging

### Enable Debug Logs
```bash
NODE_ENV=development npm run dev
```

### Check MongoDB Connection
```bash
# Test connection
curl http://localhost:5000/api/health
```

### View Logs
Logs are stored in:
- Console (development)
- `logs/error.log` (production errors)
- `logs/combined.log` (production all logs)

## 🧪 Testing

### Manual API Testing
Use tools like:
- **Postman**: Import API endpoints
- **Thunder Client**: VS Code extension
- **curl**: Command-line testing

Example curl request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Set all environment variables in your hosting platform
2. Ensure MongoDB Atlas IP whitelist includes your server
3. Update `CLIENT_URL` to production frontend URL

### Recommended Hosting Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Simple Node.js deployment
- **Render**: Free tier available
- **DigitalOcean**: Full control with VPS
- **AWS EC2**: Scalable infrastructure

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |




**Backend built with Node.js, Express, and MongoDB**
