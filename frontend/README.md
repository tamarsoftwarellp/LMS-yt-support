# EduConnect LMS

React/Vite frontend with a FastAPI and PostgreSQL backend foundation.

The Student Registration module is implemented end-to-end without OTP:

- Personal, contact, and academic details
- PostgreSQL master data for colleges and programs
- Argon2 password hashing
- Unique email and mobile enforcement
- College/program relationship validation
- Alembic database migration
- Backend API tests
- Focused student-only career portal after login
- Current skills and career-goal persistence
- Optional PDF/DOCX resume upload and text extraction
- Groq-powered structured roadmap generation (`openai/gpt-oss-20b` by default)
- PostgreSQL course matching and enrollment
- Admin course and curriculum management with publish/archive workflow
- Quiz builder with single-choice, multiple-choice and true/false questions
- Secure student quiz attempts, server-side scoring and progress synchronization

## Setup

### PostgreSQL migration

```powershell
cd backend
alembic upgrade head
```

### Admin creation

```powershell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ReplaceWithStrongPassword"
$env:ADMIN_MOBILE="9876543210"
python -m scripts.create_admin
```

### Seed masters

```powershell
python -m scripts.seed_masters
```

### Backend start

```powershell
uvicorn app.main:app --reload
```

### Frontend start

```powershell
cd ..
npm install
npm run dev
```

See [STUDENT_REGISTRATION_SETUP.md](STUDENT_REGISTRATION_SETUP.md) for complete setup and run instructions.
