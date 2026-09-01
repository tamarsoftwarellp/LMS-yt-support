# EduConnect — Frontend

Vite + React 18 + TypeScript + Tailwind frontend for EduConnect. Talks to the
FastAPI backend in `../backend` — see that project's `README.md` to get the
API running first.

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + **shadcn/ui** components
- **recharts** — dashboards / progress charts
- **sonner** — toasts

## Prerequisites

- Node.js 18+
- The backend running locally (default `http://localhost:8000`) — see
  `../backend/README.md`

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Windows (PowerShell): `Copy-Item .env.example .env`

```
VITE_API_URL=http://localhost:8000
```

Point this at wherever the backend is actually running (change it for a
staging/production API when you deploy).

## 3. Run the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Routes

| Path | Who it's for | Notes |
|---|---|---|
| `/` | Everyone | Landing page |
| `/student/login`, `/student/register` | Students | |
| `/student/*` | Logged-in students | Career portal — skills, goal, AI roadmap, resume builder, certificates |
| `/lms/*` | Logged-in students | Dashboard, catalog, my courses, assignments, progress, certificates, course player |
| `/college` | Institutions | Public registration form — creates a college + its first admin, pending super-admin approval |
| `/admin/login` | College admins & the platform owner | Single login; routes to the right dashboard based on role |
| `/admin/*` | College admins | Course/quiz/assignment/certificate management + institution profile |
| `/super-admin` | Platform owner only | Institution approval — pending/active/suspended/rejected, approve/reject/suspend |
| `/verify-certificate/:token` | Public | Certificate authenticity check |

## Project structure

```
src/
  app/App.tsx                 Top-level router (path <-> mode), session guards
  api/                        One file per backend domain (student-auth, student-career,
                               admin-lms, super-admin, college-portal, institution, ...)
  components/
    auth.tsx                  Student/admin login, registration
    college-register.tsx      Public institution registration form
    student-career-portal.tsx Career portal (skills/goal/roadmap/resume/certificates)
    lms.tsx                   Standalone LMS (dashboard/catalog/courses/assignments/progress/certs)
    course-player.tsx         Video/article/quiz/assignment lesson player
    learning-shared.tsx       Shared live quiz/assignment components (career portal + LMS)
    lms-admin.tsx             College admin: course/quiz/assignment/certificate management
    institution-management.tsx  College admin: institution profile/programs/students
    super-admin.tsx           Platform owner: institution approval dashboard
    certificate-verification.tsx  Public certificate lookup page
```

## Notes

- Student and admin sessions are independent (separate token storage), so you
  can be logged in as both in the same browser for testing.
- Access tokens live in `sessionStorage`; refresh tokens in `localStorage`.
