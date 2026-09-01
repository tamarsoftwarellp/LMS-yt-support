import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.career_schemas import RoadmapDraft
from app.resume_builder_schemas import ResumeContent
from app.models import College, CollegeProgram, Course, CourseLesson, CourseSection, Program, User


engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, expire_on_commit=False)
Base.metadata.create_all(engine)


def override_db():
    with TestingSession() as db:
        yield db


app.dependency_overrides[get_db] = override_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_db_override():
    app.dependency_overrides[get_db] = override_db
    yield


def seed_master_data() -> tuple[str, str]:
    with TestingSession() as db:
        college = College(name="Test Institute")
        program = Program(name="Computer Science")
        db.add_all([college, program])
        db.flush()
        db.add(CollegeProgram(college_id=college.id, program_id=program.id))
        db.commit()
        return str(college.id), str(program.id)


def test_registration_creates_hashed_student_account() -> None:
    college_id, program_id = seed_master_data()
    response = client.post(
        "/api/v1/auth/student/register",
        json={
            "full_name": "  Arjun   Shah  ",
            "email": "ARJUN@example.com",
            "mobile": "9876543210",
            "password": "StrongPass123",
            "college_id": college_id,
            "program_id": program_id,
            "current_year": "4th Year",
            "roll_number": "CSE-101",
            "accept_terms": True,
        },
    )
    assert response.status_code == 201, response.text
    assert response.json()["full_name"] == "Arjun Shah"
    with TestingSession() as db:
        user = db.scalar(select(User).where(User.email == "arjun@example.com"))
        assert user is not None
        assert user.password_hash != "StrongPass123"
        assert user.role == "student"


def test_duplicate_email_is_rejected() -> None:
    with TestingSession() as db:
        mapping = db.scalar(select(CollegeProgram))
        assert mapping is not None
    payload = {
        "full_name": "Another Student",
        "email": "arjun@example.com",
        "mobile": "9876543211",
        "password": "StrongPass123",
        "college_id": str(mapping.college_id),
        "program_id": str(mapping.program_id),
        "current_year": "2nd Year",
        "accept_terms": True,
    }
    response = client.post("/api/v1/auth/student/register", json=payload)
    assert response.status_code == 409


def test_invalid_college_program_pair_is_rejected() -> None:
    with TestingSession() as db:
        college = db.scalar(select(College))
        other_program = Program(name="Mechanical Engineering")
        db.add(other_program)
        db.commit()
        college_id = str(college.id)
        other_program_id = str(other_program.id)
    response = client.post(
        "/api/v1/auth/student/register",
        json={
            "full_name": "Meera Singh",
            "email": "meera@example.com",
            "mobile": "9876543212",
            "password": "StrongPass123",
            "college_id": college_id,
            "program_id": other_program_id,
            "current_year": "1st Year",
            "accept_terms": True,
        },
    )
    assert response.status_code == 422


def test_registered_student_can_login_and_save_onboarding() -> None:
    login = client.post(
        "/api/v1/auth/student/login",
        json={"email": "arjun@example.com", "password": "StrongPass123"},
    )
    assert login.status_code == 200, login.text
    tokens = login.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["full_name"] == "Arjun Shah"

    saved = client.put(
        "/api/v1/students/me/onboarding/profile",
        headers=headers,
        json={"status": "completed", "data": {"controls": {"Date of Birth": "2002-01-01"}}},
    )
    assert saved.status_code == 200, saved.text
    assert saved.json()["step_key"] == "profile"

    progress = client.get("/api/v1/students/me/onboarding", headers=headers)
    assert progress.status_code == 200
    assert progress.json()["current_step"] == 2
    assert progress.json()["overall_percentage"] == 14

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["refresh_token"] != tokens["refresh_token"]


def test_career_flow_generates_recommendations_and_enrolls(monkeypatch) -> None:
    login = client.post("/api/v1/auth/student/login", json={"email": "arjun@example.com", "password": "StrongPass123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    with TestingSession() as db:
        course = Course(title="JavaScript Career Track", slug="javascript-career-track", description="Modern JavaScript for web careers.", level="Beginner", duration_hours=20, skills=["JavaScript"], status="published")
        db.add(course)
        db.flush()
        section = CourseSection(course_id=course.id, title="JavaScript Foundations", sequence=1)
        db.add(section)
        db.flush()
        db.add_all([
            CourseLesson(section_id=section.id, title="Variables", lesson_type="article", duration_minutes=10, sequence=1, is_preview=True, article_content="Preview content"),
            CourseLesson(section_id=section.id, title="Functions", lesson_type="quiz", duration_minutes=15, sequence=2),
        ])
        db.commit()

    skills = client.put("/api/v1/students/me/skills", headers=headers, json=[{
        "name": "HTML", "category": "Frontend", "proficiency_level": "Intermediate", "experience_months": 6
    }])
    assert skills.status_code == 200, skills.text
    goal = client.put("/api/v1/students/me/career-goal", headers=headers, json={
        "target_role": "Frontend Developer", "preferred_domain": "Web Development",
        "current_level": "Beginner", "target_duration_months": 3,
        "weekly_learning_hours": 8, "goal_description": "Become job ready"
    })
    assert goal.status_code == 200, goal.text

    draft = RoadmapDraft.model_validate({
        "title": "Frontend Roadmap", "summary": "Build a strong frontend foundation.", "duration_weeks": 12,
        "skill_gaps": [{"skill": "JavaScript", "priority": "high", "reason": "Required for frontend work"}],
        "phases": [{"sequence": 1, "title": "JavaScript Foundation", "duration_weeks": 4,
                    "objective": "Learn modern JavaScript", "skills": ["JavaScript"],
                    "milestones": ["Complete fundamentals"],
                    "projects": [{"title": "Task app", "description": "Build a browser task app"}]}],
    })
    monkeypatch.setattr("app.career_router.generate_roadmap", lambda snapshot: (draft, "test-model"))
    roadmap = client.post("/api/v1/students/me/roadmaps/generate", headers=headers)
    assert roadmap.status_code == 201, roadmap.text
    body = roadmap.json()
    assert body["recommendations"][0]["title"] == "JavaScript Career Track"

    enrollment = client.post(
        f"/api/v1/students/me/courses/{body['recommendations'][0]['course_id']}/enroll?roadmap_id={body['id']}",
        headers=headers,
    )
    assert enrollment.status_code == 201, enrollment.text
    assert client.get("/api/v1/students/me/enrollments", headers=headers).json()[0]["title"] == "JavaScript Career Track"

    course = client.get(f"/api/v1/students/me/courses/{body['recommendations'][0]['course_id']}", headers=headers)
    assert course.status_code == 200, course.text
    assert len(course.json()["sections"][0]["lessons"]) == 2
    lesson_id = course.json()["sections"][0]["lessons"][0]["id"]
    progress = client.put(
        f"/api/v1/students/me/enrollments/{enrollment.json()['id']}/lessons/{lesson_id}/progress",
        headers=headers, json={"status": "completed", "watched_seconds": 600, "last_position_seconds": 600})
    assert progress.status_code == 200, progress.text
    assert progress.json()["progress_percentage"] == 50
    assert client.get("/api/v1/students/me/roadmaps/current", headers=headers).json()["recommendations"][0]["progress_percentage"] == 50

    with TestingSession() as db:
        other = Course(title="Advanced Data Structures", slug="advanced-data-structures", description="Deep dive into DSA.", level="Advanced", duration_hours=30, skills=["DSA"], status="published")
        draft_course = Course(title="Unpublished Draft Course", slug="unpublished-draft-course", description="Not ready yet.", level="Beginner", duration_hours=5, skills=["Draft"], status="draft")
        db.add_all([other, draft_course]); db.flush()
        dsa_section = CourseSection(course_id=other.id, title="Trees", sequence=1)
        db.add(dsa_section); db.flush()
        db.add_all([
            CourseLesson(section_id=dsa_section.id, title="Intro to Trees", lesson_type="article", duration_minutes=8, sequence=1, is_preview=True, article_content="Free preview lesson"),
            CourseLesson(section_id=dsa_section.id, title="Balanced Trees", lesson_type="video", duration_minutes=20, sequence=2, is_preview=False, youtube_id="dQw4w9WgXcQ"),
        ])
        db.commit()
        dsa_course_id = other.id

    catalog = client.get("/api/v1/students/me/courses/catalog", headers=headers)
    assert catalog.status_code == 200, catalog.text
    catalog_body = catalog.json()
    titles = [item["title"] for item in catalog_body["items"]]
    assert "JavaScript Career Track" in titles
    assert "Advanced Data Structures" in titles
    assert "Unpublished Draft Course" not in titles
    js_entry = next(item for item in catalog_body["items"] if item["title"] == "JavaScript Career Track")
    assert js_entry["is_enrolled"] is True
    assert js_entry["enrollment_id"] == body["id"] or js_entry["enrollment_id"]
    assert js_entry["enrollment_count"] == 1
    dsa_entry = next(item for item in catalog_body["items"] if item["title"] == "Advanced Data Structures")
    assert dsa_entry["is_enrolled"] is False
    assert set(catalog_body["levels"]) == {"Beginner", "Advanced"}

    level_filtered = client.get("/api/v1/students/me/courses/catalog?level=Advanced", headers=headers)
    assert [item["title"] for item in level_filtered.json()["items"]] == ["Advanced Data Structures"]

    search_filtered = client.get("/api/v1/students/me/courses/catalog?search=javascript", headers=headers)
    assert [item["title"] for item in search_filtered.json()["items"]] == ["JavaScript Career Track"]

    preview = client.get(f"/api/v1/students/me/courses/{dsa_course_id}", headers=headers)
    assert preview.status_code == 200, preview.text
    preview_body = preview.json()
    assert preview_body["is_enrolled"] is False
    assert preview_body["enrollment_id"] is None
    preview_lessons = preview_body["sections"][0]["lessons"]
    assert preview_lessons[0]["is_preview"] is True and preview_lessons[0]["locked"] is False
    assert preview_lessons[0]["article_content"] == "Free preview lesson"
    assert preview_lessons[1]["is_preview"] is False and preview_lessons[1]["locked"] is True
    assert preview_lessons[1]["youtube_id"] is None


def test_student_generates_edits_scores_and_downloads_ats_resume(monkeypatch) -> None:
    login = client.post("/api/v1/auth/student/login", json={"email": "arjun@example.com", "password": "StrongPass123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    builder = client.get("/api/v1/students/me/resume-builder", headers=headers)
    assert builder.status_code == 200, builder.text
    profile = builder.json()["profile"]
    profile.update({"headline": "Backend Developer", "github_url": "https://github.com/arjun", "projects": [{"title": "LMS API", "subtitle": "Student project", "bullets": ["Built REST APIs using FastAPI"], "technologies": ["Python", "FastAPI"]}]})
    assert client.put("/api/v1/students/me/resume-builder", headers=headers, json=profile).status_code == 200

    content = ResumeContent(professional_summary="Computer science student building reliable backend applications with Python and FastAPI.", skills=["Python", "FastAPI"], educations=profile["educations"], experiences=[], projects=profile["projects"], certifications=[], achievements=[], languages=["English"])
    monkeypatch.setattr("app.resume_builder_router.generate_resume_content", lambda snapshot: (content, "test-groq-model"))
    created = client.post("/api/v1/students/me/resumes/generate", headers=headers, json={"target_role": "Backend Developer"})
    assert created.status_code == 201, created.text
    resume = created.json()
    assert resume["version"] == 1
    assert 0 <= resume["ats"]["score"] <= 100
    assert "contact" in resume

    resume["content"]["skills"].append("SQL")
    updated = client.put(f"/api/v1/students/me/resumes/{resume['id']}", headers=headers, json={"title": "Backend Resume", "content": resume["content"]})
    assert updated.status_code == 200, updated.text
    assert updated.json()["title"] == "Backend Resume"
    pdf = client.get(f"/api/v1/students/me/resumes/{resume['id']}/download", headers=headers)
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")


def test_resume_builder_auto_syncs_completed_courses() -> None:
    login = client.post("/api/v1/auth/student/login", json={"email": "arjun@example.com", "password": "StrongPass123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    with TestingSession() as db:
        course = Course(title="Git Fundamentals", slug="git-fundamentals", description="Version control basics.", level="Beginner", duration_hours=4, skills=["Git"], status="published")
        db.add(course); db.flush()
        section = CourseSection(course_id=course.id, title="Basics", sequence=1)
        db.add(section); db.flush()
        db.add(CourseLesson(section_id=section.id, title="Intro to Git", lesson_type="article", duration_minutes=10, sequence=1, article_content="Git basics"))
        db.commit()
        course_id = course.id

    enroll = client.post(f"/api/v1/students/me/courses/{course_id}/enroll", headers=headers)
    assert enroll.status_code == 201, enroll.text
    enrollment_id = enroll.json()["id"]
    detail = client.get(f"/api/v1/students/me/courses/{course_id}", headers=headers).json()
    lesson_id = detail["sections"][0]["lessons"][0]["id"]
    progress = client.put(
        f"/api/v1/students/me/enrollments/{enrollment_id}/lessons/{lesson_id}/progress",
        headers=headers, json={"status": "completed", "watched_seconds": 0, "last_position_seconds": 0})
    assert progress.status_code == 200, progress.text
    assert progress.json()["progress_percentage"] == 100

    builder = client.get("/api/v1/students/me/resume-builder", headers=headers)
    assert builder.status_code == 200, builder.text
    titles = [item["title"] for item in builder.json()["profile"]["certifications"]]
    assert "Git Fundamentals" in titles
    entry = next(item for item in builder.json()["profile"]["certifications"] if item["title"] == "Git Fundamentals")
    assert entry["subtitle"] == "Completed via EduConnect LMS"

    again = client.get("/api/v1/students/me/resume-builder", headers=headers)
    titles_again = [item["title"] for item in again.json()["profile"]["certifications"]]
    assert titles_again.count("Git Fundamentals") == 1







