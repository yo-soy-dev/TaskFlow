# TaskFlow — MERN Stack Task Management System

A full-stack Task Management System built with MongoDB, Express.js, React.js, and Node.js.

## Features
- JWT Authentication (Login / Register)
- Role-Based Access Control (Admin & Employee)
- Dashboard with charts and statistics
- Full Task CRUD with search, filter & pagination
- User Management (Admin only)
- Responsive dark UI

## Demo Credentials
| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@taskflow.com       | admin123    |
| Employee | employee@taskflow.com    | emp123456   |

---

## Project Structure

```
mern-task-manager/
├── server/                  # Express + MongoDB backend
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   ├── index.js
│   └── .env.example
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd mern-task-manager
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Seed the Database (optional)
```bash
cd server
node seed.js
```

### 4. Setup Frontend
```bash
cd client
npm install
```

---

## Running the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev        # runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start          # runs on http://localhost:3000
```

Then open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### Auth
| Method | Endpoint                  | Access  | Description          |
|--------|---------------------------|---------|----------------------|
| POST   | /api/auth/register        | Public  | Register new user    |
| POST   | /api/auth/login           | Public  | Login                |
| GET    | /api/auth/me              | Private | Get own profile      |
| PUT    | /api/auth/me              | Private | Update own profile   |
| PUT    | /api/auth/change-password | Private | Change password      |

### Tasks
| Method | Endpoint         | Access         | Description              |
|--------|------------------|----------------|--------------------------|
| GET    | /api/tasks       | Private        | Get all tasks (filtered) |
| GET    | /api/tasks/stats | Private        | Get task statistics      |
| GET    | /api/tasks/:id   | Private        | Get single task          |
| POST   | /api/tasks       | Admin only     | Create task              |
| PUT    | /api/tasks/:id   | Private        | Update task              |
| DELETE | /api/tasks/:id   | Admin only     | Delete task              |

### Users
| Method | Endpoint              | Access     | Description          |
|--------|-----------------------|------------|----------------------|
| GET    | /api/users            | Admin only | Get all users        |
| GET    | /api/users/:id        | Admin only | Get single user      |
| GET    | /api/users/:id/tasks  | Admin only | Get user's tasks     |
| POST   | /api/users            | Admin only | Create user          |
| PUT    | /api/users/:id        | Admin only | Update user          |
| DELETE | /api/users/:id        | Admin only | Delete user          |

---

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, express-validator

**Frontend:** React 18, React Router v6, Axios, Recharts, React Hot Toast, date-fns