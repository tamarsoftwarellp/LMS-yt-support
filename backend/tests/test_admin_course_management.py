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
from app.models import AssignmentSubmission, Certificate, College, CollegeProgram, Course, CourseEnrollment, CourseLesson, CourseSection, LessonProgress, Program, User
from app.security import hash_password
from app.admin_course_router import _extract_youtube_id
from app.admin_schemas import AdminLessonIn


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


def test_full_youtube_url_with_playlist_query_is_accepted() -> None:
    url = "https://youtu.be/eWqPsQRgfUc?list=PL8p2l"
    payload = AdminLessonIn(title="HTTP and REST", lesson_type="video", duration_minutes=15, youtube_id=url)
    assert payload.youtube_id == url
    assert _extract_youtube_id(payload.youtube_id) == "eWqPsQRgfUc"


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
    profile = client.get("/api/v1/auth/admin/me", headers={"Authorization": f"Bearer {response.json()['access_token']}"})
    assert profile.status_code == 200, profile.text
    assert profile.json()["email"] == "admin@example.com"
    assert profile.json()["role"] == "admin"


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


def test_assignment_submission_evaluation_rbac_and_progress() -> None:
    seed_admin_user()
    admin_headers = {"Authorization": f"Bearer {login_admin()}"}
    with TestingSession() as db:
        student = User(email="assignment.student@example.com", mobile="9876543288",
                       password_hash=hash_password("StrongPass123"), role="student")
        course = Course(title="Assignment Course", slug="assignment-course", description="Project course",
                        level="Beginner", duration_hours=3, skills=["Projects"], status="published")
        db.add_all([student, course]); db.flush()
        section = CourseSection(course_id=course.id, title="Project", sequence=1)
        db.add(section); db.flush()
        lesson = CourseLesson(section_id=section.id, title="Build a Project", lesson_type="assignment",
                              duration_minutes=60, sequence=1)
        db.add(lesson); db.flush()
        enrollment = CourseEnrollment(user_id=student.id, course_id=course.id)
        db.add(enrollment); db.commit()
        lesson_id, enrollment_id = lesson.id, enrollment.id

    configured = client.put(f"/api/v1/admin/lessons/{lesson_id}/assignment", headers=admin_headers, json={
        "instructions": "Submit a project explanation", "maximum_marks": 50, "passing_marks": 25,
        "maximum_attempts": 2, "allowed_submission_types": ["text", "link"],
        "allowed_file_extensions": [], "maximum_file_size_mb": 10, "allow_late_submission": False,
        "allow_resubmission": True
    })
    assert configured.status_code == 200, configured.text
    assignment_id = configured.json()["id"]
    assert client.post(f"/api/v1/admin/assignments/{assignment_id}/publish", headers=admin_headers).status_code == 200

    login = client.post("/api/v1/auth/student/login", json={"email": "assignment.student@example.com", "password": "StrongPass123"})
    student_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert client.get("/api/v1/admin/assignment-submissions", headers=student_headers).status_code == 403
    opened = client.get(f"/api/v1/students/me/lessons/{lesson_id}/assignment", headers=student_headers)
    assert opened.status_code == 200, opened.text
    manual = client.put(f"/api/v1/students/me/enrollments/{enrollment_id}/lessons/{lesson_id}/progress",
        headers=student_headers, json={"status": "completed", "watched_seconds": 0, "last_position_seconds": 0})
    assert manual.status_code == 422
    submitted = client.post(f"/api/v1/students/me/assignments/{assignment_id}/submissions", headers=student_headers,
        data={"status": "submitted", "text_content": "My completed project", "link_url": "https://example.com/project"})
    assert submitted.status_code == 201, submitted.text
    submission_id = submitted.json()["id"]

    listed = client.get("/api/v1/admin/assignment-submissions", headers=admin_headers)
    assert listed.status_code == 200, listed.text
    assert any(item["id"] == submission_id for item in listed.json())
    invalid_pass = client.post(f"/api/v1/admin/assignment-submissions/{submission_id}/evaluate", headers=admin_headers,
        json={"marks_awarded": 20, "decision": "passed", "feedback": "Below pass marks"})
    assert invalid_pass.status_code == 422
    evaluated = client.post(f"/api/v1/admin/assignment-submissions/{submission_id}/evaluate", headers=admin_headers,
        json={"marks_awarded": 45, "decision": "passed", "feedback": "Good project"})
    assert evaluated.status_code == 200, evaluated.text
    assert evaluated.json()["evaluation"]["decision"] == "passed"
    with TestingSession() as db:
        enrollment = db.get(CourseEnrollment, enrollment_id)
        submission = db.get(AssignmentSubmission, uuid.UUID(submission_id))
        assert enrollment.progress_percentage == 100
        assert enrollment.status == "completed"
        assert submission.status == "evaluated"


def test_youtube_progress_resume_seek_guard_and_auto_completion() -> None:
    with TestingSession() as db:
        student = User(email="video.student@example.com", mobile="9876543277",
                       password_hash=hash_password("StrongPass123"), role="student")
        course = Course(title="YouTube Progress Course", slug="youtube-progress-course", description="Video course",
                        level="Beginner", duration_hours=1, skills=["Video"], status="published")
        db.add_all([student, course]); db.flush()
        section = CourseSection(course_id=course.id, title="Videos", sequence=1)
        db.add(section); db.flush()
        lesson = CourseLesson(section_id=section.id, title="YouTube Lesson", lesson_type="video",
                              duration_minutes=2, sequence=1, youtube_id="dQw4w9WgXcQ")
        db.add(lesson); db.flush()
        enrollment = CourseEnrollment(user_id=student.id, course_id=course.id)
        db.add(enrollment); db.commit()
        course_id, lesson_id, enrollment_id = course.id, lesson.id, enrollment.id

    login = client.post("/api/v1/auth/student/login", json={"email": "video.student@example.com", "password": "StrongPass123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    endpoint = f"/api/v1/students/me/enrollments/{enrollment_id}/lessons/{lesson_id}/progress"
    manual = client.put(endpoint, headers=headers, json={"status": "completed", "last_position_seconds": 90})
    assert manual.status_code == 422

    first = client.put(endpoint, headers=headers, json={"status": "in_progress", "previous_position_seconds": 0,
        "last_position_seconds": 10, "duration_seconds": 100})
    assert first.status_code == 200, first.text
    assert first.json()["watched_seconds"] == 10
    seek = client.put(endpoint, headers=headers, json={"status": "in_progress", "previous_position_seconds": 10,
        "last_position_seconds": 80, "duration_seconds": 100})
    assert seek.status_code == 200
    assert seek.json()["watched_seconds"] == 10
    assert seek.json()["last_position_seconds"] == 80

    previous = 10
    result = None
    for current in range(20, 91, 10):
        result = client.put(endpoint, headers=headers, json={"status": "in_progress",
            "previous_position_seconds": previous, "last_position_seconds": current, "duration_seconds": 100})
        assert result.status_code == 200, result.text
        previous = current
    assert result.json()["status"] == "completed"
    assert result.json()["watched_percentage"] == 90
    assert result.json()["auto_completed"] is True
    course = client.get(f"/api/v1/students/me/courses/{course_id}", headers=headers)
    video = course.json()["sections"][0]["lessons"][0]
    assert video["last_position_seconds"] == 90
    assert video["watched_percentage"] == 90
    with TestingSession() as db:
        enrollment = db.get(CourseEnrollment, enrollment_id)
        assert enrollment.progress_percentage == 100
        assert enrollment.status == "completed"

    dashboard = client.get("/api/v1/students/me/dashboard", headers=headers)
    assert dashboard.status_code == 200, dashboard.text
    assert dashboard.json()["summary"]["completed_lessons"] >= 1
    assert dashboard.json()["summary"]["learning_minutes"] >= 1
    assert len(dashboard.json()["weekly_activity"]) == 7
    assert client.get("/api/v1/admin/analytics/overview", headers=headers).status_code == 403

    seed_admin_user()
    admin_headers = {"Authorization": f"Bearer {login_admin()}"}
    overview = client.get("/api/v1/admin/analytics/overview", headers=admin_headers)
    assert overview.status_code == 200, overview.text
    assert overview.json()["summary"]["total_students"] >= 1
    assert overview.json()["summary"]["video_learning_minutes"] >= 1


def test_certificate_issue_pdf_verify_revoke_and_reissue() -> None:
    seed_admin_user()
    with TestingSession() as db:
        student = User(email="certificate.student@example.com", mobile="9876543266",
                       password_hash=hash_password("StrongPass123"), role="student")
        course = Course(title="Certificate Course", slug="certificate-course", description="Completed course",
                        level="Beginner", duration_hours=1, skills=["Learning"], status="published",
                        instructor_name="EduConnect Instructor")
        db.add_all([student, course]); db.flush()
        section = CourseSection(course_id=course.id, title="Module", sequence=1)
        db.add(section); db.flush()
        lesson = CourseLesson(section_id=section.id, title="Complete Me", lesson_type="article",
                              duration_minutes=10, sequence=1, article_content="Done")
        db.add(lesson); db.flush()
        enrollment = CourseEnrollment(user_id=student.id, course_id=course.id, status="completed", progress_percentage=100)
        db.add(enrollment); db.flush()
        db.add(LessonProgress(enrollment_id=enrollment.id, lesson_id=lesson.id, status="completed"))
        db.commit(); enrollment_id = enrollment.id

    login = client.post("/api/v1/auth/student/login", json={"email": "certificate.student@example.com", "password": "StrongPass123"})
    student_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    issued = client.post(f"/api/v1/students/me/enrollments/{enrollment_id}/certificate", headers=student_headers)
    assert issued.status_code == 201, issued.text
    certificate = issued.json(); certificate_id = certificate["id"]
    duplicate = client.post(f"/api/v1/students/me/enrollments/{enrollment_id}/certificate", headers=student_headers)
    assert duplicate.status_code == 200
    assert duplicate.json()["id"] == certificate_id
    download = client.get(f"/api/v1/students/me/certificates/{certificate_id}/download", headers=student_headers)
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert download.content.startswith(b"%PDF")
    verified = client.get(f"/api/v1/certificates/verify/{certificate['verification_token']}")
    assert verified.status_code == 200 and verified.json()["is_valid"] is True
    assert "email" not in verified.json()
    assert client.get("/api/v1/admin/certificates", headers=student_headers).status_code == 403

    admin_headers = {"Authorization": f"Bearer {login_admin()}"}
    listed = client.get("/api/v1/admin/certificates?search=Certificate+Course", headers=admin_headers)
    assert listed.status_code == 200 and any(item["id"] == certificate_id for item in listed.json())
    revoked = client.post(f"/api/v1/admin/certificates/{certificate_id}/revoke", headers=admin_headers,
                          json={"reason": "Certificate details require correction"})
    assert revoked.status_code == 200
    assert client.get(f"/api/v1/certificates/verify/{certificate['verification_token']}").json()["is_valid"] is False
    assert client.get(f"/api/v1/students/me/certificates/{certificate_id}/download", headers=student_headers).status_code == 409
    reissued = client.post(f"/api/v1/admin/certificates/{certificate_id}/reissue", headers=admin_headers)
    assert reissued.status_code == 201, reissued.text
    assert reissued.json()["certificate_number"] != certificate["certificate_number"]
    with TestingSession() as db:
        assert len(db.scalars(select(Certificate).where(Certificate.enrollment_id == enrollment_id)).all()) == 2
