import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .career_schemas import CareerGoalInput, CareerGoalOut, SkillInput, SkillOut
from .config import get_settings
from .database import get_db
from .dependencies import get_current_student
from .models import CareerGoal, Course, CourseEnrollment, CourseLesson, LessonProgress, Skill, StudentLearningActivity, StudentResume, StudentRoadmap, StudentSkill, User
from .resume_service import detect_skills, extract_resume_text
from .roadmap_service import PROMPT_VERSION, generate_roadmap


router = APIRouter(prefix="/api/v1/students/me", tags=["Student Career Journey"])


class LessonProgressInput(BaseModel):
    status: str = Field(pattern="^(in_progress|completed)$")
    watched_seconds: int = Field(default=0, ge=0)
    last_position_seconds: int = Field(default=0, ge=0)
    previous_position_seconds: int | None = Field(default=None, ge=0)
    duration_seconds: int | None = Field(default=None, ge=1, le=86400)


def merge_watched_range(ranges: list, start: int, end: int) -> list[list[int]]:
    normalized = sorted([[max(0, int(a)), max(0, int(b))] for a, b in ranges if int(b) > int(a)] + [[start, end]])
    merged: list[list[int]] = []
    for current_start, current_end in normalized:
        if not merged or current_start > merged[-1][1] + 1:
            merged.append([current_start, current_end])
        else:
            merged[-1][1] = max(merged[-1][1], current_end)
    return merged


def skill_out(item: StudentSkill) -> SkillOut:
    return SkillOut(id=item.id, name=item.skill.name, category=item.skill.category,
                    proficiency_level=item.proficiency_level, experience_months=item.experience_months, source=item.source)


@router.get("/skills", response_model=list[SkillOut])
def get_skills(user: User = Depends(get_current_student), db: Session = Depends(get_db)) -> list[SkillOut]:
    items = list(db.scalars(select(StudentSkill).where(StudentSkill.user_id == user.id).order_by(StudentSkill.created_at)))
    return [skill_out(item) for item in items]


@router.put("/skills", response_model=list[SkillOut])
def replace_skills(payload: list[SkillInput], user: User = Depends(get_current_student), db: Session = Depends(get_db)) -> list[SkillOut]:
    if not payload:
        raise HTTPException(status_code=422, detail="Add at least one current skill")
    db.query(StudentSkill).filter(StudentSkill.user_id == user.id).delete(synchronize_session=False)
    created: list[StudentSkill] = []
    seen: set[str] = set()
    for entry in payload:
        normalized = " ".join(entry.name.split())
        key = normalized.casefold()
        if key in seen:
            continue
        seen.add(key)
        skill = db.scalar(select(Skill).where(func.lower(Skill.name) == key))
        if not skill:
            skill = Skill(name=normalized, category=entry.category)
            db.add(skill)
            db.flush()
        item = StudentSkill(user_id=user.id, skill_id=skill.id, proficiency_level=entry.proficiency_level,
                            experience_months=entry.experience_months, source="student", skill=skill)
        db.add(item)
        created.append(item)
    db.commit()
    for item in created:
        db.refresh(item)
    return [skill_out(item) for item in created]


@router.get("/career-goal", response_model=CareerGoalOut | None)
def get_goal(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    return db.scalar(select(CareerGoal).where(CareerGoal.user_id == user.id))


@router.put("/career-goal", response_model=CareerGoalOut)
def save_goal(payload: CareerGoalInput, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    goal = db.scalar(select(CareerGoal).where(CareerGoal.user_id == user.id))
    if not goal:
        goal = CareerGoal(user_id=user.id, **payload.model_dump())
        db.add(goal)
    else:
        for key, value in payload.model_dump().items():
            setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/resume", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    settings = get_settings()
    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".pdf", ".docx"}:
        raise HTTPException(status_code=415, detail="Upload a PDF or DOCX resume")
    content = await file.read(settings.max_resume_size_mb * 1024 * 1024 + 1)
    if len(content) > settings.max_resume_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Resume must be under {settings.max_resume_size_mb} MB")
    upload_root = Path(settings.upload_dir).resolve()
    upload_root.mkdir(parents=True, exist_ok=True)
    stored_path = upload_root / f"{user.id}-{uuid.uuid4().hex}{extension}"
    stored_path.write_bytes(content)
    db.execute(update(StudentResume).where(StudentResume.user_id == user.id).values(is_current=False))
    resume = StudentResume(user_id=user.id, original_file_name=Path(file.filename or "resume").name,
                           storage_path=str(stored_path), mime_type=file.content_type or "application/octet-stream",
                           file_size=len(content), parsing_status="processing", parsed_data={})
    db.add(resume)
    try:
        text = extract_resume_text(content, extension).strip()
        known = list(db.scalars(select(Skill.name).where(Skill.is_active.is_(True))))
        resume.parsed_text = text[:50000]
        resume.parsed_data = {"detected_skills": detect_skills(text, known), "text_length": len(text)}
        resume.parsing_status = "processed"
        resume.processed_at = datetime.now(timezone.utc)
    except Exception as exc:
        resume.parsing_status = "failed"
        resume.processing_error = f"{type(exc).__name__}: unable to extract resume text"
    db.commit()
    db.refresh(resume)
    return {"id": resume.id, "file_name": resume.original_file_name, "file_size": resume.file_size,
            "parsing_status": resume.parsing_status, "parsed_data": resume.parsed_data,
            "processing_error": resume.processing_error, "uploaded_at": resume.uploaded_at}


@router.get("/resume")
def get_resume(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    resume = db.scalar(select(StudentResume).where(StudentResume.user_id == user.id, StudentResume.is_current.is_(True)).order_by(StudentResume.uploaded_at.desc()))
    if not resume:
        return None
    return {"id": resume.id, "file_name": resume.original_file_name, "file_size": resume.file_size,
            "parsing_status": resume.parsing_status, "parsed_data": resume.parsed_data,
            "processing_error": resume.processing_error, "uploaded_at": resume.uploaded_at}


def match_courses(phases: list[dict], courses: list[Course]) -> list[dict]:
    recommendations: list[dict] = []
    used: set[uuid.UUID] = set()
    for phase in phases:
        wanted = {str(skill).casefold() for skill in phase.get("skills", [])}
        ranked = []
        for course in courses:
            matched = wanted & {str(skill).casefold() for skill in course.skills}
            if matched and course.id not in used:
                ranked.append((len(matched), course, sorted(matched)))
        for score, course, matched in sorted(ranked, key=lambda item: item[0], reverse=True)[:2]:
            used.add(course.id)
            recommendations.append({"course_id": str(course.id), "phase_sequence": phase["sequence"],
                "title": course.title, "description": course.description, "level": course.level,
                "duration_hours": course.duration_hours, "matched_skills": matched,
                "match_score": min(100, 55 + score * 15),
                "reason": f"Supports {phase['title']} through {', '.join(matched)}."})
    return recommendations


@router.post("/roadmaps/generate", status_code=status.HTTP_201_CREATED)
def create_roadmap(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    skills = list(db.scalars(select(StudentSkill).where(StudentSkill.user_id == user.id)))
    goal = db.scalar(select(CareerGoal).where(CareerGoal.user_id == user.id))
    if not skills:
        raise HTTPException(status_code=422, detail="Add your current skills before generating a roadmap")
    if not goal:
        raise HTTPException(status_code=422, detail="Set your career goal before generating a roadmap")
    resume = db.scalar(select(StudentResume).where(StudentResume.user_id == user.id, StudentResume.is_current.is_(True)))
    snapshot = {
        "current_skills": [{"name": item.skill.name, "level": item.proficiency_level,
                            "experience_months": item.experience_months} for item in skills],
        "career_goal": {"target_role": goal.target_role, "preferred_domain": goal.preferred_domain,
                        "current_level": goal.current_level, "target_duration_months": goal.target_duration_months,
                        "weekly_learning_hours": goal.weekly_learning_hours, "description": goal.goal_description},
        "resume_text": (resume.parsed_text[:12000] if resume and resume.parsing_status == "processed" and resume.parsed_text else None),
    }
    draft, model_name = generate_roadmap(snapshot)
    phases = [phase.model_dump() for phase in draft.phases]
    courses = list(db.scalars(select(Course).where(Course.status == "published")))
    recommendations = match_courses(phases, courses)
    version = (db.scalar(select(func.max(StudentRoadmap.version)).where(StudentRoadmap.user_id == user.id)) or 0) + 1
    roadmap = StudentRoadmap(user_id=user.id, career_goal_id=goal.id, resume_id=resume.id if resume else None,
        title=draft.title, summary=draft.summary, duration_weeks=draft.duration_weeks,
        skill_gaps=[gap.model_dump() for gap in draft.skill_gaps], phases=phases, recommendations=recommendations,
        input_snapshot=snapshot, model_name=model_name, prompt_version=PROMPT_VERSION, version=version)
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return roadmap_payload(roadmap, user.id, db)


def roadmap_payload(roadmap: StudentRoadmap, user_id: uuid.UUID, db: Session) -> dict:
    enrolled = {str(item.course_id): item for item in db.scalars(
        select(CourseEnrollment).where(CourseEnrollment.user_id == user_id)
    )}
    recommendations = []
    for recommendation in roadmap.recommendations:
        item = enrolled.get(str(recommendation.get("course_id")))
        recommendations.append({**recommendation, "is_enrolled": bool(item),
            "enrollment_id": str(item.id) if item else None,
            "progress_percentage": item.progress_percentage if item else 0})
    return {"id": roadmap.id, "title": roadmap.title, "summary": roadmap.summary,
            "duration_weeks": roadmap.duration_weeks, "skill_gaps": roadmap.skill_gaps,
            "phases": roadmap.phases, "recommendations": recommendations,
            "version": roadmap.version, "status": roadmap.status, "generated_at": roadmap.generated_at}


@router.get("/roadmaps/current")
def current_roadmap(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    roadmap = db.scalar(select(StudentRoadmap).where(StudentRoadmap.user_id == user.id).order_by(StudentRoadmap.version.desc()))
    return roadmap_payload(roadmap, user.id, db) if roadmap else None


@router.post("/courses/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll(course_id: uuid.UUID, roadmap_id: uuid.UUID | None = None,
           user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course or course.status != "published":
        raise HTTPException(status_code=404, detail="Course is not available")
    existing = db.scalar(select(CourseEnrollment).where(CourseEnrollment.user_id == user.id, CourseEnrollment.course_id == course_id))
    if existing:
        raise HTTPException(status_code=409, detail="You are already enrolled in this course")
    item = CourseEnrollment(user_id=user.id, course_id=course_id, roadmap_id=roadmap_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "course_id": course.id, "title": course.title, "status": item.status,
            "progress_percentage": item.progress_percentage, "enrolled_at": item.enrolled_at}


@router.get("/enrollments")
def enrollments(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    items = list(db.scalars(select(CourseEnrollment).where(CourseEnrollment.user_id == user.id).order_by(CourseEnrollment.enrolled_at.desc())))
    result = []
    for item in items:
        lesson_ids = [lesson.id for section in item.course.sections for lesson in section.lessons]
        completed = sum(1 for progress in item.lesson_progress if progress.status == "completed" and progress.lesson_id in lesson_ids)
        result.append({"id": item.id, "course_id": item.course_id, "title": item.course.title,
             "description": item.course.description, "level": item.course.level,
             "duration_hours": item.course.duration_hours, "status": item.status,
             "progress_percentage": item.progress_percentage, "lesson_count": len(lesson_ids),
             "completed_lessons": completed, "enrolled_at": item.enrolled_at})
    return result


@router.get("/courses/{course_id}")
def enrolled_course(course_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    enrollment = db.scalar(select(CourseEnrollment).where(
        CourseEnrollment.user_id == user.id, CourseEnrollment.course_id == course_id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course before opening it")
    progress = {item.lesson_id: item for item in enrollment.lesson_progress}
    course = enrollment.course
    return {"id": course.id, "title": course.title, "description": course.description,
        "level": course.level, "duration_hours": course.duration_hours, "skills": course.skills,
        "enrollment_id": enrollment.id, "progress_percentage": enrollment.progress_percentage,
        "sections": [{"id": section.id, "title": section.title, "sequence": section.sequence,
            "lessons": [{"id": lesson.id, "title": lesson.title, "lesson_type": lesson.lesson_type,
                "duration_minutes": lesson.duration_minutes, "sequence": lesson.sequence,
                "youtube_id": lesson.youtube_id, "article_content": lesson.article_content,
                "is_preview": lesson.is_preview,
                "status": progress[lesson.id].status if lesson.id in progress else "not_started",
                "last_position_seconds": progress[lesson.id].last_position_seconds if lesson.id in progress else 0,
                "watched_seconds": progress[lesson.id].watched_seconds if lesson.id in progress else 0,
                "video_duration_seconds": progress[lesson.id].video_duration_seconds if lesson.id in progress else None,
                "watched_percentage": round((progress[lesson.id].watched_seconds or 0) * 100 / progress[lesson.id].video_duration_seconds) if lesson.id in progress and progress[lesson.id].video_duration_seconds else 0}
                for lesson in section.lessons]}
            for section in course.sections]}


@router.put("/enrollments/{enrollment_id}/lessons/{lesson_id}/progress")
def save_lesson_progress(enrollment_id: uuid.UUID, lesson_id: uuid.UUID, payload: LessonProgressInput,
                         user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    enrollment = db.scalar(select(CourseEnrollment).where(
        CourseEnrollment.id == enrollment_id, CourseEnrollment.user_id == user.id))
    lesson = db.get(CourseLesson, lesson_id)
    if not enrollment or not lesson or lesson.section.course_id != enrollment.course_id:
        raise HTTPException(status_code=404, detail="Enrollment lesson was not found")
    if lesson.lesson_type in {"video", "quiz", "assignment"} and payload.status == "completed":
        raise HTTPException(status_code=422, detail=f"{lesson.lesson_type.title()} lessons cannot be completed manually")
    progress = db.scalar(select(LessonProgress).where(
        LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson.id))
    if not progress:
        progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=lesson.id)
        db.add(progress)
    previous_watched_seconds = progress.watched_seconds or 0
    previous_status = progress.status
    auto_completed = False
    if lesson.lesson_type == "video":
        if not lesson.youtube_id:
            raise HTTPException(status_code=422, detail="Video lesson has no YouTube video configured")
        if payload.duration_seconds is None or payload.previous_position_seconds is None:
            raise HTTPException(status_code=422, detail="Video progress requires duration and previous position")
        if payload.last_position_seconds > payload.duration_seconds + 2 or payload.previous_position_seconds > payload.duration_seconds + 2:
            raise HTTPException(status_code=422, detail="Playback position exceeds video duration")
        start = min(payload.previous_position_seconds, payload.last_position_seconds)
        end = max(payload.previous_position_seconds, payload.last_position_seconds)
        ranges = list(progress.watched_ranges or [])
        if payload.last_position_seconds >= payload.previous_position_seconds and 0 < end - start <= 20:
            ranges = merge_watched_range(ranges, start, min(end, payload.duration_seconds))
        progress.watched_ranges = ranges
        progress.watched_seconds = sum(end_value - start_value for start_value, end_value in ranges)
        progress.video_duration_seconds = payload.duration_seconds
        progress.last_position_seconds = min(payload.last_position_seconds, payload.duration_seconds)
        watched_percentage = round(progress.watched_seconds * 100 / payload.duration_seconds)
        if watched_percentage >= 90:
            auto_completed = progress.status != "completed"
            progress.status = "completed"
            progress.completed_at = progress.completed_at or datetime.now(timezone.utc)
        elif progress.status != "completed":
            progress.status = "in_progress"
            progress.completed_at = None
    else:
        progress.status = payload.status
        progress.watched_seconds = max(progress.watched_seconds or 0, payload.watched_seconds)
        progress.last_position_seconds = payload.last_position_seconds
        progress.completed_at = datetime.now(timezone.utc) if payload.status == "completed" else None
    watched_delta = max(0, (progress.watched_seconds or 0) - previous_watched_seconds)
    if watched_delta:
        db.add(StudentLearningActivity(user_id=user.id, enrollment_id=enrollment.id, lesson_id=lesson.id,
            activity_type="video_watched", seconds_delta=watched_delta,
            activity_data={"position_seconds": progress.last_position_seconds,
                "watched_percentage": round((progress.watched_seconds or 0) * 100 / progress.video_duration_seconds) if progress.video_duration_seconds else 0}))
    if progress.status == "completed" and previous_status != "completed":
        db.add(StudentLearningActivity(user_id=user.id, enrollment_id=enrollment.id, lesson_id=lesson.id,
            activity_type="lesson_completed", activity_data={"lesson_type": lesson.lesson_type}))
    db.flush()
    lesson_ids = [item.id for section in enrollment.course.sections for item in section.lessons]
    completed = db.scalar(select(func.count(LessonProgress.id)).where(
        LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id.in_(lesson_ids),
        LessonProgress.status == "completed")) if lesson_ids else 0
    enrollment.progress_percentage = round((completed or 0) * 100 / len(lesson_ids)) if lesson_ids else 0
    enrollment.status = "completed" if lesson_ids and completed == len(lesson_ids) else "in_progress"
    db.commit()
    return {"lesson_id": lesson.id, "status": progress.status,
        "watched_seconds": progress.watched_seconds, "last_position_seconds": progress.last_position_seconds,
        "watched_percentage": round((progress.watched_seconds or 0) * 100 / progress.video_duration_seconds) if progress.video_duration_seconds else 0,
        "auto_completed": auto_completed,
        "progress_percentage": enrollment.progress_percentage,
        "completed_lessons": completed or 0, "lesson_count": len(lesson_ids)}
