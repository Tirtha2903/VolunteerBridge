# 🌿 VolunteerBridge
### Smart Resource Allocation — Data-Driven Volunteer Coordination for Social Impact

> A beginner-friendly MERN stack application that collects scattered community needs data, visualises urgency, and intelligently matches available volunteers to the tasks that need them most.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Real-time stats, bar chart by category, doughnut for volunteer availability |
| 🆘 Community Needs | Submit needs with urgency slider (1–5), view/filter, cycle status |
| 🙋 Volunteer Registry | Register with skill chips, toggle availability live |
| ⚡ Smart Match | Algorithm scores (urgency × 2 + skill match +3 + area match +2) and shows ranked pairs |
| 🛡️ Mock Fallback | Works fully on Vercel even without a backend — demo data auto-loads |

---

## 🏗️ Project Structure

```
Project5/
├── vercel.json          ← Vercel SPA config
├── client/              ← React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js       ← Axios + mock fallbacks
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── NeedsPage.jsx
│   │       ├── VolunteersPage.jsx
│   │       └── MatchPage.jsx
│   └── .env.example
└── server/              ← Express + MongoDB backend
    ├── index.js
    ├── models/
    │   ├── Need.js
    │   └── Volunteer.js
    ├── routes/
    │   ├── needs.js
    │   ├── volunteers.js
    │   └── match.js
    └── .env.example
```

---

## 🚀 Local Development

### 1. Backend
```bash
cd server
cp .env.example .env
# Fill in MONGO_URI from MongoDB Atlas
npm install
npm run dev        # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd client
# For local dev, the Vite proxy forwards /api → localhost:5000 automatically
npm install
npm run dev        # runs on http://localhost:5173
```

---

## ☁️ Deploying to Vercel (Frontend)

1. Push repo to GitHub
2. Import in [vercel.com](https://vercel.com) → select **Project5** root
3. Vercel auto-detects `vercel.json` and runs `cd client && npm install && npm run build`
4. *(Optional)* Add `VITE_API_URL` environment variable → your Render backend URL

> **Without `VITE_API_URL`**, the app uses built-in mock data — the dashboard, charts, and match engine all work perfectly for demos.

---

## ☁️ Deploying Backend to Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   CORS_ORIGIN=https://your-app.vercel.app
   PORT=5000
   ```

---

## 🧠 Matching Algorithm

```
score = urgency × 2
      + (volunteerSkillMatchesCategory ? 3 : 0)
      + (volunteerAreaMatchesNeedArea  ? 2 : 0)
```

**Category → Skills mapping:**
- Food → cooking, logistics, driving
- Medical → nursing, first aid, medicine
- Education → teaching, tutoring, training
- Shelter → construction, carpentry, logistics

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite, Chart.js, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (frontend) + Render (backend)
