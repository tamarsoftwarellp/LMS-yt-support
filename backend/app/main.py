import uuid
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .admin_course_router import router as admin_course_router
from .quiz_router import admin_router as admin_quiz_router, student_router as student_quiz_router
from .assignment_router import admin_router as admin_assignment_router, student_router as student_assignment_router
from .analytics_router import admin_router as admin_analytics_router, student_router as student_analytics_router
from .certificate_router import admin_router as admin_certificate_router, public_router as public_certificate_router, student_router as student_certificate_router
from .resume_builder_router import router as resume_builder_router
from .admin_schemas import AdminLoginIn
from .career_router import router as career_router
from .config import get_settings
from .database import get_db
from .dependencies import get_current_student
from .models import College, CollegeProgram, Program, RefreshToken, StudentOnboardingStep, StudentProfile, User
from .schemas import (
    CollegeOut,
    CurrentStudentOut,
    OnboardingProgressOut,
    OnboardingStepIn,
    OnboardingStepOut,
    ProgramOut,
    RefreshIn,
    StudentLoginIn,
    StudentRegistrationIn,
    StudentRegistrationOut,
    TokenOut,
)
from .security import create_access_token, hash_password, hash_refresh_token, new_refresh_token, verify_password


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(career_router)
app.include_router(admin_course_router)
app.include_router(admin_quiz_router)
app.include_router(student_quiz_router)
app.include_router(admin_assignment_router)
app.include_router(student_assignment_router)
app.include_router(admin_analytics_router)
app.include_router(student_analytics_router)
app.include_router(student_certificate_router)
app.include_router(admin_certificate_router)
app.include_router(public_certificate_router)
app.include_router(resume_builder_router)

STEP_KEYS = {
    "profile": 1,
    "skill-verification": 2,
    "career-counselling": 3,
    "career-goal": 4,
    "roadmap": 5,
    "dynamic-cv": 6,
    "dashboard": 7,
}


def _issue_session(user: User, db: Session) -> TokenOut:
    access, expires_in = create_access_token(user.id, user.role)
    refresh, digest, expires_at = new_refresh_token()
    db.add(RefreshToken(user_id=user.id, token_hash=digest, expires_at=expires_at))
    db.commit()
    return TokenOut(access_token=access, refresh_token=refresh, expires_in=expires_in)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/masters/colleges", response_model=list[CollegeOut])
def list_colleges(
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> list[College]:
    query = select(College).where(College.is_active.is_(True)).order_by(College.name)
    if search:
        query = query.where(College.name.ilike(f"%{search.strip()}%"))
    return list(db.scalars(query.limit(100)))


@app.get("/api/v1/masters/colleges/{college_id}/programs", response_model=list[ProgramOut])
def list_college_programs(college_id: uuid.UUID, db: Session = Depends(get_db)) -> list[Program]:
    query = (
        select(Program)
        .join(CollegeProgram, CollegeProgram.program_id == Program.id)
        .where(CollegeProgram.college_id == college_id, Program.is_active.is_(True))
        .order_by(Program.name)
    )
    return list(db.scalars(query))


@app.post(
    "/api/v1/auth/student/register",
    response_model=StudentRegistrationOut,
    status_code=status.HTTP_201_CREATED,
)
def register_student(payload: StudentRegistrationIn, db: Session = Depends(get_db)) -> StudentRegistrationOut:
    existing = db.scalar(select(User).where((User.email == payload.email) | (User.mobile == payload.mobile)))
    if existing:
        field = "email" if existing.email == payload.email else "mobile number"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"An account with this {field} already exists")

    mapping_exists = db.scalar(
        select(CollegeProgram.id).where(
            CollegeProgram.college_id == payload.college_id,
            CollegeProgram.program_id == payload.program_id,
        )
    )
    if not mapping_exists:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Selected program is not offered by this college")

    user = User(email=payload.email, mobile=payload.mobile, password_hash=hash_password(payload.password))
    profile = StudentProfile(
        user=user,
        full_name=payload.full_name,
        college_id=payload.college_id,
        program_id=payload.program_id,
        current_year=payload.current_year,
        roll_number=payload.roll_number,
    )
    db.add_all([user, profile])
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or mobile number is already registered")
    db.refresh(user)
    db.refresh(profile)
    return StudentRegistrationOut(
        user_id=user.id,
        student_profile_id=profile.id,
        full_name=profile.full_name,
        email=user.email,
        created_at=user.created_at,
    )


@app.post("/api/v1/auth/student/login", response_model=TokenOut)
def login_student(payload: StudentLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active or user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student account is not active")
    return _issue_session(user, db)


@app.post("/api/v1/auth/admin/login", response_model=TokenOut)
def login_admin(payload: AdminLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not verify_password(payload.password, user.password_hash) or user.role != "admin" or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return _issue_session(user, db)


@app.post("/api/v1/auth/refresh", response_model=TokenOut)
def refresh_session(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenOut:
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(payload.refresh_token)))
    now = datetime.now(timezone.utc)
    if not stored or stored.revoked_at or stored.expires_at.replace(tzinfo=timezone.utc) <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh session is invalid or expired")
    user = db.get(User, stored.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is unavailable")
    stored.revoked_at = now
    return _issue_session(user, db)


@app.post("/api/v1/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshIn, db: Session = Depends(get_db)) -> None:
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(payload.refresh_token)))
    if stored and not stored.revoked_at:
        stored.revoked_at = datetime.now(timezone.utc)
        db.commit()


@app.get("/api/v1/auth/me", response_model=CurrentStudentOut)
def current_student(user: User = Depends(get_current_student), db: Session = Depends(get_db)) -> CurrentStudentOut:
    profile = db.scalar(select(StudentProfile).where(StudentProfile.user_id == user.id))
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    college = db.get(College, profile.college_id)
    program = db.get(Program, profile.program_id)
    return CurrentStudentOut(
        id=user.id,
        email=user.email,
        mobile=user.mobile,
        role=user.role,
        full_name=profile.full_name,
        college_id=profile.college_id,
        college_name=college.name if college else "",
        program_id=profile.program_id,
        program_name=program.name if program else "",
        current_year=profile.current_year,
        roll_number=profile.roll_number,
    )


@app.get("/api/v1/students/me/onboarding", response_model=OnboardingProgressOut)
def get_onboarding(user: User = Depends(get_current_student), db: Session = Depends(get_db)) -> OnboardingProgressOut:
    records = list(db.scalars(select(StudentOnboardingStep).where(StudentOnboardingStep.user_id == user.id).order_by(StudentOnboardingStep.step_number)))
    completed = [record.step_key for record in records if record.status == "completed"]
    current_step = min(len(completed) + 1, 7)
    return OnboardingProgressOut(
        current_step=current_step,
        completed_steps=completed,
        overall_percentage=round(len(completed) / 7 * 100),
        steps=[OnboardingStepOut.model_validate(record, from_attributes=True) for record in records],
    )


@app.put("/api/v1/students/me/onboarding/{step_key}", response_model=OnboardingStepOut)
def save_onboarding_step(
    step_key: str,
    payload: OnboardingStepIn,
    user: User = Depends(get_current_student),
    db: Session = Depends(get_db),
) -> OnboardingStepOut:
    if step_key not in STEP_KEYS:
        raise HTTPException(status_code=404, detail="Unknown onboarding step")
    record = db.scalar(select(StudentOnboardingStep).where(StudentOnboardingStep.user_id == user.id, StudentOnboardingStep.step_key == step_key))
    if not record:
        record = StudentOnboardingStep(user_id=user.id, step_key=step_key, step_number=STEP_KEYS[step_key])
        db.add(record)
    record.data = payload.data
    record.status = payload.status
    record.completed_at = datetime.now(timezone.utc) if payload.status == "completed" else None
    db.commit()
    db.refresh(record)
    return OnboardingStepOut.model_validate(record, from_attributes=True)
