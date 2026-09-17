# Taskflow-main
# TaskFlow – Task Management Application

TaskFlow is a full-stack task management web application that allows users to create, organize, track, and manage their tasks efficiently.

The application includes secure authentication, task CRUD operations, dashboard statistics, search and filtering, and real-time updates.

---

## ✨ Features

- 🔐 User registration and login
- 🛡️ JWT-based authentication
- 🔒 Password hashing using bcrypt
- 📝 Create, edit, update, and delete tasks
- ⏳ Task status management
  - Pending
  - In Progress
  - Completed
- 🎯 Task priority levels
  - High
  - Medium
  - Low
- 🔍 Search tasks
- 🏷️ Filter tasks by status and priority
- ↕️ Sort tasks
- 📊 Dashboard with task statistics
- ⚡ Real-time task updates using Socket.IO
- 📱 Responsive desktop and mobile UI
- 👤 User-specific task access
- ✅ Form validation
- 🚨 Overdue task tracking

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router
- CSS

### Backend
- Node.js
- Express.js
- REST API

### Database
- PostgreSQL

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt

### Real-Time Communication
- Socket.IO

### Deployment
- Vercel
- Render
- Neon PostgreSQL

---

## 📁 Project Structure

```text
Taskflow/
│
├── backend/
│   ├── db/
│   │   └── schema.sql
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── socket.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md
