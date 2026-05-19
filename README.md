# TaskFlow — Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking team progress with **role-based access control** and an **AI assistant powered by Groq**.

---

## 🚀 Live Demo

> **https://team-task-manager-full-stack-3h1q.onrender.com**

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Authentication | JWT signup/login, 7-day sessions, first user = auto-Admin |
| 👥 Role-Based Access | Global Admin / Project Admin / Member with enforced permissions |
| 📁 Projects | Create, archive, complete · progress bars · member management |
| ✅ Tasks | Kanban board (To Do → In Progress → Review → Done) · priorities · due dates · comments |
| 📊 Dashboard | My tasks, overdue alerts, stats, activity feed |
| 🤖 AI Assistant | Groq-powered chat, task description generator, subtask suggester |
| 🛡 Security | bcrypt passwords, helmet headers, CORS, input validation |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, pure CSS variables |
| Fonts | Syne (display) + DM Sans (body) |
| Backend | Node.js, Express 4 |
| Database | SQLite via sql.js (zero-native-deps) |
| Auth | JWT + bcryptjs |
| AI | Groq SDK (llama3-8b-8192) |
| Deployment | Render |

---

## 🔑 Getting a Free Groq API Key

1. Go to **[https://console.groq.com](https://console.groq.com)**
2. Sign up for a free account (no credit card required)
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)
5. Add it as `GROQ_API_KEY` in your `.env` or Render environment variables

> **Note:** The app works fully without a Groq key — the AI assistant panel will simply show a "not configured" message while all other features work normally.

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth.js        — signup, login, profile
│       │   ├── projects.js    — CRUD + members
│       │   ├── tasks.js       — CRUD + comments + dashboard
│       │   ├── users.js       — admin user management
│       │   └── ai.js          — Groq AI endpoints
│       ├── middleware/
│       │   └── auth.js        — JWT + RBAC guards
│       ├── routes/
│       │   ├── auth.js
│       │   ├── projects.js
│       │   ├── tasks.js
│       │   ├── users.js
│       │   └── ai.js
│       ├── database.js        — sql.js SQLite setup + schema
│       └── index.js           — Express app entry
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── UI.jsx         — Button, Card, Modal, Badge, Avatar…
│       │   ├── Sidebar.jsx    — Navigation
│       │   └── AIAssistant.jsx — Floating Groq chat panel
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Auth.jsx       — Login + Signup
│       │   ├── Dashboard.jsx  — My tasks + stats
│       │   ├── Projects.jsx   — Project list
│       │   ├── ProjectDetail.jsx — Kanban board + members
│       │   └── AdminUsers.jsx — Admin: user management
│       └── utils/
│           └── api.js         — Typed API client
├── render.yaml                — Render deployment config
├── .env.example               — Environment variable template
└── README.md
```

---

## 🗄 Database Schema

```sql
users           id, name, email, password(hashed), role(admin|member), created_at
projects        id, name, description, status(active|archived|completed), owner_id, timestamps
project_members project_id, user_id, role(admin|member), joined_at  — UNIQUE(project_id, user_id)
tasks           id, title, description, status(todo|in_progress|review|done),
                priority(low|medium|high|critical), project_id, assignee_id,
                creator_id, due_date, timestamps
task_comments   id, task_id, user_id, content, created_at
```

---

## 🔌 REST API Reference

### Auth  `POST /api/auth/…`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | — | Register (first user → admin) |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | ✅ | Current user |
| PUT | `/me` | ✅ | Update name |

### Projects  `/api/projects`
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | Member | List my projects |
| POST | `/` | Member | Create project |
| GET | `/:id` | Member | Project + stats + members |
| PUT | `/:id` | Project Admin | Update project |
| DELETE | `/:id` | Project Admin | Delete project |
| POST | `/:id/members` | Project Admin | Add member by email |
| DELETE | `/:id/members/:uid` | Project Admin | Remove member |
| PUT | `/:id/members/:uid` | Project Admin | Change member role |

### Tasks  `/api/projects/:id/tasks`
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | Member | List tasks (filter: status, priority, assignee) |
| POST | `/` | Member | Create task |
| GET | `/:tid` | Member | Task + comments |
| PUT | `/:tid` | Assignee/Admin | Update (admins: all fields; assignees: status only) |
| DELETE | `/:tid` | Project Admin | Delete task |
| POST | `/:tid/comments` | Member | Add comment |

### AI  `/api/ai`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/assist` | General Groq chat assistant |
| POST | `/generate-description` | Auto-generate task description from title |
| POST | `/suggest-subtasks` | Break a task into 3–5 subtasks |

### Dashboard  `GET /api/projects/dashboard`
Returns: `{ myTasks, overdueTasks, stats, recentActivity }`

### Admin  `/api/users`  *(Global Admin only)*
| GET / PUT / DELETE | Manage all users and roles |

---

## 💻 Local Development

```bash
# 1. Clone
git clone https://github.com/your-username/taskflow.git
cd taskflow

# 2. Install backend
npm install --prefix backend

# 3. Install frontend
npm install --prefix frontend

# 4. Configure environment
cp .env.example backend/.env
# Edit backend/.env:
#   JWT_SECRET=any-random-string
#   GROQ_API_KEY=gsk_your_key_here   ← optional

# 5. Start backend  (http://localhost:3001)
npm run dev --prefix backend

# 6. Start frontend  (http://localhost:5173, proxied to backend)
npm run dev --prefix frontend
```

Open **http://localhost:5173** — the first account you create is automatically Admin.

---

## 🚀 Deploy on Render (Free Tier)

### Step-by-step

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
   git push -u origin main
   ```

2. **Create a Render account** at [https://render.com](https://render.com)

3. **New Web Service** → Connect your GitHub repo

4. Render auto-detects `render.yaml`. Confirm these settings:
   | Setting | Value |
   |---------|-------|
   | Build Command | `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend` |
   | Start Command | `npm start --prefix backend` |
   | Environment | Node |

5. **Add Environment Variables** in Render dashboard:
   ```
   NODE_ENV    = production
   PORT        = 3001
   JWT_SECRET  = <click "Generate" in Render>
   GROQ_API_KEY = gsk_your_key_here
   ```

6. Click **Deploy** — your app will be live in ~3 minutes!

> **Persistence note:** Render free tier has an ephemeral filesystem. For permanent data, add a Render Disk (paid) mounted at `/data` and set `DB_PATH=/data/taskflow.db`. Alternatively, use [Turso](https://turso.tech) (free SQLite cloud).

---

## 🧪 Test Credentials

After deploying, create accounts via the Signup page:

```
1st account (auto-Admin):  admin@company.com / yourpassword
2nd account (Member):      dev@company.com   / yourpassword
```

---

## 🔐 Security Highlights

- Passwords hashed with **bcrypt** (10 salt rounds)
- **JWT** tokens (7-day expiry, `HS256`)
- **Helmet.js** — sets 12+ security HTTP headers
- Role checks on **every** protected route (middleware-enforced)
- Members cannot see projects they don't belong to
- Members can only update status of tasks assigned to them

---

