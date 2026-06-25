<div align="center">

<img src="./frontend/src/assets/taskflow.png" alt="TaskFlow Logo" width="80" style="border-radius: 16px" />

# TaskFlow — Task Management System

**A production-ready full-stack MERN application with Role-Based Access Control**

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

[🚀 Live Demo](https://task-flow-xi-hazel.vercel.app) · [📦 Backend API](https://taskflow-backend-a0x2.onrender.com/api/health)

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 JWT Authentication | Secure login & registration with token-based auth |
| 👥 Role-Based Access | Separate Admin & Employee permissions |
| 📊 Dashboard | Charts and real-time task statistics |
| ✅ Task CRUD | Create, view, edit, delete tasks with full validation |
| 🔍 Search & Filter | Filter by status, priority with pagination |
| 👤 User Management | Admin can create, edit, deactivate users |
| 📱 Responsive UI | Clean dark UI that works on all screen sizes |
| ⚡ Error Handling | Proper validation and error responses throughout |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@taskflow.com | admin123 |
| 👤 Employee | employee@taskflow.com | emp123456 |

---

## 🗂️ Project Structure

```
mern-task-manager/
├── server/                      # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT protect & role guard
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── response.js
│   ├── seed.js                  # Demo data seeder
│   ├── server.js
│   └── .env.example
│
├── client/                      # React Frontend
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/          # Modal, Pagination, Badge, etc.
│       │   ├── tasks/           # TaskForm
│       │   └── users/           # UserForm
│       ├── context/
│       │   └── AuthContext.js   # Global auth state
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── TasksPage.jsx
│       │   ├── UsersPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── ProfilePage.jsx
│       └── services/
│           └── api.js           # Axios instance + API calls
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yo-soy-dev/TaskFlow.git
cd mern-task-manager
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017/task_manager
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

### 3. Seed Demo Data (optional but recommended)
```bash
node seed.js
```

### 4. Setup Frontend
```bash
cd ../client
npm install
```

---

## ▶️ Running the App

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

Then open **[http://localhost:5173](http://localhost:5173)**

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login & get token |
| GET | `/me` | Private | Get own profile |
| PUT | `/me` | Private | Update profile |
| PUT | `/change-password` | Private | Change password |

### Tasks — `/api/tasks`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all tasks (search, filter, paginate) |
| GET | `/stats` | Private | Get task statistics |
| GET | `/:id` | Private | Get single task |
| POST | `/` | Admin | Create task |
| PUT | `/:id` | Private | Update task |
| DELETE | `/:id` | Admin | Delete task |

### Users — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | Get all users |
| GET | `/:id` | Admin | Get single user |
| GET | `/:id/tasks` | Admin | Get user's tasks |
| POST | `/` | Admin | Create user |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| jsonwebtoken | JWT Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| morgan | HTTP request logger |

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 | UI Library |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Dashboard charts |
| React Hot Toast | Notifications |
| date-fns | Date formatting |

---

## ✅ Assignment Requirements Checklist

- [x] JWT Authentication (Login / Register)
- [x] Role-Based Access Control (Admin & Employee)
- [x] Dashboard with task statistics & charts
- [x] Complete Task CRUD (Create, Read, Update, Delete)
- [x] User Management (Admin only)
- [x] Search, Filter & Pagination
- [x] Proper REST API structure
- [x] Input validation & error handling
- [x] Responsive dark UI
- [x] Clean folder structure & reusable components
- [x] Database seeder for demo data
- [x] Environment variable configuration

---

## 🚀 Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Frontend hosting | [task-flow-xi-hazel.vercel.app](https://task-flow-xi-hazel.vercel.app) |
| Render | Backend API | [https://taskflow-backend-a0x2.onrender.com](https://taskflow-backend-a0x2.onrender.com) |
| MongoDB Atlas | Cloud database | — |

---

<div align="center">

Developed with ❤️ by **Soy-Yo-Dev**

</div>
