import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.database import Base, get_db
from app.main import app
from app.models import College, CollegeProgram, Course, CourseEnrollment, CourseLesson, CourseSection, Program, User
from app.security import hash_password


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
        college = db.scalar(select(College).where(College.name == "Test Institute"))
        if not college:
            college = College(name="Test Institute")
            db.add(college)
        program = db.scalar(select(Program).where(Program.name == "Computer Science"))
        if not program:
            program = Program(name="Computer Science")
            db.add(program)
        db.flush()
        if not db.scalar(select(CollegeProgram.id).where(CollegeProgram.college_id == college.id, CollegeProgram.program_id == program.id)):
            db.add(CollegeProgram(college_id=college.id, program_id=program.id))
        db.commit()
        return str(college.id), str(program.id)


def seed_admin_user() -> None:
    with TestingSession() as db:
        admin = db.scalar(select(User).where(User.email == "admin@example.com"))
        if not admin:
            db.add(User(email="admin@example.com", mobile="9876543210", password_hash=hash_password("StrongPass123"), role="admin"))
            db.commit()


def login_admin() -> str:
    response = client.post("/api/v1/auth/admin/login", json={"email": "admin@example.com", "password": "StrongPass123"})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_admin_can_log_in() -> None:
    seed_admin_user()
    response = client.post("/api/v1/auth/admin/login", json={"email": "admin@example.com", "password": "StrongPass123"})
    assert response.status_code == 200, response.text
    assert response.json()["access_token"]


def test_student_cannot_log_in_as_admin() -> None:
    seed_master_data()
    with TestingSession() as db:
        db.add(User(email="student@example.com", mobile="9876543211", password_hash=hash_password("StrongPass123"), role="student"))
        db.commit()
    response = client.post("/api/v1/auth/admin/login", json={"email": "student@example.com", "password": "StrongPass123"})
    assert response.status_code == 401


def test_admin_rbac_and_course_crud() -> None:
    seed_admin_user()
    headers = {"Authorization": f"Bearer {login_admin()}"}

    assert client.get("/api/v1/admin/courses").status_code == 401
    assert client.get("/api/v1/admin/courses", headers={"Authorization": "Bearer invalid"}).status_code == 401

    create = client.post(
        "/api/v1/admin/courses",
        headers=headers,
        json={
            "title": "Admin Python Track",
            "slug": "admin-python-track",
            "description": "Learn backend admin APIs.",
            "level": "Beginner",
            "duration_hours": 12,
            "skills": ["Python"],
            "status": "draft",
        },
    )
    assert create.status_code == 201, create.text
    course_id = create.json()["id"]
    assert create.json()["created_by_user_id"] is not None

    bypass_publish = client.put(f"/api/v1/admin/courses/{course_id}", headers=headers, json={"status": "published"})
    assert bypass_publish.status_code == 422

    published_create = client.post(
        "/api/v1/admin/courses", headers=headers,
        json={"title": "Unsafe Publish", "description": "Must remain a draft", "level": "Beginner",
              "duration_hours": 2, "skills": ["Python"], "status": "published"})
    assert published_create.status_code == 422

    duplicate = client.post(
        "/api/v1/admin/courses",
        headers=headers,
        json={
            "title": "Another Course",
            "slug": "admin-python-track",
            "description": "Duplicate slug.",
            "level": "Beginner",
            "duration_hours": 8,
            "skills": ["Python"],
            "status": "draft",
        },
    )
    assert duplicate.status_code == 409

    update = client.put(
        f"/api/v1/admin/courses/{course_id}",
        headers=headers,
        json={"description": "Updated description", "skills": ["Python", "FastAPI"]},
    )
    assert update.status_code == 200, update.text

    section = client.post(f"/api/v1/admin/courses/{course_id}/sections", headers=headers, json={"title": "Getting Started"})
    assert section.status_code == 201, section.text
    section_id = section.json()["id"]
    lesson = client.post(
        f"/api/v1/admin/sections/{section_id}/lessons",
        headers=headers,
        json={"title": "Intro", "lesson_type": "article", "duration_minutes": 10, "article_content": "Hello world", "is_preview": True},
    )
    assert lesson.status_code == 201, lesson.text

    assert client.post(f"/api/v1/admin/courses/{course_id}/publish", headers=headers).status_code == 200
    assert client.post(f"/api/v1/admin/courses/{course_id}/archive", headers=headers).status_code == 200
    assert client.post(f"/api/v1/admin/courses/{course_id}/restore", headers=headers).status_code == 200


def test_course_with_enrollment_cannot_be_deleted() -> None:
    seed_master_data()
    seed_admin_user()
    headers = {"Authorization": f"Bearer {login_admin()}"}
    with TestingSession() as db:
        course = Course(title="Deletion Guard", slug="deletion-guard", description="Guarded course", level="Beginner", duration_hours=5, skills=["Python"], status="draft")
        db.add(course)
        db.flush()
        section = CourseSection(course_id=course.id, title="Section 1", sequence=1)
        db.add(section)
        db.flush()
        db.add(CourseLesson(section_id=section.id, title="Lesson 1", lesson_type="article", duration_minutes=10, sequence=1, article_content="Hello"))
        student = User(email="learner@example.com", mobile="9876543212", password_hash=hash_password("StrongPass123"), role="student")
        db.add(student)
        db.flush()
        db.add(CourseEnrollment(user_id=student.id, course_id=course.id))
        db.commit()
    assert client.delete(f"/api/v1/admin/courses/{course.id}", headers=headers).status_code == 409


def test_quiz_scoring_attempt_limit_and_progress() -> None:
    seed_admin_user()
    admin_headers = {"Authorization": f"Bearer {login_admin()}"}
    with TestingSession() as db:
        student = User(email="quiz.student@example.com", mobile="9876543299",
                       password_hash=hash_password("StrongPass123"), role="student")
        course = Course(title="Quiz Course", slug="quiz-course", description="Assessment course",
                        level="Beginner", duration_hours=2, skills=["Testing"], status="published")
        db.add_all([student, course]); db.flush()
        section = CourseSection(course_id=course.id, title="Assessment", sequence=1)
        db.add(section); db.flush()
        lesson = CourseLesson(section_id=section.id, title="Final Quiz", lesson_type="quiz", duration_minutes=10, sequence=1)
        db.add(lesson); db.flush()
        enrollment = CourseEnrollment(user_id=student.id, course_id=course.id)
        db.add(enrollment); db.commit()
        lesson_id, enrollment_id = lesson.id, enrollment.id

    saved = client.put(f"/api/v1/admin/lessons/{lesson_id}/quiz", headers=admin_headers, json={
        "instructions": "Pass the quiz", "passing_percentage": 50, "maximum_attempts": 1,
        "show_explanations": True, "questions": [{"question_text": "FastAPI is a Python framework?",
            "question_type": "true_false", "marks": 2, "explanation": "FastAPI uses Python.",
            "options": [{"option_text": "True", "is_correct": True}, {"option_text": "False", "is_correct": False}]}]
    })
    assert saved.status_code == 200, saved.text
    quiz_id = saved.json()["id"]
    assert client.post(f"/api/v1/admin/quizzes/{quiz_id}/publish", headers=admin_headers).status_code == 200

    login = client.post("/api/v1/auth/student/login", json={"email": "quiz.student@example.com", "password": "StrongPass123"})
    student_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    public_quiz = client.get(f"/api/v1/students/me/lessons/{lesson_id}/quiz", headers=student_headers)
    assert public_quiz.status_code == 200, public_quiz.text
    assert "is_correct" not in str(public_quiz.json())
    question = public_quiz.json()["questions"][0]
    attempt = client.post(f"/api/v1/students/me/quizzes/{quiz_id}/attempts", headers=student_headers)
    assert attempt.status_code == 201
    result = client.post(f"/api/v1/students/me/quiz-attempts/{attempt.json()['id']}/submit", headers=student_headers,
        json={"answers": [{"question_id": question["id"], "selected_option_ids": [question["options"][0]["id"]]}]})
    assert result.status_code == 200, result.text
    assert result.json()["passed"] is True
    assert result.json()["percentage"] == 100
    assert client.post(f"/api/v1/students/me/quizzes/{quiz_id}/attempts", headers=student_headers).status_code == 409
    with TestingSession() as db:
        enrollment = db.get(CourseEnrollment, enrollment_id)
        assert enrollment.progress_percentage == 100
        assert enrollment.status == "completed"



