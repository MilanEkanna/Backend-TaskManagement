# Task Management API

A secure, scalable, and fully documented RESTful backend for a task management system built with Node.js, Express, and MongoDB. Implements JWT-based authentication, role-based access control (RBAC), task CRUD operations, analytics, and advanced filtering — all while following industry best practices.

## Features

### Core Requirements
- **User Authentication**: Register, login, logout, and profile retrieval
- **JWT + Rate Limiting**: Secure token-based auth with brute-force protection (5 attempts/15 mins)
- **Role-Based Access Control (RBAC)**:
  - **User**: Manage own tasks and view own profile
  - **Manager**: Manage tasks for team members; view team analytics
  - **Admin**: Full system access
- **Task Management**: Full CRUD with ownership enforcement
- **Task Assignment**: Assign tasks to users (managers → team only)

### Bonus Features
- **Analytics Endpoint**: Get task stats (completed, pending, overdue) by user or team  
  `GET /api/analytics/tasks?scope=user`
- **Search & Filtering**: Filter tasks by `status`, `priority`, `dueDate`, and full-text `search`
- **Performance**: MongoDB indexes for efficient querying
- **OpenAPI 3.0 Docs**: Interactive Swagger UI with live testing
- **Used compression package for optimizataion to handle a large number of concurrent requests**

    - So What Does compression() Actually Do?
      It compresses the HTTP response body (e.g., JSON, HTML) using gzip or Brotli, which:

    - Reduces the number of TCP packets needed to send the response
    → Smaller payload = fewer packets = faster delivery.

    - Saves bandwidth for both server and client
    → Especially helpful on mobile or slow networks.

    - Speeds up perceived performance
    → Client receives and parses data faster.


### Security & Best Practices
- Password hashing with `bcryptjs`
- Input validation (email format, password strength, ObjectId checks)
- Centralized error handling
- `.env` secrets management (never committed)
- Helmet, CORS, and Morgan for hardened security/logging

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repo:
   
   git clone https://github.com/your-username/task-manager-api.git
   cd task-manager-api

2. Install dependencies:
   
   npm install

3. Create a .env file in the root HAVING:

    PORT=5000
    MONGO_URI=mongodb://localhost:27017/taskdb
    JWT_SECRET=your_super_strong_jwt_secret_here_123!
    JWT_EXPIRE=1d

4. Start the server: 
    
   npm run dev

5. Visit:
    API:    🔗 http://localhost:5000
    Docs:   🔗http://localhost:5000/api-docs


## Dependencies

Core: express, mongoose, jsonwebtoken, bcryptjs
Security: helmet, cors, express-rate-limit
Docs: swagger-jsdoc, swagger-ui-express
Dev: nodemon, dotenv


## THIS IS THE PROJECT STRUCTURE - 

src/
├── config/          # DB and env setup
├── controllers/     # Business logic (auth, tasks, analytics)
├── middleware/      # Auth, RBAC, rate limiting
├── models/          # Mongoose schemas (User, Task)
├── routes/          # API endpoints
├── utils/           # Error handling
└── docs/            # Swagger OpenAPI spec


## API Documentation

All endpoints are documented using OpenAPI 3.0 and available via Swagger UI at:

🔗 http://localhost:5000/api-docs

- To test protected endpoints:

    Log in via POST /api/auth/login
    Copy the token from the response
    Click “Authorize” in Swagger UI
    Paste: Bearer <your_token>
    Test any endpoint!

## Roles & Permissions

User :
• Create/view/update/delete own tasks
• View own profile

Manager :
• All User actions
• Assign tasks to team members
• View team analytics

Admin :
• Full access to all users and tasks

**Team Logic**: Users and managers belong to a team (e.g., "engineering"). Managers can only manage users in the same team.

## Example Workflow OF Project APIS

1. Register → POST /api/auth/register
2. Login → POST /api/auth/login → get JWT
3. Create Task → POST /api/tasks
4. List Tasks → GET /api/tasks?status=todo&priority=high
5. Get Analytics → GET /api/analytics/tasks?scope=team (for managers)
6. Update Task → PUT /api/tasks/:id (only creator or admin)

## Assumptions & Design Decisions

1. JWT is stateless: Logout = frontend discards token (production: add Redis denylist)
2. Team-based RBAC: Managers must have a team field to manage others
3. Analytics: Overdue = not done + due date < now
4. Search: Case-insensitive full-text on title and description
5. Validation: All ObjectId fields (e.g., assignedTo) are validated before DB ops

## Author

Milan – Full-Stack Developer @ Chetu India Pvt Ltd
Specializing in MERN stack and WCAG-compliant accessible web applications

