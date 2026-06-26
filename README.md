```
╔╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╗
╠╣                                                               ╠╣
╠╣   🗂️  TaskFlow  —  Task Management System                     ╠╣
╠╣      ═══════════════════════════════════════════              ╠╣
╠╣        Full-Stack MERN · JWT Auth · Role-Based Access         ╠╣
╠╣                                                               ╠╣
╚╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╝
```

<div align="center">

<img src="./frontend/src/assets/taskflow.png" alt="TaskFlow Logo" width="88" style="border-radius: 16px" />

# TaskFlow

**A production-ready task management system with role-based access control**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

[🚀 Live Demo](https://task-flow-xi-hazel.vercel.app) · [📡 API Health](https://taskflow-backend-a0x2.onrender.com/api/health) · [Report a Bug](https://github.com/yo-soy-dev/TaskFlow/issues)

</div>

---

## Overview

TaskFlow is a full-stack MERN application that gives teams a clean way to create, assign, and track tasks. Admins manage users and see the full picture; employees see their own workload. Everything is protected by JWT authentication and enforced role-based permissions on both the API and UI layers.

## Features

| | Feature | Details |
|---|---------|---------|
| 🔐 | JWT Auth | Secure login & registration with token-based sessions |
| 👥 | Role-Based Access | Separate Admin & Employee permission sets |
| 📊 | Dashboard | Charts and live task statistics |
| ✅ | Task CRUD | Create, view, edit, and delete tasks with full validation |
| 🔍 | Search & Filter | Filter by status, priority, and category with pagination |
| 👤 | User Management | Admins can create, edit, and deactivate accounts |
| 💬 | Comments | Team discussion threads on each task |
| 📎 | File Attachments | Upload files and images via Cloudinary |
| 📋 | Activity Log | Full audit trail of system actions (Admin only) |
| 🔔 | Notifications | Bell icon with real-time alerts |
| 📊 | Task Progress | Slider to track completion from 0–100% |
| 🏷️ | Categories & Tags | Organize tasks with custom labels |
| ⬇️ | Export CSV | Download task lists as a spreadsheet |
| 🌙 | Dark / Light Mode | Toggle between themes |
| 📱 | Responsive UI | Works on mobile, tablet, and desktop |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@taskflow.com | admin123 |
| 👤 Employee | employee@taskflow.com | emp123456 |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- [Cloudinary](https://cloudinary.com) account (free tier is fine)

### 1. Clone the repo

```bash
git clone https://github.com/yo-soy-dev/TaskFlow.git
cd TaskFlow
```

### 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_manager
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Seed demo data (optional)

```bash
node seed.js
```

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — React dev server (http://localhost:5173)
cd frontend && npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
TaskFlow/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   └── activityController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect & role guard
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── upload.js                # Multer file handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── activityRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── activity.js              # Logging & notification helpers
│   ├── seed.js
│   └── server.js
│
└── frontend/src/
    ├── assets/
    ├── components/
    │   ├── common/                  # Modal, Pagination, Badge, Layout
    │   ├── tasks/                   # TaskForm, AttachmentSection
    │   ├── comments/                # CommentSection
    │   ├── notifications/           # NotificationBell
    │   └── users/                   # UserForm
    ├── context/
    │   └── AuthContext.js
    ├── hooks/
    │   └── useTheme.js
    ├── pages/
    │   ├── DashboardPage.jsx
    │   ├── TasksPage.jsx
    │   ├── UsersPage.jsx
    │   ├── ActivityPage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   └── ProfilePage.jsx
    └── services/
        └── api.js                   # Axios instance + all API calls
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive a token |
| GET | `/me` | Private | Get own profile |
| PUT | `/me` | Private | Update own profile |
| PUT | `/change-password` | Private | Change password |

### Tasks — `/api/tasks`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | List tasks (search, filter, paginate) |
| GET | `/stats` | Private | Task statistics |
| GET | `/export` | Private | Export as CSV |
| GET | `/:id` | Private | Get a single task |
| POST | `/` | Admin | Create a task |
| PUT | `/:id` | Private | Update a task |
| DELETE | `/:id` | Admin | Delete a task |
| POST | `/:id/attachments` | Private | Upload a file attachment |
| DELETE | `/:id/attachments/:aid` | Private | Remove a file attachment |
| GET | `/:id/comments` | Private | Get comments for a task |
| POST | `/:id/comments` | Private | Add a comment |

### Comments — `/api/comments`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/:id` | Private | Edit a comment |
| DELETE | `/:id` | Private | Delete a comment |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get a single user |
| GET | `/:id/tasks` | Admin | Get a user's tasks |
| POST | `/` | Admin | Create a user |
| PUT | `/:id` | Admin | Update a user |
| DELETE | `/:id` | Admin | Delete a user |

### Notifications — `/api/notifications`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get my notifications |
| PUT | `/read-all` | Private | Mark all as read |
| PUT | `/:id/read` | Private | Mark one as read |
| DELETE | `/:id` | Private | Delete a notification |

### Activity — `/api/activity`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get the activity log |

---

## Tech Stack

**Backend**

| Package | Purpose |
|---------|---------|
| Express.js | REST API framework |
| MongoDB + Mongoose | Database & ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| cloudinary + multer | File upload & cloud storage |
| morgan | HTTP request logging |

**Frontend**

| Package | Purpose |
|---------|---------|
| React 18 | UI library |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Dashboard charts |
| React Hot Toast | Toast notifications |
| date-fns | Date formatting |

---

## Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Frontend | [task-flow-xi-hazel.vercel.app](https://task-flow-xi-hazel.vercel.app) |
| Render | Backend API | [taskflow-backend-a0x2.onrender.com](https://taskflow-backend-a0x2.onrender.com) |
| MongoDB Atlas | Database | — |
| Cloudinary | File storage | — |

---

<div align="center">

Built with ❤️ by [Soy-Yo-Dev](https://github.com/yo-soy-dev)

</div>
</div>
