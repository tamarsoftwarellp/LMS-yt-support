from __future__ import annotations

import re
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Iterable

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from .admin_schemas import (
    ActionResult,
    AdminCourseCreateIn,
    AdminCourseDetailOut,
    AdminCourseListItem,
    AdminCourseUpdateIn,
    AdminLessonIn,
    AdminLessonOut,
    AdminSectionIn,
    AdminSectionOut,
    PaginatedAdminCoursesOut,
    PublicationReadinessOut,
    ReorderPayload,
)
from .database import get_db
from .dependencies import get_current_admin
from .models import Course, CourseEnrollment, CourseLesson, CourseSection, User


router = APIRouter(prefix="/api/v1/admin", tags=["Admin LMS"])
COURSE_STATUSES = {"draft", "published", "archived"}
LESSON_TYPES = {"video", "article", "quiz", "assignment"}
YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
YOUTUBE_URL_RE = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|shorts/|embed/|v/))([A-Za-z0-9_-]{11})",
    re.IGNORECASE,
)


def _normalize_text(value: str) -> str:
    return " ".join(value.split())


def _slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "course"


def _normalize_skills(values: Iterable[str] | None) -> list[str]:
    skills: list[str] = []
    seen: set[str] = set()
    for item in values or []:
        cleaned = _normalize_text(str(item))
        if not cleaned:
            continue
        key = cleaned.casefold()
        if key in seen:
            continue
        seen.add(key)
        skills.append(cleaned)
    return skills


def _extract_youtube_id(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip()
    if YOUTUBE_ID_RE.fullmatch(cleaned):
        return cleaned
    match = YOUTUBE_URL_RE.search(cleaned)
    if match:
        return match.group(1)
    return None


def _load_course(db: Session, course_id: uuid.UUID) -> Course:
    course = db.scalar(
        select(Course)
        .options(selectinload(Course.sections).selectinload(CourseSection.lessons))
        .where(Course.id == course_id)
    )
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


def _course_counts(db: Session, course: Course) -> tuple[int, int, int]:
    enrollment_count = db.scalar(select(func.count(CourseEnrollment.id)).where(CourseEnrollment.course_id == course.id)) or 0
    section_count = len(course.sections or [])
    lesson_count = sum(len(section.lessons or []) for section in course.sections or [])
    return enrollment_count, section_count, lesson_count


def _serialize_course(db: Session, course: Course) -> AdminCourseListItem:
    enrollment_count, section_count, lesson_count = _course_counts(db, course)
    return AdminCourseListItem(
        id=course.id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        level=course.level,
        duration_hours=course.duration_hours,
        skills=list(course.skills or []),
        status=course.status,
        thumbnail_url=course.thumbnail_url,
        instructor_name=course.instructor_name,
        created_by_user_id=course.created_by_user_id,
        created_at=course.created_at,
        updated_at=course.updated_at,
        published_at=course.published_at,
        archived_at=course.archived_at,
        enrollment_count=enrollment_count,
        section_count=section_count,
        lesson_count=lesson_count,
    )


def _course_issues(course: Course) -> list[str]:
    issues: list[str] = []
    if not course.title or not course.title.strip():
        issues.append("Course title is required")
    if not course.description or not course.description.strip():
        issues.append("Course description is required")
    if not course.level or not course.level.strip():
        issues.append("Course level is required")
    if not course.duration_hours or course.duration_hours <= 0:
        issues.append("Course duration must be greater than zero")
    if not course.skills:
        issues.append("At least one skill is required")
    sections = sorted(course.sections or [], key=lambda item: item.sequence or 0)
    if not sections:
        issues.append("At least one section is required")
        return issues
    expected_section_sequence = 1
    seen_section_sequences: set[int] = set()
    for section in sections:
        if not section.title or not section.title.strip():
            issues.append(f"Section {expected_section_sequence} requires a title")
        if section.sequence in seen_section_sequences:
            issues.append("Section sequences must be unique within a course")
        seen_section_sequences.add(section.sequence)
        if section.sequence != expected_section_sequence:
            issues.append("Section sequences must be consecutive starting from 1")
        lessons = sorted(section.lessons or [], key=lambda item: item.sequence or 0)
        if not lessons:
            issues.append(f"Section '{section.title}' requires at least one lesson")
        expected_lesson_sequence = 1
        seen_lesson_sequences: set[int] = set()
        for lesson in lessons:
            if not lesson.title or not lesson.title.strip():
                issues.append(f"Lesson {expected_lesson_sequence} in section '{section.title}' requires a title")
            if lesson.sequence in seen_lesson_sequences:
                issues.append(f"Lesson sequences must be unique within section '{section.title}'")
            seen_lesson_sequences.add(lesson.sequence)
            if lesson.sequence != expected_lesson_sequence:
                issues.append(f"Lesson sequences must be consecutive within section '{section.title}'")
            if lesson.duration_minutes <= 0:
                issues.append(f"Lesson '{lesson.title}' must have a duration greater than zero")
            if lesson.lesson_type not in LESSON_TYPES:
                issues.append(f"Lesson '{lesson.title}' has an invalid type")
            if lesson.lesson_type == "video" and not _extract_youtube_id(lesson.youtube_id):
                issues.append(f"Video lesson '{lesson.title}' requires a YouTube video")
            if lesson.lesson_type == "article" and not (lesson.article_content or "").strip():
                issues.append(f"Article lesson '{lesson.title}' requires content")
            if lesson.lesson_type == "quiz" and (not lesson.quiz or lesson.quiz.status != "published"):
                issues.append(f"Quiz lesson '{lesson.title}' requires a published quiz")
            if lesson.lesson_type == "assignment" and (not lesson.assignment or lesson.assignment.status != "published"):
                issues.append(f"Assignment lesson '{lesson.title}' requires a published assignment")
            expected_lesson_sequence += 1
        expected_section_sequence += 1
    return issues


def _course_detail(db: Session, course: Course) -> AdminCourseDetailOut:
    item = _serialize_course(db, course)
    sections: list[AdminSectionOut] = []
    for section in sorted(course.sections or [], key=lambda entry: entry.sequence or 0):
        lessons = [AdminLessonOut.model_validate(lesson, from_attributes=True) for lesson in sorted(section.lessons or [], key=lambda entry: entry.sequence or 0)]
        sections.append(
            AdminSectionOut(
                id=section.id,
                course_id=section.course_id,
                title=section.title,
                sequence=section.sequence,
                created_at=section.created_at,
                updated_at=section.updated_at,
                lessons=lessons,
            )
        )
    readiness = PublicationReadinessOut(is_ready=not _course_issues(course), issues=_course_issues(course))
    return AdminCourseDetailOut(**item.model_dump(), publication_readiness=readiness, sections=sections)


def _unique_slug(db: Session, slug: str, course_id: uuid.UUID | None = None) -> str:
    candidate = _slugify(slug)
    query = select(Course.id).where(Course.slug == candidate)
    if course_id is not None:
        query = query.where(Course.id != course_id)
    if db.scalar(query):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    return candidate


def _apply_course_updates(course: Course, payload: AdminCourseUpdateIn, db: Session) -> None:
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        course.title = _normalize_text(data["title"])
    if "slug" in data and data["slug"] is not None:
        course.slug = _unique_slug(db, data["slug"], course.id)
    if "description" in data and data["description"] is not None:
        course.description = data["description"].strip()
    if "level" in data and data["level"] is not None:
        course.level = _normalize_text(data["level"])
    if "duration_hours" in data and data["duration_hours"] is not None:
        course.duration_hours = data["duration_hours"]
    if "skills" in data and data["skills"] is not None:
        course.skills = _normalize_skills(data["skills"])
    if "status" in data and data["status"] is not None:
        course.status = data["status"]
    if "thumbnail_url" in data:
        course.thumbnail_url = data["thumbnail_url"].strip() if data["thumbnail_url"] else None
    if "instructor_name" in data:
        course.instructor_name = _normalize_text(data["instructor_name"]) if data["instructor_name"] else None


def _next_sequence(items: list[int]) -> int:
    return (max(items) if items else 0) + 1


def _shift_and_resequence(items: list, *, attr: str) -> None:
    if not items:
        return
    offset = len(items) + 1000
    for item in items:
        setattr(item, attr, (getattr(item, attr) or 0) + offset)
    for index, item in enumerate(items, 1):
        setattr(item, attr, index)


def _section_payload(section: CourseSection) -> dict:
    return {
        "id": section.id,
        "course_id": section.course_id,
        "title": section.title,
        "sequence": section.sequence,
        "created_at": section.created_at,
        "updated_at": section.updated_at,
        "lessons": [AdminLessonOut.model_validate(lesson, from_attributes=True) for lesson in sorted(section.lessons or [], key=lambda item: item.sequence or 0)],
    }


def _validate_lesson_payload(payload: AdminLessonIn) -> tuple[str | None, str | None]:
    youtube_id = _extract_youtube_id(payload.youtube_id)
    article_content = payload.article_content.strip() if payload.article_content else None
    if payload.lesson_type == "video" and not youtube_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Video lesson requires a valid YouTube video ID")
    if payload.lesson_type == "article" and not article_content:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Article lesson requires non-empty content")
    return youtube_id, article_content


@router.get("/courses", response_model=PaginatedAdminCoursesOut)
def list_courses(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=200),
    status_filter: str | None = Query(default=None, alias="status"),
    level: str | None = Query(default=None, max_length=30),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> PaginatedAdminCoursesOut:
    del admin
    query = select(Course).options(selectinload(Course.sections).selectinload(CourseSection.lessons))
    count_query = select(func.count(Course.id))
    if search:
        term = f"%{search.strip()}%"
        query = query.where(Course.title.ilike(term))
        count_query = count_query.where(Course.title.ilike(term))
    if status_filter in COURSE_STATUSES:
        query = query.where(Course.status == status_filter)
        count_query = count_query.where(Course.status == status_filter)
    if level:
        query = query.where(Course.level == level)
        count_query = count_query.where(Course.level == level)
    total = db.scalar(count_query) or 0
    courses = list(
        db.scalars(
            query.order_by(Course.updated_at.desc(), Course.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    items = [_serialize_course(db, course) for course in courses]
    pages = (total + page_size - 1) // page_size if total else 0
    return PaginatedAdminCoursesOut(items=items, page=page, page_size=page_size, total=total, pages=pages)


@router.post("/courses", response_model=AdminCourseDetailOut, status_code=status.HTTP_201_CREATED)
def create_course(payload: AdminCourseCreateIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    if payload.status != "draft":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="New courses must be created as draft and published through the publish action")
    course = Course(
        title=_normalize_text(payload.title),
        slug=_unique_slug(db, payload.slug or payload.title),
        description=payload.description.strip(),
        level=_normalize_text(payload.level),
        duration_hours=payload.duration_hours,
        skills=_normalize_skills(payload.skills),
        status="draft",
        thumbnail_url=payload.thumbnail_url.strip() if payload.thumbnail_url else None,
        instructor_name=_normalize_text(payload.instructor_name) if payload.instructor_name else None,
        created_by_user_id=admin.id,
    )
    db.add(course)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course title or slug already exists") from exc
    course = _load_course(db, course.id)
    return _course_detail(db, course)


@router.get("/courses/{course_id}", response_model=AdminCourseDetailOut)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    return _course_detail(db, _load_course(db, course_id))


@router.get("/courses/{course_id}/publication-readiness", response_model=PublicationReadinessOut)
def course_publication_readiness(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> PublicationReadinessOut:
    del admin
    course = _load_course(db, course_id)
    issues = _course_issues(course)
    return PublicationReadinessOut(is_ready=not issues, issues=issues)


@router.put("/courses/{course_id}", response_model=AdminCourseDetailOut)
def update_course(course_id: uuid.UUID, payload: AdminCourseUpdateIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    course = _load_course(db, course_id)
    if payload.status is not None and payload.status != course.status:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="Use publish, archive or restore actions to change course status")
    _apply_course_updates(course, payload, db)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course title or slug already exists") from exc
    return _course_detail(db, _load_course(db, course_id))


@router.delete("/courses/{course_id}", response_model=ActionResult)
def delete_course(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ActionResult:
    del admin
    course = _load_course(db, course_id)
    enrollment_count = db.scalar(select(func.count(CourseEnrollment.id)).where(CourseEnrollment.course_id == course.id)) or 0
    if enrollment_count:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course has enrollments and cannot be deleted")
    db.delete(course)
    db.commit()
    return ActionResult(detail="Course deleted")


@router.post("/courses/{course_id}/publish", response_model=AdminCourseDetailOut)
def publish_course(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    course = _load_course(db, course_id)
    issues = _course_issues(course)
    if issues:
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": "Course is not ready to publish", "issues": issues})
    course.status = "published"
    course.published_at = datetime.now(timezone.utc)
    course.archived_at = None
    db.commit()
    return _course_detail(db, _load_course(db, course_id))


@router.post("/courses/{course_id}/archive", response_model=AdminCourseDetailOut)
def archive_course(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    course = _load_course(db, course_id)
    course.status = "archived"
    course.archived_at = datetime.now(timezone.utc)
    db.commit()
    return _course_detail(db, _load_course(db, course_id))


@router.post("/courses/{course_id}/restore", response_model=AdminCourseDetailOut)
def restore_course(course_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    course = _load_course(db, course_id)
    course.status = "draft"
    course.archived_at = None
    db.commit()
    return _course_detail(db, _load_course(db, course_id))


@router.post("/courses/{course_id}/sections", response_model=AdminSectionOut, status_code=status.HTTP_201_CREATED)
def create_section(course_id: uuid.UUID, payload: AdminSectionIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminSectionOut:
    del admin
    course = _load_course(db, course_id)
    if payload.sequence is not None:
        if db.scalar(select(CourseSection.id).where(CourseSection.course_id == course.id, CourseSection.sequence == payload.sequence)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Section sequence already exists")
        sequence = payload.sequence
    else:
        sequence = _next_sequence([section.sequence for section in course.sections or []])
    section = CourseSection(course_id=course.id, title=_normalize_text(payload.title), sequence=sequence)
    db.add(section)
    db.commit()
    db.refresh(section)
    section = db.scalar(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.id == section.id))
    return AdminSectionOut(**_section_payload(section))


@router.put("/sections/{section_id}", response_model=AdminSectionOut)
def update_section(section_id: uuid.UUID, payload: AdminSectionIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminSectionOut:
    del admin
    section = db.scalar(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.id == section_id))
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    section.title = _normalize_text(payload.title)
    db.commit()
    db.refresh(section)
    return AdminSectionOut(**_section_payload(section))


@router.delete("/sections/{section_id}", response_model=ActionResult)
def delete_section(section_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ActionResult:
    del admin
    section = db.get(CourseSection, section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    siblings = list(db.scalars(select(CourseSection).where(
        CourseSection.course_id == section.course_id, CourseSection.id != section.id).order_by(CourseSection.sequence)))
    db.delete(section)
    db.flush()
    _shift_and_resequence(siblings, attr="sequence")
    db.commit()
    return ActionResult(detail="Section deleted")


@router.put("/courses/{course_id}/sections/reorder", response_model=AdminCourseDetailOut)
def reorder_sections(course_id: uuid.UUID, payload: ReorderPayload, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminCourseDetailOut:
    del admin
    course = _load_course(db, course_id)
    sections = list(db.scalars(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.course_id == course.id)))
    current_ids = {section.id for section in sections}
    if current_ids != set(payload.ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section IDs do not match this course")
    ordered = []
    by_id = {section.id: section for section in sections}
    for section_id in payload.ids:
        ordered.append(by_id[section_id])
    _shift_and_resequence(ordered, attr="sequence")
    db.commit()
    return _course_detail(db, _load_course(db, course_id))


@router.post("/sections/{section_id}/lessons", response_model=AdminLessonOut, status_code=status.HTTP_201_CREATED)
def create_lesson(section_id: uuid.UUID, payload: AdminLessonIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminLessonOut:
    del admin
    section = db.scalar(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.id == section_id))
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    youtube_id, article_content = _validate_lesson_payload(payload)
    if payload.sequence is not None:
        if db.scalar(select(CourseLesson.id).where(CourseLesson.section_id == section.id, CourseLesson.sequence == payload.sequence)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Lesson sequence already exists")
        sequence = payload.sequence
    else:
        sequence = _next_sequence([lesson.sequence for lesson in section.lessons or []])
    lesson = CourseLesson(
        section_id=section.id,
        title=_normalize_text(payload.title),
        lesson_type=payload.lesson_type,
        duration_minutes=payload.duration_minutes,
        sequence=sequence,
        youtube_id=youtube_id,
        article_content=article_content if payload.lesson_type == "article" else None,
        is_preview=payload.is_preview,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return AdminLessonOut.model_validate(lesson, from_attributes=True)


@router.put("/lessons/{lesson_id}", response_model=AdminLessonOut)
def update_lesson(lesson_id: uuid.UUID, payload: AdminLessonIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminLessonOut:
    del admin
    lesson = db.scalar(select(CourseLesson).options(selectinload(CourseLesson.section)).where(CourseLesson.id == lesson_id))
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    youtube_id, article_content = _validate_lesson_payload(payload)
    lesson.title = _normalize_text(payload.title)
    lesson.lesson_type = payload.lesson_type
    lesson.duration_minutes = payload.duration_minutes
    lesson.youtube_id = youtube_id
    lesson.article_content = article_content if payload.lesson_type == "article" else None
    lesson.is_preview = payload.is_preview
    db.commit()
    db.refresh(lesson)
    return AdminLessonOut.model_validate(lesson, from_attributes=True)


@router.delete("/lessons/{lesson_id}", response_model=ActionResult)
def delete_lesson(lesson_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ActionResult:
    del admin
    lesson = db.get(CourseLesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    siblings = list(db.scalars(select(CourseLesson).where(
        CourseLesson.section_id == lesson.section_id, CourseLesson.id != lesson.id).order_by(CourseLesson.sequence)))
    db.delete(lesson)
    db.flush()
    _shift_and_resequence(siblings, attr="sequence")
    db.commit()
    return ActionResult(detail="Lesson deleted")


@router.put("/sections/{section_id}/lessons/reorder", response_model=AdminSectionOut)
def reorder_lessons(section_id: uuid.UUID, payload: ReorderPayload, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminSectionOut:
    del admin
    section = db.scalar(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.id == section_id))
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    lessons = list(section.lessons or [])
    current_ids = {lesson.id for lesson in lessons}
    if current_ids != set(payload.ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson IDs do not match this section")
    ordered = []
    by_id = {lesson.id: lesson for lesson in lessons}
    for lesson_id in payload.ids:
        ordered.append(by_id[lesson_id])
    _shift_and_resequence(ordered, attr="sequence")
    db.commit()
    db.refresh(section)
    section = db.scalar(select(CourseSection).options(selectinload(CourseSection.lessons)).where(CourseSection.id == section_id))
    return AdminSectionOut(**_section_payload(section))

