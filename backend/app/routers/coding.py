import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .certificate import _eligible, _issue
from ..schemas.coding import CodingChallengeUpsertIn, CodingSubmitIn
from ..database import get_db
from ..dependencies import get_current_admin, get_current_student
from ..models import (Certificate, CodingChallenge, CourseEnrollment, CourseLesson, LessonProgress,
                     StudentCodingSubmission, StudentLearningActivity, User)

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin Coding Challenges"])
student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Coding Challenges"])


def load_challenge(db: Session, challenge_id: uuid.UUID) -> CodingChallenge:
    challenge = db.get(CodingChallenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Coding challenge not found")
    return challenge


def admin_payload(challenge: CodingChallenge) -> dict:
    return {"id": challenge.id, "lesson_id": challenge.lesson_id, "instructions": challenge.instructions,
        "function_name": challenge.function_name, "starter_code": challenge.starter_code,
        "maximum_attempts": challenge.maximum_attempts, "status": challenge.status,
        "test_cases": [{"input": tc.get("input", []), "expected": tc.get("expected")} for tc in challenge.test_cases]}


@admin_router.get("/lessons/{lesson_id}/coding")
def admin_get_coding(lesson_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    challenge = db.scalar(select(CodingChallenge).where(CodingChallenge.lesson_id == lesson_id))
    return admin_payload(challenge) if challenge else None


@admin_router.put("/lessons/{lesson_id}/coding")
def admin_save_coding(lesson_id: uuid.UUID, payload: CodingChallengeUpsertIn,
                      db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    lesson = db.get(CourseLesson, lesson_id)
    if not lesson or lesson.lesson_type != "coding":
        raise HTTPException(status_code=422, detail="Coding configuration requires a coding-test lesson")
    challenge = db.scalar(select(CodingChallenge).where(CodingChallenge.lesson_id == lesson_id))
    if challenge and challenge.status == "published" and db.scalar(
        select(func.count(StudentCodingSubmission.id)).where(StudentCodingSubmission.challenge_id == challenge.id)
    ):
        raise HTTPException(status_code=409, detail="A coding test with student submissions cannot be edited")
    if not challenge:
        challenge = CodingChallenge(lesson_id=lesson_id)
        db.add(challenge)
    challenge.instructions = payload.instructions.strip()
    challenge.function_name = payload.function_name.strip()
    challenge.starter_code = payload.starter_code
    challenge.maximum_attempts = payload.maximum_attempts
    challenge.test_cases = [{"input": tc.input, "expected": tc.expected} for tc in payload.test_cases]
    challenge.status = "draft"
    db.commit()
    db.refresh(challenge)
    return admin_payload(challenge)


@admin_router.post("/coding-challenges/{challenge_id}/publish")
def admin_publish_coding(challenge_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    challenge = load_challenge(db, challenge_id)
    if not challenge.test_cases:
        raise HTTPException(status_code=422, detail="Add at least one test case before publishing")
    challenge.status = "published"
    db.commit()
    db.refresh(challenge)
    return admin_payload(challenge)


def student_context(db: Session, user_id: uuid.UUID, challenge_id: uuid.UUID) -> tuple[CodingChallenge, CourseEnrollment]:
    challenge = load_challenge(db, challenge_id)
    if challenge.status != "published":
        raise HTTPException(status_code=404, detail="Coding test is not available")
    enrollment = db.scalar(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id,
        CourseEnrollment.course_id == challenge.lesson.section.course_id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course before attempting the coding test")
    return challenge, enrollment


@student_router.get("/lessons/{lesson_id}/coding")
def student_get_coding(lesson_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    challenge = db.scalar(select(CodingChallenge).where(CodingChallenge.lesson_id == lesson_id, CodingChallenge.status == "published"))
    if not challenge:
        raise HTTPException(status_code=404, detail="Coding test is not available")
    challenge, enrollment = student_context(db, user.id, challenge.id)
    submissions = list(db.scalars(select(StudentCodingSubmission).where(StudentCodingSubmission.challenge_id == challenge.id,
        StudentCodingSubmission.enrollment_id == enrollment.id).order_by(StudentCodingSubmission.attempt_number.desc())))
    return {"id": challenge.id, "lesson_id": challenge.lesson_id, "instructions": challenge.instructions,
        "function_name": challenge.function_name, "starter_code": challenge.starter_code,
        "maximum_attempts": challenge.maximum_attempts, "attempts_used": len(submissions),
        "remaining_attempts": max(0, challenge.maximum_attempts - len(submissions)),
        "passed": any(s.passed for s in submissions),
        "last_code": submissions[0].code if submissions else challenge.starter_code,
        "test_cases": [{"input": tc.get("input", []), "expected": tc.get("expected")} for tc in challenge.test_cases]}


@student_router.post("/coding-challenges/{challenge_id}/submit")
def submit_coding(challenge_id: uuid.UUID, payload: CodingSubmitIn,
                  user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    challenge, enrollment = student_context(db, user.id, challenge_id)
    if payload.total_count != len(challenge.test_cases):
        raise HTTPException(status_code=422, detail="Submission result does not match the current test cases")
    if payload.passed_count > payload.total_count:
        raise HTTPException(status_code=422, detail="Invalid submission result")
    existing = list(db.scalars(select(StudentCodingSubmission).where(StudentCodingSubmission.challenge_id == challenge.id,
        StudentCodingSubmission.enrollment_id == enrollment.id)))
    if not any(s.passed for s in existing) and len(existing) >= challenge.maximum_attempts:
        raise HTTPException(status_code=409, detail="Maximum submission attempts reached")
    passed = payload.total_count > 0 and payload.passed_count == payload.total_count
    submission = StudentCodingSubmission(challenge_id=challenge.id, enrollment_id=enrollment.id,
        attempt_number=len(existing) + 1, code=payload.code, passed_count=payload.passed_count,
        total_count=payload.total_count, passed=passed)
    db.add(submission)
    db.add(StudentLearningActivity(user_id=user.id, enrollment_id=enrollment.id, lesson_id=challenge.lesson_id,
        activity_type="coding_test_submitted", activity_data={"passed": passed,
            "passed_count": payload.passed_count, "total_count": payload.total_count,
            "attempt_number": submission.attempt_number}))
    certificate_issued = None
    if passed:
        progress = db.scalar(select(LessonProgress).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == challenge.lesson_id))
        if not progress:
            progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=challenge.lesson_id)
            db.add(progress)
        progress.status = "completed"
        progress.completed_at = datetime.now(timezone.utc)
        lesson_ids = [lesson.id for section in enrollment.course.sections for lesson in section.lessons]
        db.flush()
        completed = db.scalar(select(func.count(LessonProgress.id)).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id.in_(lesson_ids), LessonProgress.status == "completed")) or 0
        enrollment.progress_percentage = round(completed * 100 / len(lesson_ids)) if lesson_ids else 0
        enrollment.status = "completed" if lesson_ids and completed == len(lesson_ids) else "in_progress"
        db.flush()
        # Auto-issue the certificate the moment the coding test is what completes the course —
        # the student doesn't have to separately ask for it.
        if not db.scalar(select(Certificate).where(Certificate.enrollment_id == enrollment.id, Certificate.status == "issued")) \
                and _eligible(enrollment, db):
            certificate = _issue(enrollment, user.id, db)
            db.flush()
            certificate_issued = {"id": certificate.id, "certificate_number": certificate.certificate_number,
                "verification_token": certificate.verification_token}
    db.commit()
    return {"submission_id": submission.id, "attempt_number": submission.attempt_number,
        "passed_count": payload.passed_count, "total_count": payload.total_count, "passed": passed,
        "certificate_issued": certificate_issued}
