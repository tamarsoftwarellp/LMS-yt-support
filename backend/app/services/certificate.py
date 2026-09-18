import secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Certificate, CertificateEvent, CourseEnrollment, CourseLesson, LessonProgress


def certificate_number() -> str:
    now = datetime.now(timezone.utc)
    return f"EDU-{now:%Y%m}-{secrets.token_hex(5).upper()}"


def is_eligible(enrollment: CourseEnrollment, db: Session) -> bool:
    lesson_ids = list(db.scalars(select(CourseLesson.id).join(CourseLesson.section)
        .where(CourseLesson.section.has(course_id=enrollment.course_id))))
    completed = db.scalars(select(LessonProgress.lesson_id).where(
        LessonProgress.enrollment_id == enrollment.id, LessonProgress.status == "completed")).all()
    return bool(lesson_ids) and enrollment.status == "completed" and enrollment.progress_percentage == 100 and set(lesson_ids) <= set(completed)


def issue_certificate(enrollment: CourseEnrollment, actor_id: uuid.UUID | None, db: Session,
                       parent: Certificate | None = None) -> Certificate:
    student_name = enrollment.user.student_profile.full_name if enrollment.user.student_profile else enrollment.user.email
    item = Certificate(certificate_number=certificate_number(), verification_token=secrets.token_urlsafe(32),
        student_id=enrollment.user_id, course_id=enrollment.course_id, enrollment_id=enrollment.id,
        parent_certificate_id=parent.id if parent else None, student_name=student_name,
        course_title=enrollment.course.title, instructor_name=enrollment.course.instructor_name,
        status="issued", issued_by_user_id=actor_id)
    db.add(item); db.flush()
    db.add(CertificateEvent(certificate_id=item.id, event_type="reissued" if parent else "issued",
        actor_user_id=actor_id, details={"parent_certificate_id": str(parent.id) if parent else None}))
    return item


def auto_issue_if_eligible(enrollment: CourseEnrollment, db: Session) -> Certificate | None:
    """Called right after a submission marks an enrollment complete. Returns the certificate
    (existing or newly issued) if the student is eligible, otherwise None. Does not commit —
    the caller commits as part of its own transaction."""
    existing = db.scalar(select(Certificate).where(Certificate.enrollment_id == enrollment.id,
        Certificate.status == "issued").order_by(Certificate.issued_at.desc()))
    if existing:
        return existing
    if not is_eligible(enrollment, db):
        return None
    return issue_certificate(enrollment, None, db)
