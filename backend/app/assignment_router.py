import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .assignment_schemas import AssignmentEvaluationIn, AssignmentUpsertIn
from .config import get_settings
from .database import get_db
from .dependencies import get_current_admin, get_current_student
from .models import (Assignment, AssignmentEvaluation, AssignmentSubmission, Course, CourseEnrollment,
                     CourseLesson, CourseSection, LessonProgress, StudentLearningActivity, User)

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin Assignments"])
student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Assignments"])
ALLOWED_MIME_TYPES = {
    "pdf": {"application/pdf"},
    "docx": {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
    "zip": {"application/zip", "application/x-zip-compressed"},
}


def assignment_payload(item: Assignment) -> dict:
    return {"id": item.id, "lesson_id": item.lesson_id, "instructions": item.instructions,
        "maximum_marks": item.maximum_marks, "passing_marks": item.passing_marks,
        "maximum_attempts": item.maximum_attempts, "allowed_submission_types": item.allowed_submission_types,
        "allowed_file_extensions": item.allowed_file_extensions, "maximum_file_size_mb": item.maximum_file_size_mb,
        "due_at": item.due_at, "allow_late_submission": item.allow_late_submission,
        "allow_resubmission": item.allow_resubmission, "status": item.status}


def evaluation_payload(item: AssignmentEvaluation) -> dict:
    return {"id": item.id, "marks_awarded": item.marks_awarded, "decision": item.decision,
        "feedback": item.feedback, "evaluated_at": item.evaluated_at}


def submission_payload(item: AssignmentSubmission, include_student: bool = False) -> dict:
    latest = item.evaluations[-1] if item.evaluations else None
    result = {"id": item.id, "assignment_id": item.assignment_id, "enrollment_id": item.enrollment_id,
        "attempt_number": item.attempt_number, "status": item.status, "text_content": item.text_content,
        "link_url": item.link_url, "original_file_name": item.original_file_name,
        "has_file": bool(item.storage_path), "is_late": item.is_late, "submitted_at": item.submitted_at,
        "evaluation": evaluation_payload(latest) if latest else None}
    if include_student:
        result["student"] = {"id": item.enrollment.user.id, "full_name": item.enrollment.user.student_profile.full_name if item.enrollment.user.student_profile else item.enrollment.user.email,
            "email": item.enrollment.user.email}
        result["assignment_title"] = item.assignment.lesson.title
        result["course_title"] = item.assignment.lesson.section.course.title
    return result


def load_assignment(db: Session, assignment_id: uuid.UUID) -> Assignment:
    item = db.scalar(select(Assignment).where(Assignment.id == assignment_id))
    if not item:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return item


def student_context(db: Session, user_id: uuid.UUID, assignment_id: uuid.UUID) -> tuple[Assignment, CourseEnrollment]:
    item = load_assignment(db, assignment_id)
    if item.status != "published":
        raise HTTPException(status_code=404, detail="Assignment is not available")
    enrollment = db.scalar(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id,
        CourseEnrollment.course_id == item.lesson.section.course_id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course before opening the assignment")
    return item, enrollment


@admin_router.get("/lessons/{lesson_id}/assignment")
def admin_get_assignment(lesson_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    item = db.scalar(select(Assignment).where(Assignment.lesson_id == lesson_id))
    return assignment_payload(item) if item else None


@admin_router.put("/lessons/{lesson_id}/assignment")
def admin_save_assignment(lesson_id: uuid.UUID, payload: AssignmentUpsertIn,
                          db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    lesson = db.get(CourseLesson, lesson_id)
    if not lesson or lesson.lesson_type != "assignment":
        raise HTTPException(status_code=422, detail="Assignment configuration requires an assignment lesson")
    item = db.scalar(select(Assignment).where(Assignment.lesson_id == lesson_id))
    if item and db.scalar(select(func.count(AssignmentSubmission.id)).where(
            AssignmentSubmission.assignment_id == item.id, AssignmentSubmission.status != "draft")):
        raise HTTPException(status_code=409, detail="An assignment with submitted work cannot be edited")
    if not item:
        item = Assignment(lesson_id=lesson_id, instructions=payload.instructions.strip())
        db.add(item)
    for name, value in payload.model_dump().items():
        setattr(item, name, value.strip() if isinstance(value, str) else value)
    item.status = "draft"
    db.commit(); db.refresh(item)
    return assignment_payload(item)


@admin_router.post("/assignments/{assignment_id}/publish")
def admin_publish_assignment(assignment_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    item = load_assignment(db, assignment_id)
    if not item.instructions.strip():
        raise HTTPException(status_code=422, detail="Assignment instructions are required")
    item.status = "published"
    db.commit(); db.refresh(item)
    return assignment_payload(item)


@admin_router.get("/assignment-submissions")
def admin_list_submissions(assignment_id: uuid.UUID | None = None, submission_status: str | None = Query(default=None, alias="status"),
                           db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    query = select(AssignmentSubmission).options(
        selectinload(AssignmentSubmission.evaluations),
        selectinload(AssignmentSubmission.enrollment).selectinload(CourseEnrollment.user).selectinload(User.student_profile),
        selectinload(AssignmentSubmission.assignment).selectinload(Assignment.lesson).selectinload(CourseLesson.section),
    ).where(AssignmentSubmission.status != "draft").order_by(AssignmentSubmission.submitted_at.desc())
    if assignment_id:
        query = query.where(AssignmentSubmission.assignment_id == assignment_id)
    if submission_status:
        query = query.where(AssignmentSubmission.status == submission_status)
    return [submission_payload(item, True) for item in db.scalars(query)]


@admin_router.post("/assignment-submissions/{submission_id}/evaluate")
def admin_evaluate_submission(submission_id: uuid.UUID, payload: AssignmentEvaluationIn,
                              db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    submission = db.scalar(select(AssignmentSubmission).options(selectinload(AssignmentSubmission.evaluations)).where(
        AssignmentSubmission.id == submission_id))
    if not submission or submission.status == "draft":
        raise HTTPException(status_code=404, detail="Submitted assignment not found")
    if submission.evaluations and submission.evaluations[-1].decision == "passed":
        raise HTTPException(status_code=409, detail="A passed assignment evaluation is final")
    assignment = load_assignment(db, submission.assignment_id)
    if payload.marks_awarded > assignment.maximum_marks:
        raise HTTPException(status_code=422, detail="Awarded marks cannot exceed maximum marks")
    if payload.decision == "passed" and payload.marks_awarded < assignment.passing_marks:
        raise HTTPException(status_code=422, detail="Passed decision requires at least the configured passing marks")
    if payload.decision == "resubmission_required" and not assignment.allow_resubmission:
        raise HTTPException(status_code=422, detail="Resubmission is disabled for this assignment")
    evaluation = AssignmentEvaluation(submission_id=submission.id, evaluated_by_user_id=admin.id,
        marks_awarded=payload.marks_awarded, decision=payload.decision,
        feedback=payload.feedback.strip() if payload.feedback else None)
    db.add(evaluation)
    submission.status = "resubmission_required" if payload.decision == "resubmission_required" else "evaluated"
    if payload.decision == "passed":
        progress = db.scalar(select(LessonProgress).where(LessonProgress.enrollment_id == submission.enrollment_id,
            LessonProgress.lesson_id == assignment.lesson_id))
        if not progress:
            progress = LessonProgress(enrollment_id=submission.enrollment_id, lesson_id=assignment.lesson_id)
            db.add(progress)
        progress.status = "completed"; progress.completed_at = datetime.now(timezone.utc)
        enrollment = db.get(CourseEnrollment, submission.enrollment_id)
        lesson_ids = [lesson.id for section in enrollment.course.sections for lesson in section.lessons]
        completed = db.scalar(select(func.count(LessonProgress.id)).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id.in_(lesson_ids), LessonProgress.status == "completed")) or 0
        enrollment.progress_percentage = round(completed * 100 / len(lesson_ids)) if lesson_ids else 0
        enrollment.status = "completed" if lesson_ids and completed == len(lesson_ids) else "in_progress"
        db.add(StudentLearningActivity(user_id=enrollment.user_id, enrollment_id=enrollment.id,
            lesson_id=assignment.lesson_id, activity_type="assignment_passed",
            activity_data={"marks_awarded": payload.marks_awarded, "maximum_marks": assignment.maximum_marks}))
    db.commit(); db.refresh(submission)
    return submission_payload(submission)


@admin_router.get("/assignment-submissions/{submission_id}/file")
def admin_download_submission(submission_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    submission = db.get(AssignmentSubmission, submission_id)
    if not submission or not submission.storage_path or not Path(submission.storage_path).is_file():
        raise HTTPException(status_code=404, detail="Submission file not found")
    return FileResponse(submission.storage_path, filename=submission.original_file_name, media_type=submission.mime_type)


@student_router.get("/assignments")
def my_assignments(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = list(db.scalars(select(CourseEnrollment).options(
        selectinload(CourseEnrollment.course).selectinload(Course.sections).selectinload(CourseSection.lessons)
    ).where(CourseEnrollment.user_id == user.id)))
    lessons = [(enrollment, lesson) for enrollment in enrollments for section in enrollment.course.sections
               for lesson in section.lessons if lesson.lesson_type == "assignment"]
    if not lessons:
        return []
    assignments = {item.lesson_id: item for item in db.scalars(select(Assignment).where(
        Assignment.lesson_id.in_([lesson.id for _, lesson in lessons]), Assignment.status == "published"))}
    submission_rows = list(db.scalars(select(AssignmentSubmission).options(selectinload(AssignmentSubmission.evaluations)).where(
        AssignmentSubmission.assignment_id.in_([a.id for a in assignments.values()]),
        AssignmentSubmission.enrollment_id.in_([e.id for e in enrollments]))))
    by_key: dict[tuple, list[AssignmentSubmission]] = {}
    for row in submission_rows:
        by_key.setdefault((row.assignment_id, row.enrollment_id), []).append(row)
    result = []
    for enrollment, lesson in lessons:
        item = assignments.get(lesson.id)
        if not item:
            continue
        submissions = sorted(by_key.get((item.id, enrollment.id), []), key=lambda x: x.attempt_number, reverse=True)
        final = [x for x in submissions if x.status != "draft"]
        latest = final[0] if final else None
        result.append({
            "assignment_id": item.id, "lesson_id": lesson.id, "lesson_title": lesson.title,
            "course_id": enrollment.course_id, "course_title": enrollment.course.title,
            "maximum_marks": item.maximum_marks, "passing_marks": item.passing_marks,
            "due_at": item.due_at,
            "status": latest.status if latest else "not_submitted",
            "attempts_used": len(final), "maximum_attempts": item.maximum_attempts,
            "evaluation": ({"marks_awarded": latest.evaluations[-1].marks_awarded,
                            "decision": latest.evaluations[-1].decision} if latest and latest.evaluations else None),
        })
    result.sort(key=lambda item: (item["due_at"] is None, item["due_at"]))
    return result


@student_router.get("/lessons/{lesson_id}/assignment")
def student_get_assignment(lesson_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    item = db.scalar(select(Assignment).where(Assignment.lesson_id == lesson_id, Assignment.status == "published"))
    if not item:
        raise HTTPException(status_code=404, detail="Assignment is not available")
    item, enrollment = student_context(db, user.id, item.id)
    submissions = list(db.scalars(select(AssignmentSubmission).options(selectinload(AssignmentSubmission.evaluations)).where(
        AssignmentSubmission.assignment_id == item.id, AssignmentSubmission.enrollment_id == enrollment.id)
        .order_by(AssignmentSubmission.attempt_number.desc())))
    payload = assignment_payload(item)
    payload.update({"attempts_used": len([x for x in submissions if x.status != "draft"]),
        "remaining_attempts": max(0, item.maximum_attempts - len([x for x in submissions if x.status != "draft"])),
        "latest_submission": submission_payload(submissions[0]) if submissions else None})
    return payload


@student_router.post("/assignments/{assignment_id}/submissions", status_code=status.HTTP_201_CREATED)
async def student_save_submission(assignment_id: uuid.UUID, submission_status: str = Form(alias="status"),
                                  text_content: str | None = Form(default=None), link_url: str | None = Form(default=None),
                                  file: UploadFile | None = File(default=None), user: User = Depends(get_current_student),
                                  db: Session = Depends(get_db)):
    if submission_status not in {"draft", "submitted"}:
        raise HTTPException(status_code=422, detail="Submission status must be draft or submitted")
    assignment, enrollment = student_context(db, user.id, assignment_id)
    existing = list(db.scalars(select(AssignmentSubmission).options(selectinload(AssignmentSubmission.evaluations)).where(
        AssignmentSubmission.assignment_id == assignment.id, AssignmentSubmission.enrollment_id == enrollment.id)
        .order_by(AssignmentSubmission.attempt_number)))
    final_count = len([item for item in existing if item.status != "draft"])
    if final_count >= assignment.maximum_attempts:
        raise HTTPException(status_code=409, detail="Maximum assignment attempts reached")
    previous = next((item for item in reversed(existing) if item.status != "draft"), None)
    if previous and previous.status != "resubmission_required" and not assignment.allow_resubmission:
        raise HTTPException(status_code=409, detail="Resubmission is not allowed")
    now = datetime.now(timezone.utc)
    due_at = assignment.due_at
    if due_at and due_at.tzinfo is None:
        due_at = due_at.replace(tzinfo=timezone.utc)
    is_late = bool(due_at and now > due_at)
    if submission_status == "submitted" and is_late and not assignment.allow_late_submission:
        raise HTTPException(status_code=409, detail="The assignment due date has passed")
    allowed = set(assignment.allowed_submission_types)
    text_content = text_content.strip() if text_content else None
    link_url = link_url.strip() if link_url else None
    if link_url and urlparse(link_url).scheme not in {"http", "https"}:
        raise HTTPException(status_code=422, detail="Submission link must use http or https")
    if text_content and "text" not in allowed or link_url and "link" not in allowed or file and "file" not in allowed:
        raise HTTPException(status_code=422, detail="This submission type is not allowed")
    if submission_status == "submitted" and not any([text_content, link_url, file]):
        raise HTTPException(status_code=422, detail="Add a file, text response or link before submitting")
    draft = next((item for item in existing if item.status == "draft"), None)
    submission = draft or AssignmentSubmission(assignment_id=assignment.id, enrollment_id=enrollment.id,
        attempt_number=final_count + 1)
    if not draft:
        db.add(submission)
    submission.text_content = text_content; submission.link_url = link_url; submission.is_late = is_late
    if file:
        extension = Path(file.filename or "").suffix.lower().lstrip(".")
        if extension not in assignment.allowed_file_extensions or file.content_type not in ALLOWED_MIME_TYPES.get(extension, set()):
            raise HTTPException(status_code=422, detail="Unsupported assignment file type")
        limit = min(assignment.maximum_file_size_mb, get_settings().max_assignment_size_mb) * 1024 * 1024
        content = await file.read(limit + 1)
        if len(content) > limit:
            raise HTTPException(status_code=413, detail=f"Assignment file must be {limit // 1024 // 1024} MB or smaller")
        upload_dir = Path(get_settings().assignment_upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        stored = upload_dir / f"{uuid.uuid4()}.{extension}"
        stored.write_bytes(content)
        submission.original_file_name = Path(file.filename or f"submission.{extension}").name
        submission.storage_path = str(stored); submission.mime_type = file.content_type; submission.file_size = len(content)
    submission.status = submission_status
    submission.submitted_at = now if submission_status == "submitted" else None
    if submission_status == "submitted":
        db.add(StudentLearningActivity(user_id=user.id, enrollment_id=enrollment.id, lesson_id=assignment.lesson_id,
            activity_type="assignment_submitted", activity_data={"attempt_number": submission.attempt_number,
                "is_late": is_late}))
    db.commit(); db.refresh(submission)
    return submission_payload(submission)
