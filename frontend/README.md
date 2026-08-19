#  AI Resume Analyzer & Career Recommendation Portal

A complete, production-ready React frontend for the AI Resume Analyzer & Career Recommendation Portal, built with React, Tailwind CSS, React Router v6, and Axios.

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Top navigation bar (responsive)
│   │   ├── Sidebar.jsx       # Collapsible sidebar with active links
│   │   ├── Footer.jsx        # Footer with links
│   │   ├── Button.jsx        # Multi-variant button component
│   │   ├── DashboardCard.jsx # Stat card with icon & change indicator
│   │   ├── RoleCard.jsx      # Career role selection card
│   │   ├── SkillBadge.jsx    # Green (matched) / Red (missing) badge
│   │   └── UploadArea.jsx    # Drag & drop upload with validation
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx       # Hero, features, benefits, CTA
│   │   ├── LoginPage.jsx         # Auth with validation & demo mode
│   │   ├── StudentProfile.jsx    # Profile form (name, college, role...)
│   │   ├── ResumeUpload.jsx      # Upload + progress bar + preview
│   │   ├── RoleSelection.jsx     # 6 career role cards
│   │   ├── AnalysisResult.jsx    # Score ring, skill badges, recs
│   │   ├── StudentDashboard.jsx  # Stat cards, quick actions, table
│   │   ├── MentorDashboard.jsx   # Student list + review panel
│   │   └── FeedbackPage.jsx      # Star rating + feedback form
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx         # All route definitions
│   │   └── ProtectedRoute.jsx    # Auth guard wrapper
│   │
│   ├── services/
│   │   └── api.js                # Axios instance + all API endpoints
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state + localStorage
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                 # Tailwind + custom utility classes
│
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563EB` | Buttons, links, active states |
| Secondary | `#1E40AF` | Hover states, gradients |
| Background | `#F8FAFC` | Page background |
| Success | `#22C55E` | Matched skills, success alerts |
| Warning | `#F59E0B` | Pending states, warnings |
| Error | `#EF4444` | Missing skills, errors |
| Text | `#1F2937` | Body text |
| Font | Poppins | All typography |

---

## 📄 Pages & Routes

| Route | Page | Auth Required |
|-------|------|:---:|
| `/` | Landing Page | ❌ |
| `/login` | Login | ❌ |
| `/profile` | Student Profile | ✅ |
| `/upload` | Resume Upload | ✅ |
| `/roles` | Career Role Selection | ✅ |
| `/analysis` | Analysis Result | ✅ |
| `/dashboard` | Student Dashboard | ✅ |
| `/mentor` | Mentor Dashboard | ✅ |
| `/feedback` | Feedback Page | ✅ |

---

## 🔌 API Integration

All API calls go through `src/services/api.js`.

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

Available API modules:
- `authAPI` – login, register, logout
- `studentAPI` – profile CRUD, dashboard data
- `resumeAPI` – upload with progress tracking
- `analysisAPI` – run analysis, get results
- `careerAPI` – get roles, select role
- `feedbackAPI` – submit & fetch feedback
- `adminAPI` – stats, student management

---

## 🔐 Authentication (Demo Mode)

- JWT stored in `localStorage`
- `AuthContext` provides `user`, `login`, `logout`, `isAuthenticated`
- `ProtectedRoute` redirects unauthenticated users to `/login`
- **Demo**: Enter any email + password (6+ chars) to log in instantly

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI Framework |
| Vite 5 | Build Tool |
| Tailwind CSS 3 | Styling |
| React Router 6 | Client-side Routing |
| Axios | HTTP Client |
| classnames | Conditional CSS Classes |

---

## 🚢 Deployment

### Vercel
```bash
npm run build
```
Add `vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

### Netlify
Create `public/_redirects`:
```
/* /index.html 200
```

---

*Built with ❤️ for AI Resume Analyzer & Career Recommendation Portal*
