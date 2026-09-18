import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import CourseEnrollment


# Only these states grant learning and assessment access. Revoked rows remain
# available for audit/history but must never unlock course content.
ACTIVE_ENROLLMENT_STATUSES = ("enrolled", "in_progress", "completed")


def get_active_enrollment(
    db: Session, user_id: uuid.UUID, course_id: uuid.UUID
) -> CourseEnrollment | None:
    return db.scalar(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.status.in_(ACTIVE_ENROLLMENT_STATUSES),
        )
    )


def get_active_enrollment_by_id(
    db: Session, user_id: uuid.UUID, enrollment_id: uuid.UUID
) -> CourseEnrollment | None:
    return db.scalar(
        select(CourseEnrollment).where(
            CourseEnrollment.id == enrollment_id,
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.status.in_(ACTIVE_ENROLLMENT_STATUSES),
        )
    )
