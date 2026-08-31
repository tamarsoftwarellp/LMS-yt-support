from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from .database import get_db
from .dependencies import get_current_admin, get_current_student
from .models import (AssignmentSubmission, Course, CourseEnrollment, LessonProgress,
                     StudentLearningActivity, StudentQuizAttempt, User)

student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Analytics"])
admin_router = APIRouter(prefix="/api/v1/admin/analytics", tags=["Admin Analytics"])


def _streak(activity_dates: set[date]) -> int:
    if not activity_dates:
        return 0
    cursor = datetime.now(timezone.utc).date()
    if cursor not in activity_dates:
        cursor -= timedelta(days=1)
    streak = 0
    while cursor in activity_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _student_dashboard(user: User, db: Session) -> dict:
    enrollments = list(db.scalars(select(CourseEnrollment).where(CourseEnrollment.user_id == user.id)))
    enrollment_ids = [item.id for item in enrollments]
    progress_items = list(db.scalars(select(LessonProgress).where(LessonProgress.enrollment_id.in_(enrollment_ids)))) if enrollment_ids else []
    attempts = list(db.scalars(select(StudentQuizAttempt).where(
        StudentQuizAttempt.enrollment_id.in_(enrollment_ids), StudentQuizAttempt.status == "submitted"))) if enrollment_ids else []
    submissions = list(db.scalars(select(AssignmentSubmission).where(
        AssignmentSubmission.enrollment_id.in_(enrollment_ids), AssignmentSubmission.status != "draft"))) if enrollment_ids else []
    activities = list(db.scalars(select(StudentLearningActivity).where(StudentLearningActivity.user_id == user.id)
        .order_by(StudentLearningActivity.occurred_at.desc()).limit(100)))
    total_lessons = sum(len(section.lessons) for enrollment in enrollments for section in enrollment.course.sections)
    completed_lessons = sum(1 for item in progress_items if item.status == "completed")
    learning_seconds = sum(item.watched_seconds or 0 for item in progress_items)
    quiz_average = round(sum(item.percentage for item in attempts) / len(attempts)) if attempts else 0
    pending_assignments = sum(1 for item in submissions if item.status == "submitted")
    passed_assignments = sum(1 for item in submissions if item.evaluations and item.evaluations[-1].decision == "passed")
    activity_dates = {item.occurred_at.date() for item in activities}
    weekly = []
    today = datetime.now(timezone.utc).date()
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        seconds = sum(item.seconds_delta for item in activities if item.occurred_at.date() == day)
        weekly.append({"date": day.isoformat(), "minutes": round(seconds / 60)})
    next_action = None
    for enrollment in enrollments:
        completed_ids = {item.lesson_id for item in progress_items if item.enrollment_id == enrollment.id and item.status == "completed"}
        for section in enrollment.course.sections:
            for lesson in section.lessons:
                if lesson.id not in completed_ids:
                    matching = next((item for item in progress_items if item.enrollment_id == enrollment.id and item.lesson_id == lesson.id), None)
                    next_action = {"type": lesson.lesson_type, "title": lesson.title, "course_id": str(enrollment.course_id),
                        "course_title": enrollment.course.title, "lesson_id": str(lesson.id),
                        "resume_position_seconds": matching.last_position_seconds if matching else 0}
                    break
            if next_action:
                break
        if next_action:
            break
    recent = [{"type": item.activity_type, "occurred_at": item.occurred_at,
        "seconds_delta": item.seconds_delta, "data": item.activity_data} for item in activities[:10]]
    return {"summary": {"enrolled_courses": len(enrollments),
        "completed_courses": sum(1 for item in enrollments if item.status == "completed"),
        "overall_progress_percentage": round(sum(item.progress_percentage for item in enrollments) / len(enrollments)) if enrollments else 0,
        "completed_lessons": completed_lessons, "total_lessons": total_lessons,
        "learning_minutes": round(learning_seconds / 60), "learning_streak_days": _streak(activity_dates),
        "quiz_average_percentage": quiz_average, "quiz_attempts": len(attempts),
        "assignments_submitted": len(submissions), "assignments_passed": passed_assignments,
        "pending_assignments": pending_assignments}, "weekly_activity": weekly,
        "next_action": next_action, "recent_activity": recent}


@student_router.get("/dashboard")
def student_dashboard(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    return _student_dashboard(user, db)


@student_router.get("/analytics/activity")
def student_activity(limit: int = Query(default=30, ge=1, le=100), user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    items = db.scalars(select(StudentLearningActivity).where(StudentLearningActivity.user_id == user.id)
        .order_by(StudentLearningActivity.occurred_at.desc()).limit(limit))
    return [{"id": item.id, "type": item.activity_type, "seconds_delta": item.seconds_delta,
        "data": item.activity_data, "occurred_at": item.occurred_at} for item in items]


@student_router.get("/analytics/progress")
def student_progress(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    dashboard = _student_dashboard(user, db)
    return {"summary": dashboard["summary"], "weekly_activity": dashboard["weekly_activity"]}


def _course_performance(db: Session) -> list[dict]:
    courses = list(db.scalars(select(Course).order_by(Course.title)))
    result = []
    for course in courses:
        enrollments = list(db.scalars(select(CourseEnrollment).where(CourseEnrollment.course_id == course.id)))
        result.append({"course_id": course.id, "title": course.title, "status": course.status,
            "enrollment_count": len(enrollments),
            "completion_rate": round(sum(1 for item in enrollments if item.status == "completed") * 100 / len(enrollments)) if enrollments else 0,
            "average_progress": round(sum(item.progress_percentage for item in enrollments) / len(enrollments)) if enrollments else 0})
    return sorted(result, key=lambda item: (-item["enrollment_count"], item["title"]))


@admin_router.get("/overview")
def admin_overview(days: int = Query(default=30, ge=1, le=365), db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    since = datetime.now(timezone.utc) - timedelta(days=days)
    courses = list(db.scalars(select(Course)))
    enrollments = list(db.scalars(select(CourseEnrollment)))
    submitted_quizzes = list(db.scalars(select(StudentQuizAttempt).where(StudentQuizAttempt.status == "submitted")))
    active_learners = db.scalar(select(func.count(distinct(StudentLearningActivity.user_id))).where(StudentLearningActivity.occurred_at >= since)) or 0
    recent = list(db.scalars(select(StudentLearningActivity).order_by(StudentLearningActivity.occurred_at.desc()).limit(12)))
    return {"summary": {"total_students": db.scalar(select(func.count(User.id)).where(User.role == "student")) or 0,
        "active_learners": active_learners, "total_courses": len(courses),
        "published_courses": sum(1 for item in courses if item.status == "published"),
        "draft_courses": sum(1 for item in courses if item.status == "draft"),
        "archived_courses": sum(1 for item in courses if item.status == "archived"),
        "total_enrollments": len(enrollments),
        "course_completion_rate": round(sum(1 for item in enrollments if item.status == "completed") * 100 / len(enrollments)) if enrollments else 0,
        "average_quiz_score": round(sum(item.percentage for item in submitted_quizzes) / len(submitted_quizzes)) if submitted_quizzes else 0,
        "pending_assignment_evaluations": db.scalar(select(func.count(AssignmentSubmission.id)).where(AssignmentSubmission.status == "submitted")) or 0,
        "video_learning_minutes": round((db.scalar(select(func.sum(LessonProgress.watched_seconds))) or 0) / 60)},
        "course_performance": _course_performance(db)[:8],
        "recent_activity": [{"type": item.activity_type, "user_id": item.user_id,
            "seconds_delta": item.seconds_delta, "data": item.activity_data, "occurred_at": item.occurred_at} for item in recent]}


@admin_router.get("/courses")
def admin_course_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    return _course_performance(db)


@admin_router.get("/students")
def admin_student_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    students = list(db.scalars(select(User).where(User.role == "student")))
    result = []
    for student in students:
        enrollments = list(db.scalars(select(CourseEnrollment).where(CourseEnrollment.user_id == student.id)))
        minutes = round((db.scalar(select(func.sum(StudentLearningActivity.seconds_delta)).where(StudentLearningActivity.user_id == student.id)) or 0) / 60)
        result.append({"student_id": student.id, "name": student.student_profile.full_name if student.student_profile else student.email,
            "email": student.email, "enrollments": len(enrollments), "learning_minutes": minutes,
            "average_progress": round(sum(item.progress_percentage for item in enrollments) / len(enrollments)) if enrollments else 0})
    return sorted(result, key=lambda item: (-item["learning_minutes"], item["name"]))


@admin_router.get("/assignments")
def admin_assignment_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    submissions = list(db.scalars(select(AssignmentSubmission).where(AssignmentSubmission.status != "draft")))
    return {"submitted": len(submissions), "pending": sum(1 for item in submissions if item.status == "submitted"),
        "evaluated": sum(1 for item in submissions if item.status == "evaluated"),
        "resubmission_required": sum(1 for item in submissions if item.status == "resubmission_required"),
        "late": sum(1 for item in submissions if item.is_late)}
