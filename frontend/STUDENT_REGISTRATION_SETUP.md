# Student Registration Setup

The registration flow is implemented without OTP:

`Personal Details → College & Course → Account Created`

## 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

## 2. Start FastAPI

```bash
cd backend
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python -m scripts.seed_masters
uvicorn app.main:app --reload --port 8000
```

Linux/macOS:

```bash
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.seed_masters
uvicorn app.main:app --reload --port 8000
```

API documentation: `http://localhost:8000/docs`

## 3. Start the frontend

From the project root:

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Registration API

- `GET /api/v1/masters/colleges`
- `GET /api/v1/masters/colleges/{college_id}/programs`
- `POST /api/v1/auth/student/register`

Passwords are hashed with Argon2. Email and mobile are unique. The backend validates that the chosen program belongs to the selected college.

## Existing databases: apply the student portal migration

After updating the project, run this again from `backend`:

```bash
alembic upgrade head
```

The current migration creates secure refresh sessions and student-specific onboarding step storage. Student login now uses the account stored in PostgreSQL; OTP and social login are disabled for the current phase.

## Career roadmap configuration

Run the latest migration and seed the skill/course catalog:

```bash
alembic upgrade head
python -m scripts.seed_masters
```

Add these values to `backend/.env`:

```env
# OpenAI is temporarily disabled.
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_MODEL=gpt-5.6
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
UPLOAD_DIR=uploads/resumes
MAX_RESUME_SIZE_MB=5
```

The Groq key is read only by FastAPI. Never put it in the Vite/frontend `.env` file. Resume files are stored locally for development; configure object storage before production deployment.

After student login, the focused portal contains only My Skills, Career Goal, Resume, My Roadmap, My Courses, and Logout. Skills and Career Goal are required for roadmap generation; Resume is optional.
