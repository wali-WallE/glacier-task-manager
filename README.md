# Glacier Task Manager 🏔️

A full-stack, production-ready task management dashboard built for modern teams. This application features secure cross-domain authentication, role-based access control, and real-time interactive task tracking.

## Live Links
- **Frontend (Vercel):** [https://glacier-task-manager-gilt.vercel.app/login]
- **Backend API (Render):** [https://glacier-task-manager.onrender.com]

---

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, React Hot Toast
- **Backend:** Node.js, Express, Passport.js (Local Strategy), Express-Session
- **Database:** PostgreSQL (Hosted on Neon.tech), `pg` connection pool
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## Features Completed

### Core Requirements
- [x] **Secure Authentication:** Cookie-based session management using Passport.js. Passwords securely hashed via `bcrypt`.
- [x] **Workspace Management:** Create teams, assign descriptions, and isolate data by workspace.
- [x] **Task CRUD:** Full Create, Read, Update, and Delete capabilities for tasks within specific workspaces.
- [x] **Team Collaboration:** Invite users to your workspace via email. Assign tasks to specific team members.
- [x] **Task Filtering:** Filter active tasks by search query, assigned member, or completion status.

### Bonus Features Conquered
- [x] **Role-Based Access Control (RBAC):** Backend validation ensures only the Workspace Creator (`admin`) can delete tasks, remove members, or destroy the workspace.
- [x] **Visual Due Dates:** Tasks feature integrated due dates with dynamic UI badges (Overdue, Due Soon) that automatically calculate based on the current date.
- [x] **Stubbed Email Notifications:** Simulated email invites integrated into the UI flow.

---

## 💻 Local Development Setup

### 1. Clone the repository

- git clone [glacier-task-manager ]
- cd [glacier-task-manager]


### 2. Backend Setup
Navigate to the backend directory, install dependencies, and set up your environment variables.

- cd backend
- npm install


Create a `.env` file in the `backend` folder:
env
PORT=5000
DATABASE_URL=your_neon_postgres_connection_string
SESSION_SECRET=your_super_secret_local_key
NODE_ENV=development

Start the backend development server:
- npm run dev


### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies.
- cd frontend
- npm install


Start the Vite development server:
- npm run dev


*Note: The frontend is configured with a local Vite proxy (`vite.config.js`) to automatically route `/api` requests to your local backend on port 5000 during development.*