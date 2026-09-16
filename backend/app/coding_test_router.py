import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .certificate_service import auto_issue_if_eligible
from .code_execution_service import ALGORITHMIC_LANGUAGES, grade_submission
from .coding_test_schemas import CodingRunIn, CodingTestUpsertIn
from .database import get_db
from .dependencies import get_current_admin, get_current_student
from .models import (CodingTest, CodingTestCase, CourseEnrollment, CourseLesson, LessonProgress,
                     StudentCodingSubmission, StudentCodingTestResult, StudentLearningActivity, User)

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin Coding Tests"])
student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Coding Tests"])


def case_payload(item: CodingTestCase, include_hidden_details: bool = False) -> dict:
    result = {"id": item.id, "sequence": item.sequence, "title": item.title, "is_hidden": item.is_hidden,
        "weight": item.weight}
    if item.case_type == "io" and (include_hidden_details or not item.is_hidden):
        result["stdin"] = item.stdin
        result["expected_output"] = item.expected_output
    if item.case_type == "structural" and (include_hidden_details or not item.is_hidden):
        result["checks"] = item.checks
    return result


def admin_payload(item: CodingTest) -> dict:
    return {"id": item.id, "lesson_id": item.lesson_id, "mode": item.mode,
        "problem_statement": item.problem_statement, "supported_languages": item.supported_languages,
        "starter_code": item.starter_code, "maximum_attempts": item.maximum_attempts,
        "time_limit_minutes": item.time_limit_minutes, "passing_percentage": item.passing_percentage,
        "status": item.status, "test_cases": [case_payload(case, include_hidden_details=True) for case in item.test_cases]}


def load_coding_test(db: Session, coding_test_id: uuid.UUID) -> CodingTest:
    item = db.scalar(select(CodingTest).options(selectinload(CodingTest.test_cases)).where(CodingTest.id == coding_test_id))
    if not item:
        raise HTTPException(status_code=404, detail="Coding test not found")
    return item


@admin_router.get("/lessons/{lesson_id}/coding-test")
def admin_get_coding_test(lesson_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    item = db.scalar(select(CodingTest).options(selectinload(CodingTest.test_cases)).where(CodingTest.lesson_id == lesson_id))
    return admin_payload(item) if item else None


@admin_router.put("/lessons/{lesson_id}/coding-test")
def admin_save_coding_test(lesson_id: uuid.UUID, payload: CodingTestUpsertIn,
                           db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    lesson = db.get(CourseLesson, lesson_id)
    if not lesson or lesson.lesson_type != "coding_test":
        raise HTTPException(status_code=422, detail="Coding test configuration requires a coding_test lesson")
    item = db.scalar(select(CodingTest).options(selectinload(CodingTest.test_cases)).where(CodingTest.lesson_id == lesson_id))
    if item and db.scalar(select(func.count(StudentCodingSubmission.id)).where(StudentCodingSubmission.coding_test_id == item.id)):
        raise HTTPException(status_code=409, detail="A coding test with student submissions cannot be edited")
    if not item:
        item = CodingTest(lesson_id=lesson_id)
        db.add(item)
    item.mode = payload.mode
    item.problem_statement = payload.problem_statement.strip()
    item.supported_languages = payload.supported_languages
    item.starter_code = payload.starter_code
    item.maximum_attempts = payload.maximum_attempts
    item.time_limit_minutes = payload.time_limit_minutes
    item.passing_percentage = payload.passing_percentage
    item.status = "draft"
    item.test_cases.clear()
    db.flush()
    for index, case_in in enumerate(payload.test_cases, 1):
        db.add(CodingTestCase(coding_test_id=item.id, sequence=index, title=case_in.title.strip(),
            case_type="io" if payload.mode == "algorithmic" else "structural", is_hidden=case_in.is_hidden,
            weight=case_in.weight, stdin=case_in.stdin, expected_output=case_in.expected_output,
            checks=[check.model_dump() for check in case_in.checks]))
    db.commit()
    return admin_payload(load_coding_test(db, item.id))


@admin_router.post("/coding-tests/{coding_test_id}/publish")
def admin_publish_coding_test(coding_test_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    item = load_coding_test(db, coding_test_id)
    if not item.test_cases:
        raise HTTPException(status_code=422, detail="Add at least one test case before publishing")
    item.status = "published"
    db.commit()
    return admin_payload(load_coding_test(db, item.id))


def student_context(db: Session, user_id: uuid.UUID, coding_test_id: uuid.UUID) -> tuple[CodingTest, CourseEnrollment]:
    item = load_coding_test(db, coding_test_id)
    if item.status != "published":
        raise HTTPException(status_code=404, detail="Coding test is not available")
    enrollment = db.scalar(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id,
        CourseEnrollment.course_id == item.lesson.section.course_id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course before opening the coding test")
    return item, enrollment


@student_router.get("/lessons/{lesson_id}/coding-test")
def student_get_coding_test(lesson_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    item = db.scalar(select(CodingTest).options(selectinload(CodingTest.test_cases)).where(
        CodingTest.lesson_id == lesson_id, CodingTest.status == "published"))
    if not item:
        raise HTTPException(status_code=404, detail="Coding test is not available")
    item, enrollment = student_context(db, user.id, item.id)
    submissions = list(db.scalars(select(StudentCodingSubmission).where(
        StudentCodingSubmission.coding_test_id == item.id, StudentCodingSubmission.enrollment_id == enrollment.id)
        .order_by(StudentCodingSubmission.attempt_number.desc())))
    return {"id": item.id, "lesson_id": item.lesson_id, "mode": item.mode,
        "problem_statement": item.problem_statement, "supported_languages": item.supported_languages,
        "starter_code": item.starter_code, "time_limit_minutes": item.time_limit_minutes,
        "passing_percentage": item.passing_percentage,
        "attempts_used": len(submissions), "remaining_attempts": max(0, item.maximum_attempts - len(submissions)),
        "passed": any(submission.passed for submission in submissions),
        "best_percentage": max([submission.percentage for submission in submissions] or [0]),
        "test_cases": [case_payload(case) for case in item.test_cases]}


def _validate_payload(item: CodingTest, payload: CodingRunIn) -> None:
    if item.mode == "algorithmic":
        if payload.language not in item.supported_languages or payload.language not in ALGORITHMIC_LANGUAGES:
            raise HTTPException(status_code=422, detail="This language is not supported for this coding test")
        if not (payload.source_files.get("code") or "").strip():
            raise HTTPException(status_code=422, detail="Submit your code before running it")
    else:
        expected_keys = {"html", "css", "js"} if item.mode == "web" else {"code"}
        if not any((payload.source_files.get(key) or "").strip() for key in expected_keys):
            raise HTTPException(status_code=422, detail="Submit your code before running it")


@student_router.post("/coding-tests/{coding_test_id}/run")
async def run_coding_test(coding_test_id: uuid.UUID, payload: CodingRunIn,
                          user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    """Runs the student's code against the visible (non-hidden) test cases only. Does not count
    as an attempt and is not persisted — it powers the 'Run' button in the editor."""
    item, _ = student_context(db, user.id, coding_test_id)
    _validate_payload(item, payload)
    visible_cases = [case for case in item.test_cases if not case.is_hidden]
    results = await grade_submission(item.mode, payload.language, payload.source_files, visible_cases)
    visible_results = [{"test_case_id": case.id, "title": case.title, **result} for case, result in zip(visible_cases, results)]
    return {"results": visible_results, "passed_count": sum(r["passed"] for r in visible_results),
        "total_count": len(visible_cases)}


@student_router.post("/coding-tests/{coding_test_id}/submit", status_code=status.HTTP_201_CREATED)
async def submit_coding_test(coding_test_id: uuid.UUID, payload: CodingRunIn,
                             user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    item, enrollment = student_context(db, user.id, coding_test_id)
    attempts_used = db.scalar(select(func.count(StudentCodingSubmission.id)).where(
        StudentCodingSubmission.coding_test_id == item.id, StudentCodingSubmission.enrollment_id == enrollment.id)) or 0
    if attempts_used >= item.maximum_attempts:
        raise HTTPException(status_code=409, detail="Maximum coding test attempts reached")
    _validate_payload(item, payload)
    test_cases = item.test_cases
    results = await grade_submission(item.mode, payload.language, payload.source_files, test_cases)
    total_weight = sum(case.weight for case in test_cases)
    earned_weight = sum(case.weight for case, result in zip(test_cases, results) if result["passed"])
    percentage = round(earned_weight * 100 / total_weight) if total_weight else 0
    passed = percentage >= item.passing_percentage
    submission = StudentCodingSubmission(coding_test_id=item.id, enrollment_id=enrollment.id,
        attempt_number=attempts_used + 1, language=payload.language, source_files=payload.source_files,
        total_weight=total_weight, earned_weight=earned_weight, percentage=percentage, passed=passed)
    db.add(submission); db.flush()
    for case, result in zip(test_cases, results):
        db.add(StudentCodingTestResult(submission_id=submission.id, test_case_id=case.id, passed=result["passed"],
            actual_output=result.get("actual_output"), error_message=result.get("error_message")))
    db.add(StudentLearningActivity(user_id=user.id, enrollment_id=enrollment.id, lesson_id=item.lesson_id,
        activity_type="coding_test_submitted", activity_data={"percentage": percentage, "passed": passed,
            "attempt_number": submission.attempt_number, "language": payload.language}))
    certificate = None
    if passed:
        progress = db.scalar(select(LessonProgress).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == item.lesson_id))
        if not progress:
            progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=item.lesson_id)
            db.add(progress)
        progress.status = "completed"; progress.completed_at = datetime.now(timezone.utc)
        lesson_ids = [lesson.id for section in enrollment.course.sections for lesson in section.lessons]
        db.flush()
        completed = db.scalar(select(func.count(LessonProgress.id)).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id.in_(lesson_ids), LessonProgress.status == "completed")) or 0
        enrollment.progress_percentage = round(completed * 100 / len(lesson_ids)) if lesson_ids else 0
        enrollment.status = "completed" if lesson_ids and completed == len(lesson_ids) else "in_progress"
        db.flush()
        certificate = auto_issue_if_eligible(enrollment, db)
    db.commit(); db.refresh(submission)
    return {"submission_id": submission.id, "attempt_number": submission.attempt_number,
        "earned_weight": earned_weight, "total_weight": total_weight, "percentage": percentage, "passed": passed,
        "results": [{"test_case_id": case.id, "title": case.title, "is_hidden": case.is_hidden, **result}
            for case, result in zip(test_cases, results)],
        "certificate_issued": certificate is not None,
        "certificate_id": certificate.id if certificate else None}
