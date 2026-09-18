import os
import uuid

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import (
    College,
    CollegeAuditLog,
    CollegeFaculty,
    Course,
    CourseEnrollment,
    CourseLesson,
    CourseSection,
    StudentProfile,
    User,
    Program,
)
from app.security import create_access_token, hash_password

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


def seed_super_admin() -> str:
    with TestingSession() as db:
        existing = db.scalar(select(User).where(User.email == "owner@educonnect.dev"))
        if not existing:
            db.add(
                User(
                    email="owner@educonnect.dev",
                    mobile="9000000000",
                    password_hash=hash_password("OwnerPass123"),
                    role="lms_admin",
                )
            )
            db.commit()
    login = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "owner@educonnect.dev", "password": "OwnerPass123"},
    )
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


def register_college(
    name="Riverside Institute of Technology",
    admin_email="admin@riverside.edu",
    admin_mobile="9876500002",
) -> dict:
    response = client.post(
        "/api/v1/institutions/register",
        json={
            "college_name": name,
            "contact_name": "Priya Sharma",
            "contact_email": "priya@riverside.edu",
            "contact_phone": "9876500001",
            "address": "12 College Road",
            "admin_full_name": "Priya Sharma",
            "admin_email": admin_email,
            "admin_mobile": admin_mobile,
            "admin_password": "AdminPass123",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_full_registration_approval_and_admin_login_flow():
    super_token = seed_super_admin()
    super_headers = {"Authorization": f"Bearer {super_token}"}

    registered = register_college()
    assert registered["status"] == "pending"
    college_id = registered["college_id"]

    # Pending colleges must never appear in student registration masters.
    public_colleges = client.get("/api/v1/masters/colleges")
    assert public_colleges.status_code == 200
    assert all(item["id"] != college_id for item in public_colleges.json())
    pending_programs = client.get(f"/api/v1/masters/colleges/{college_id}/programs")
    assert pending_programs.status_code == 404
    blocked_registration = client.post(
        "/api/v1/auth/student/register",
        json={
            "full_name": "Pending College Student",
            "email": "pending.student@example.com",
            "mobile": "9876500011",
            "password": "StudentPass123",
            "college_id": college_id,
            "program_id": str(uuid.uuid4()),
            "current_year": "Year 1",
            "accept_terms": True,
        },
    )
    assert blocked_registration.status_code == 422
    assert "approved colleges" in blocked_registration.json()["detail"]

    duplicate = client.post(
        "/api/v1/institutions/register",
        json={
            "college_name": "Riverside Institute of Technology",
            "contact_name": "X",
            "contact_email": "x@x.com",
            "contact_phone": "9111111111",
            "admin_full_name": "X",
            "admin_email": "other@riverside.edu",
            "admin_mobile": "9111111112",
            "admin_password": "AdminPass123",
        },
    )
    assert duplicate.status_code == 422

    blocked_login = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@riverside.edu", "password": "AdminPass123"},
    )
    assert blocked_login.status_code == 401

    pending_list = client.get(
        "/api/v1/lms-admin/institutions?status=pending", headers=super_headers
    )
    assert pending_list.status_code == 200, pending_list.text
    assert any(item["id"] == college_id for item in pending_list.json())

    non_super_admin_attempt = client.get(
        "/api/v1/lms-admin/institutions",
        headers={"Authorization": f"Bearer {super_token}x"},
    )
    assert non_super_admin_attempt.status_code == 401

    approve = client.post(
        f"/api/v1/lms-admin/institutions/{college_id}/approve", headers=super_headers
    )
    assert approve.status_code == 200, approve.text
    assert approve.json()["status"] == "active"

    approved_colleges = client.get("/api/v1/masters/colleges")
    assert any(item["id"] == college_id for item in approved_colleges.json())

    admin_login = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@riverside.edu", "password": "AdminPass123"},
    )
    assert admin_login.status_code == 200, admin_login.text
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}
    me = client.get("/api/v1/auth/admin/me", headers=admin_headers)
    assert me.status_code == 200, me.text
    assert me.json()["college_name"] == "Riverside Institute of Technology"

    # College admins have institution access, but never platform LMS authority.
    forbidden_lms = client.get("/api/v1/admin/courses", headers=admin_headers)
    assert forbidden_lms.status_code == 403
    forbidden_approvals = client.get(
        "/api/v1/lms-admin/institutions", headers=admin_headers
    )
    assert forbidden_approvals.status_code == 403

    detail = client.get(
        f"/api/v1/lms-admin/institutions/{college_id}", headers=super_headers
    )
    assert detail.status_code == 200, detail.text
    actions = [item["action"] for item in detail.json()["history"]]
    assert set(actions) == {"registered", "approved"}

    suspend = client.post(
        f"/api/v1/lms-admin/institutions/{college_id}/suspend",
        headers=super_headers,
        json={"reason": "Fee payment overdue"},
    )
    assert suspend.status_code == 200, suspend.text
    assert suspend.json()["status"] == "suspended"

    blocked_after_suspend = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@riverside.edu", "password": "AdminPass123"},
    )
    assert blocked_after_suspend.status_code == 401

    reactivate = client.post(
        f"/api/v1/lms-admin/institutions/{college_id}/reactivate", headers=super_headers
    )
    assert reactivate.status_code == 200, reactivate.text
    assert reactivate.json()["status"] == "active"

    restored_login = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@riverside.edu", "password": "AdminPass123"},
    )
    assert restored_login.status_code == 200, restored_login.text

    role = client.get("/api/v1/auth/staff/role", headers=admin_headers)
    assert role.status_code == 200, role.text
    assert role.json()["role"] == "college_admin"

    super_role = client.get("/api/v1/auth/staff/role", headers=super_headers)
    assert super_role.status_code == 200, super_role.text
    assert super_role.json()["role"] == "lms_admin"

    profile = client.get("/api/v1/admin/institution", headers=admin_headers)
    assert profile.status_code == 200, profile.text
    assert profile.json()["name"] == "Riverside Institute of Technology"
    assert profile.json()["student_count"] == 0

    updated = client.put(
        "/api/v1/admin/institution",
        headers=admin_headers,
        json={
            "contact_name": "Priya Sharma",
            "contact_phone": "9876500099",
            "address": "45 New Campus Road",
        },
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["contact_email"] == "priya@riverside.edu"
    assert updated.json()["contact_phone"] == "9876500099"
    rejected_direct_sensitive_change = client.put(
        "/api/v1/admin/institution",
        headers=admin_headers,
        json={
            "contact_name": "Priya Sharma",
            "contact_phone": "9876500099",
            "address": "45 New Campus Road",
            "contact_email": "must-use-approval@example.com",
        },
    )
    assert rejected_direct_sensitive_change.status_code == 422

    change = client.post(
        "/api/v1/admin/institution/profile-change-requests",
        headers=admin_headers,
        json={
            "contact_email": "priya.updated@riverside.edu",
        },
    )
    assert change.status_code == 201, change.text
    pending_changes = client.get(
        "/api/v1/lms-admin/institutions/profile-changes/pending", headers=super_headers
    )
    assert pending_changes.status_code == 200, pending_changes.text
    change_id = change.json()["id"]
    approved_change = client.post(
        f"/api/v1/lms-admin/institutions/profile-changes/{change_id}/approve",
        headers=super_headers,
    )
    assert approved_change.status_code == 200, approved_change.text
    refreshed_profile = client.get("/api/v1/admin/institution", headers=admin_headers)
    assert refreshed_profile.json()["contact_email"] == "priya.updated@riverside.edu"

    super_admin_blocked = client.get("/api/v1/admin/institution", headers=super_headers)
    assert super_admin_blocked.status_code == 403

    with TestingSession() as db:
        program = Program(name="B.Tech Computer Science")
        db.add(program)
        db.commit()

    programs = client.get("/api/v1/admin/institution/programs", headers=admin_headers)
    assert programs.status_code == 200, programs.text
    assert all(item["offered"] is False for item in programs.json())
    program_id = programs.json()[0]["id"]

    added = client.post(
        f"/api/v1/admin/institution/programs/{program_id}", headers=admin_headers
    )
    assert added.status_code == 200, added.text
    assert added.json()["offered"] is True

    dashboard = client.get("/api/v1/admin/institution/dashboard", headers=admin_headers)
    assert dashboard.status_code == 200, dashboard.text
    assert dashboard.json()["program_count"] == 1

    faculty = client.post(
        "/api/v1/admin/institution/faculty",
        headers=admin_headers,
        json={
            "full_name": "Dr Kavita Rao",
            "email": "kavita@riverside.edu",
            "mobile": "9876500088",
            "designation": "Assistant Professor",
            "department": "CSE",
        },
    )
    assert faculty.status_code == 201, faculty.text
    faculty_id = faculty.json()["id"]
    faculty_rows = client.get(
        "/api/v1/admin/institution/faculty", headers=admin_headers
    )
    assert faculty_rows.status_code == 200
    assert faculty_rows.json()[0]["email"] == "kavita@riverside.edu"

    batch = client.post(
        "/api/v1/admin/institution/batches",
        headers=admin_headers,
        json={
            "program_id": program_id,
            "name": "CSE 2026",
            "academic_year": "2026-27",
            "capacity": 60,
        },
    )
    assert batch.status_code == 201, batch.text
    batch_id = batch.json()["id"]
    section = client.post(
        f"/api/v1/admin/institution/batches/{batch_id}/sections",
        headers=admin_headers,
        json={
            "name": "Section A",
            "capacity": 30,
            "coordinator_faculty_id": faculty_id,
        },
    )
    assert section.status_code == 201, section.text
    batches = client.get("/api/v1/admin/institution/batches", headers=admin_headers)
    assert batches.status_code == 200
    assert batches.json()[0]["sections"][0]["coordinator"] == "Dr Kavita Rao"

    reports = client.get("/api/v1/admin/institution/reports", headers=admin_headers)
    assert reports.status_code == 200
    export = client.get(
        "/api/v1/admin/institution/reports/students.csv", headers=admin_headers
    )
    assert export.status_code == 200
    assert export.headers["content-type"].startswith("text/csv")

    removed = client.delete(
        f"/api/v1/admin/institution/programs/{program_id}", headers=admin_headers
    )
    assert removed.status_code == 204, removed.text

    students = client.get("/api/v1/admin/institution/students", headers=admin_headers)
    assert students.status_code == 200, students.text
    assert students.json() == []


def test_rejected_institution_admin_cannot_log_in():
    super_token = seed_super_admin()
    super_headers = {"Authorization": f"Bearer {super_token}"}
    registered = register_college(
        "Hilltop College of Arts",
        admin_email="admin@hilltop.edu",
        admin_mobile="9876500003",
    )
    college_id = registered["college_id"]

    missing_reason = client.post(
        f"/api/v1/lms-admin/institutions/{college_id}/reject",
        headers=super_headers,
        json={"reason": ""},
    )
    assert missing_reason.status_code == 422

    reject = client.post(
        f"/api/v1/lms-admin/institutions/{college_id}/reject",
        headers=super_headers,
        json={"reason": "Incomplete documentation"},
    )
    assert reject.status_code == 200, reject.text
    assert reject.json()["status"] == "rejected"
    assert reject.json()["rejected_reason"] == "Incomplete documentation"

    login = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@hilltop.edu", "password": "AdminPass123"},
    )
    assert login.status_code == 401


def test_college_operations_and_cross_tenant_boundaries():
    lms_headers = {"Authorization": f"Bearer {seed_super_admin()}"}
    a = register_college("Tenant A Institute", "admin@tenant-a.edu", "9876510001")
    b = register_college("Tenant B Institute", "admin@tenant-b.edu", "9876510002")
    for item in (a, b):
        assert (
            client.post(
                f"/api/v1/lms-admin/institutions/{item['college_id']}/approve",
                headers=lms_headers,
            ).status_code
            == 200
        )
    login_a = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@tenant-a.edu", "password": "AdminPass123"},
    ).json()
    login_b = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@tenant-b.edu", "password": "AdminPass123"},
    ).json()
    headers_a = {"Authorization": f"Bearer {login_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {login_b['access_token']}"}
    with TestingSession() as db:
        program = Program(name=f"Tenant Ops {uuid.uuid4().hex[:6]}")
        course = Course(
            title=f"Published Course {uuid.uuid4().hex[:6]}",
            slug=f"published-{uuid.uuid4().hex}",
            description="Course",
            level="Beginner",
            duration_hours=4,
            status="published",
        )
        db.add_all([program, course])
        db.commit()
        program_id = str(program.id)
        course_id = str(course.id)
    for headers in (headers_a, headers_b):
        assert (
            client.post(
                f"/api/v1/admin/institution/programs/{program_id}", headers=headers
            ).status_code
            == 200
        )
    faculty_a = client.post(
        "/api/v1/admin/institution/faculty",
        headers=headers_a,
        json={"full_name": "Faculty A", "email": "faculty-a@tenant.edu"},
    ).json()["id"]
    faculty_b = client.post(
        "/api/v1/admin/institution/faculty",
        headers=headers_b,
        json={"full_name": "Faculty B", "email": "faculty-b@tenant.edu"},
    ).json()["id"]
    batch_a = client.post(
        "/api/v1/admin/institution/batches",
        headers=headers_a,
        json={
            "program_id": program_id,
            "name": "A Batch",
            "academic_year": "2026-27",
            "capacity": 50,
        },
    ).json()["id"]
    assert (
        client.patch(
            f"/api/v1/admin/institution/faculty/{faculty_a}/status?is_active=false",
            headers=headers_b,
        ).status_code
        == 404
    )
    assert (
        client.post(
            f"/api/v1/admin/institution/batches/{batch_a}/sections",
            headers=headers_b,
            json={"name": "Attack", "capacity": 20},
        ).status_code
        == 404
    )
    assert (
        client.post(
            f"/api/v1/admin/institution/batches/{batch_a}/sections",
            headers=headers_a,
            json={"name": "A", "capacity": 20, "coordinator_faculty_id": faculty_b},
        ).status_code
        == 422
    )
    bad_allocation = client.post(
        "/api/v1/admin/institution/course-allocations",
        headers=headers_b,
        json={"course_id": course_id, "program_id": program_id, "batch_id": batch_a},
    )
    assert bad_allocation.status_code == 422
    allocation = client.post(
        "/api/v1/admin/institution/course-allocations",
        headers=headers_a,
        json={
            "course_id": course_id,
            "program_id": program_id,
            "batch_id": batch_a,
            "faculty_id": faculty_a,
        },
    )
    assert allocation.status_code == 201, allocation.text
    allocation_id = allocation.json()["id"]
    assert (
        client.delete(
            f"/api/v1/admin/institution/course-allocations/{allocation_id}",
            headers=headers_a,
        ).status_code
        == 204
    )
    assert (
        client.patch(
            f"/api/v1/admin/institution/course-allocations/{allocation_id}/restore",
            headers=headers_a,
        ).status_code
        == 200
    )
    with TestingSession() as db:
        user = User(
            email="student-a@tenant.edu",
            mobile="9876510010",
            password_hash=hash_password("Student123"),
            role="student",
            college_id=uuid.UUID(a["college_id"]),
        )
        db.add(user)
        db.flush()
        student = StudentProfile(
            user_id=user.id,
            college_id=uuid.UUID(a["college_id"]),
            program_id=uuid.UUID(program_id),
            full_name="Student A",
            current_year="1",
            college_batch_id=uuid.UUID(batch_a),
        )
        db.add(student)
        db.flush()
        enrollment = CourseEnrollment(
            user_id=user.id,
            course_id=uuid.UUID(course_id),
            status="completed",
            progress_percentage=100,
        )
        db.add(enrollment)
        db.commit()
        student_id = str(student.id)
        enrollment_id = str(enrollment.id)
    assert (
        client.patch(
            f"/api/v1/admin/institution/students/{student_id}",
            headers=headers_b,
            json={"is_active": False},
        ).status_code
        == 404
    )
    assert (
        client.patch(
            f"/api/v1/admin/institution/students/{student_id}",
            headers=headers_a,
            json={"is_active": False},
        ).status_code
        == 200
    )
    managed = client.get(
        f"/api/v1/admin/institution/students/{student_id}/enrollments",
        headers=headers_a,
    )
    assert (
        managed.status_code == 200
        and managed.json()[0]["enrollment_id"] == enrollment_id
    )
    assert (
        client.patch(
            f"/api/v1/admin/institution/students/{student_id}/enrollments/{enrollment_id}?active=false",
            headers=headers_a,
        ).status_code
        == 200
    )
    assert (
        client.patch(
            f"/api/v1/admin/institution/students/{student_id}/enrollments/{enrollment_id}?active=true",
            headers=headers_b,
        ).status_code
        == 404
    )
    assert (
        client.patch(
            f"/api/v1/admin/institution/students/{student_id}/enrollments/{enrollment_id}?active=true",
            headers=headers_a,
        ).status_code
        == 200
    )
    with TestingSession() as db:
        reset_profile = db.get(StudentProfile, uuid.UUID(student_id))
        reset_profile.user.is_active = True
        db.commit()
        stale_token, _ = create_access_token(
            reset_profile.user_id,
            "student",
            reset_profile.user.credentials_version,
        )
    stale_headers = {"Authorization": f"Bearer {stale_token}"}
    assert client.get("/api/v1/students/me/enrollments", headers=stale_headers).status_code == 200
    reset = client.post(
        f"/api/v1/admin/institution/students/{student_id}/password-reset",
        headers=headers_a,
    )
    assert reset.status_code == 201
    complete = client.post(
        "/api/v1/admin/institution/students/password-reset/complete",
        json={"token": reset.json()["reset_token"], "new_password": "NewStudent123"},
    )
    assert complete.status_code == 200
    assert client.get("/api/v1/students/me/enrollments", headers=stale_headers).status_code == 401
    assert (
        client.post(
            "/api/v1/admin/institution/students/password-reset/complete",
            json={"token": reset.json()["reset_token"], "new_password": "Again1234"},
        ).status_code
        == 422
    )
    csv_data = (
        "full_name,email,mobile,password,program_id,current_year,roll_number,batch_id\n"
        f"Imported Student,imported@tenant.edu,9876510011,Imported123,{program_id},1,IMP-1,{batch_a}\n"
    )
    imported = client.post(
        "/api/v1/admin/institution/students/import",
        headers=headers_a,
        files={"file": ("students.csv", csv_data, "text/csv")},
    )
    assert imported.status_code == 201, imported.text
    assert imported.json()["created"] == 1
    imported_students = client.get(
        "/api/v1/admin/institution/students?search=imported@tenant.edu",
        headers=headers_a,
    ).json()
    first_enrollment = client.post(
        f"/api/v1/admin/institution/students/{imported_students[0]['id']}/enrollments/{course_id}",
        headers=headers_a,
    )
    assert first_enrollment.status_code == 201, first_enrollment.text
    with TestingSession() as db:
        audit = db.scalar(
            select(CollegeAuditLog)
            .where(CollegeAuditLog.entity_id == first_enrollment.json()["id"])
            .order_by(CollegeAuditLog.created_at.desc())
        )
        assert audit.action == "student.enrolled"
    logo = client.post(
        "/api/v1/admin/institution/logo",
        headers=headers_a,
        files={"file": ("logo.png", b"PNG-test", "image/png")},
    )
    assert logo.status_code == 201, logo.text
    assert (
        client.get("/api/v1/admin/institution/logo", headers=headers_a).status_code
        == 200
    )
    eligible = client.get("/api/v1/admin/institution/certificates", headers=headers_a)
    assert (
        eligible.status_code == 200
        and eligible.json()["eligible"][0]["enrollment_id"] == enrollment_id
    )
    assert (
        client.post(
            f"/api/v1/admin/institution/certificates/request/{enrollment_id}",
            headers=headers_b,
        ).status_code
        == 422
    )
    assert (
        client.post(
            f"/api/v1/admin/institution/certificates/request/{enrollment_id}",
            headers=headers_a,
        ).status_code
        == 201
    )
    progress = client.get("/api/v1/admin/institution/progress", headers=headers_a)
    assert progress.status_code == 200 and "groups" in progress.json()
    assert (
        client.get(
            f"/api/v1/admin/institution/students/{student_id}/progress", headers=headers_b
        ).status_code
        == 404
    )
    detail = client.get(
        f"/api/v1/admin/institution/students/{student_id}/progress", headers=headers_a
    )
    assert detail.status_code == 200, detail.text
    detail_body = detail.json()
    assert detail_body["student_id"] == student_id
    assert any(item["course_id"] == course_id for item in detail_body["courses"])
    for kind in ("enrollments", "course-completion", "assessments", "certificates"):
        assert (
            client.get(
                f"/api/v1/admin/institution/reports/{kind}.csv", headers=headers_a
            ).status_code
            == 200
        )
        assert (
            client.get(
                f"/api/v1/admin/institution/reports/{kind}.pdf", headers=headers_a
            ).status_code
            == 200
        )


def test_revoked_enrollment_does_not_unlock_learning_content():
    with TestingSession() as db:
        suffix = uuid.uuid4().hex[:8]
        college = db.scalar(select(StudentProfile).limit(1)).college
        program = db.scalar(select(Program).limit(1))
        course = Course(
            title=f"Revoked Course {suffix}", slug=f"revoked-{suffix}",
            description="Access regression", level="Beginner", duration_hours=1,
            status="published",
        )
        user = User(
            email=f"revoked-{suffix}@example.com", mobile=f"97{int(suffix, 16) % 100000000:08d}",
            password_hash=hash_password("Student123"), role="student",
        )
        db.add_all([course, user]); db.flush()
        section = CourseSection(course_id=course.id, title="Section", sequence=1)
        profile = StudentProfile(
            user_id=user.id, college_id=college.id, program_id=program.id,
            full_name="Revoked Student", current_year="1",
        )
        db.add_all([section, profile]); db.flush()
        lesson = CourseLesson(
            section_id=section.id, title="Private lesson", lesson_type="article",
            duration_minutes=5, sequence=1, article_content="Locked content",
        )
        enrollment = CourseEnrollment(user_id=user.id, course_id=course.id, status="revoked")
        db.add_all([lesson, enrollment]); db.commit()
        user_id, course_id, lesson_id, enrollment_id = user.id, course.id, lesson.id, enrollment.id

    token, _ = create_access_token(user_id, "student", 0)
    headers = {"Authorization": f"Bearer {token}"}
    detail = client.get(f"/api/v1/students/me/courses/{course_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["is_enrolled"] is False
    assert detail.json()["sections"][0]["lessons"][0]["locked"] is True
    assert client.put(
        f"/api/v1/students/me/enrollments/{enrollment_id}/lessons/{lesson_id}/progress",
        headers=headers, json={"status": "completed"},
    ).status_code == 404


def test_suspended_college_blocks_existing_student_session():
    with TestingSession() as db:
        suffix = uuid.uuid4().hex[:8]
        college = db.scalar(select(StudentProfile).limit(1)).college
        original_status = college.status
        program = db.scalar(select(Program).limit(1))
        user = User(
            email=f"suspended-{suffix}@example.com",
            mobile=f"96{int(suffix, 16) % 100000000:08d}",
            password_hash=hash_password("Student123"),
            role="student",
        )
        db.add(user)
        db.flush()
        db.add(StudentProfile(
            user_id=user.id,
            college_id=college.id,
            program_id=program.id,
            full_name="Suspended College Student",
            current_year="1",
        ))
        db.commit()
        user_id = user.id
        credentials_version = user.credentials_version
        college_id = college.id

    token, _ = create_access_token(user_id, "student", credentials_version)
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/v1/students/me/enrollments", headers=headers).status_code == 200

    with TestingSession() as db:
        college = db.get(College, college_id)
        college.status = "suspended"
        db.commit()

    blocked = client.get("/api/v1/students/me/enrollments", headers=headers)
    assert blocked.status_code == 403
    assert "institution" in blocked.json()["detail"].lower()

    with TestingSession() as db:
        college = db.get(College, college_id)
        college.status = original_status
        db.commit()
