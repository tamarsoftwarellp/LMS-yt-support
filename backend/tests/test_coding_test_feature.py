import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.database import Base, get_db
from app.main import app
from app.models import Certificate, College, CollegeCourseAllocation, CollegeProgram, Program, User
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
        college = College(name="Coding Test Institute")
        program = Program(name="Computer Science")
        db.add_all([college, program])
        db.flush()
        db.add(CollegeProgram(college_id=college.id, program_id=program.id))
        db.commit()
        return str(college.id), str(program.id)


def seed_admin_user() -> str:
    with TestingSession() as db:
        admin = db.scalar(select(User).where(User.email == "coding-admin@example.com"))
        if not admin:
            db.add(User(email="coding-admin@example.com", mobile="9876540001",
                password_hash=hash_password("StrongPass123"), role="lms_admin"))
            db.commit()
    response = client.post("/api/v1/auth/admin/login",
        json={"email": "coding-admin@example.com", "password": "StrongPass123"})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def register_and_login_student(college_id: str, program_id: str) -> str:
    register = client.post("/api/v1/auth/student/register", json={
        "full_name": "Coding Student", "email": "coding-student@example.com",
        "mobile": "9876540002", "password": "StrongPass123",
        "college_id": college_id, "program_id": program_id,
        "current_year": "3rd Year", "accept_terms": True})
    assert register.status_code == 201, register.text
    login = client.post("/api/v1/auth/student/login",
        json={"email": "coding-student@example.com", "password": "StrongPass123"})
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


def test_coding_test_authoring_publish_validation_and_auto_certificate(monkeypatch) -> None:
    college_id, program_id = seed_master_data()
    admin_headers = {"Authorization": f"Bearer {seed_admin_user()}"}

    course = client.post("/api/v1/admin/courses", headers=admin_headers, json={
        "title": "Python Foundations", "slug": "python-foundations-coding-test",
        "description": "Learn Python basics.", "level": "Beginner", "duration_hours": 6,
        "skills": ["Python"], "status": "draft"})
    assert course.status_code == 201, course.text
    course_id = course.json()["id"]

    section = client.post(f"/api/v1/admin/courses/{course_id}/sections", headers=admin_headers,
        json={"title": "Basics"})
    assert section.status_code == 201, section.text
    section_id = section.json()["id"]

    lesson = client.post(f"/api/v1/admin/sections/{section_id}/lessons", headers=admin_headers,
        json={"title": "Sum Two Numbers", "lesson_type": "coding_test", "duration_minutes": 20})
    assert lesson.status_code == 201, lesson.text
    lesson_id = lesson.json()["id"]

    # A course with an unconfigured coding-test lesson must not be publishable.
    assert client.post(f"/api/v1/admin/courses/{course_id}/publish", headers=admin_headers).status_code == 422

    unconfigured = client.get(f"/api/v1/admin/lessons/{lesson_id}/coding-test", headers=admin_headers)
    assert unconfigured.status_code == 200 and unconfigured.json() is None

    saved = client.put(f"/api/v1/admin/lessons/{lesson_id}/coding-test", headers=admin_headers, json={
        "mode": "algorithmic",
        "problem_statement": "Read two integers from stdin and print their sum.",
        "supported_languages": ["python"],
        "starter_code": {"python": "a, b = map(int, input().split())\nprint(a + b)"},
        "maximum_attempts": 3,
        "time_limit_minutes": None,
        "passing_percentage": 100,
        "test_cases": [
            {"title": "Basic case", "is_hidden": False, "weight": 1, "stdin": "2 3", "expected_output": "5", "checks": []},
            {"title": "Hidden case", "is_hidden": True, "weight": 1, "stdin": "10 20", "expected_output": "30", "checks": []},
        ],
    })
    assert saved.status_code == 200, saved.text
    coding_test_id = saved.json()["id"]
    assert saved.json()["status"] == "draft"
    assert len(saved.json()["test_cases"]) == 2

    # Still not publishable until the coding test itself is published.
    assert client.post(f"/api/v1/admin/courses/{course_id}/publish", headers=admin_headers).status_code == 422

    published = client.post(f"/api/v1/admin/coding-tests/{coding_test_id}/publish", headers=admin_headers)
    assert published.status_code == 200 and published.json()["status"] == "published"

    assert client.post(f"/api/v1/admin/courses/{course_id}/publish", headers=admin_headers).status_code == 200

    with TestingSession() as db:
        db.add(CollegeCourseAllocation(
            college_id=uuid.UUID(college_id),
            course_id=uuid.UUID(course_id),
            program_id=uuid.UUID(program_id),
            is_active=True,
        ))
        db.commit()

    student_headers = {"Authorization": f"Bearer {register_and_login_student(college_id, program_id)}"}
    enroll = client.post(f"/api/v1/students/me/courses/{course_id}/enroll", headers=student_headers)
    assert enroll.status_code == 201, enroll.text

    fetched = client.get(f"/api/v1/students/me/lessons/{lesson_id}/coding-test", headers=student_headers)
    assert fetched.status_code == 200, fetched.text
    body = fetched.json()
    assert body["remaining_attempts"] == 3
    # Hidden test case's expected output must never reach the student.
    hidden_case = next(tc for tc in body["test_cases"] if tc["is_hidden"])
    assert "expected_output" not in hidden_case

    # Mock Piston: pretend both test cases pass, so we don't need real network access to
    # the execution service to verify the submission/grading/certificate wiring.
    async def fake_grade_submission(mode, language, source_files, test_cases):
        return [{"passed": True, "actual_output": tc.expected_output, "error_message": None} for tc in test_cases]

    monkeypatch.setattr("app.routers.coding_test.grade_submission", fake_grade_submission)

    run = client.post(f"/api/v1/students/me/coding-tests/{coding_test_id}/run", headers=student_headers,
        json={"language": "python", "source_files": {"code": "a, b = map(int, input().split())\nprint(a + b)"}})
    assert run.status_code == 200, run.text
    assert run.json()["passed_count"] == 1 and run.json()["total_count"] == 1  # only the visible case runs

    submit = client.post(f"/api/v1/students/me/coding-tests/{coding_test_id}/submit", headers=student_headers,
        json={"language": "python", "source_files": {"code": "a, b = map(int, input().split())\nprint(a + b)"}})
    assert submit.status_code == 201, submit.text
    result = submit.json()
    assert result["passed"] is True and result["percentage"] == 100
    assert result["certificate_issued"] is True
    assert result["certificate_id"]

    with TestingSession() as db:
        certificate = db.get(Certificate, uuid.UUID(result["certificate_id"]))
        assert certificate is not None and certificate.status == "issued"

    # A second submission attempt should be recorded as attempt #2.
    again = client.post(f"/api/v1/students/me/coding-tests/{coding_test_id}/submit", headers=student_headers,
        json={"language": "python", "source_files": {"code": "a, b = map(int, input().split())\nprint(a + b)"}})
    assert again.status_code == 201 and again.json()["attempt_number"] == 2
