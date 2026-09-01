import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User, Program
from app.security import hash_password

engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
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
            db.add(User(email="owner@educonnect.dev", mobile="9000000000", password_hash=hash_password("OwnerPass123"), role="super_admin"))
            db.commit()
    login = client.post("/api/v1/auth/admin/login", json={"email": "owner@educonnect.dev", "password": "OwnerPass123"})
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


def register_college(name="Riverside Institute of Technology", admin_email="admin@riverside.edu", admin_mobile="9876500002") -> dict:
    response = client.post("/api/v1/institutions/register", json={
        "college_name": name, "contact_name": "Priya Sharma", "contact_email": "priya@riverside.edu",
        "contact_phone": "9876500001", "address": "12 College Road",
        "admin_full_name": "Priya Sharma", "admin_email": admin_email,
        "admin_mobile": admin_mobile, "admin_password": "AdminPass123",
    })
    assert response.status_code == 201, response.text
    return response.json()


def test_full_registration_approval_and_admin_login_flow():
    super_token = seed_super_admin()
    super_headers = {"Authorization": f"Bearer {super_token}"}

    registered = register_college()
    assert registered["status"] == "pending"
    college_id = registered["college_id"]

    duplicate = client.post("/api/v1/institutions/register", json={
        "college_name": "Riverside Institute of Technology", "contact_name": "X", "contact_email": "x@x.com",
        "contact_phone": "9111111111", "admin_full_name": "X", "admin_email": "other@riverside.edu",
        "admin_mobile": "9111111112", "admin_password": "AdminPass123",
    })
    assert duplicate.status_code == 422

    blocked_login = client.post("/api/v1/auth/admin/login", json={"email": "admin@riverside.edu", "password": "AdminPass123"})
    assert blocked_login.status_code == 401

    pending_list = client.get("/api/v1/super-admin/institutions?status=pending", headers=super_headers)
    assert pending_list.status_code == 200, pending_list.text
    assert any(item["id"] == college_id for item in pending_list.json())

    non_super_admin_attempt = client.get("/api/v1/super-admin/institutions", headers={"Authorization": f"Bearer {super_token}x"})
    assert non_super_admin_attempt.status_code == 401

    approve = client.post(f"/api/v1/super-admin/institutions/{college_id}/approve", headers=super_headers)
    assert approve.status_code == 200, approve.text
    assert approve.json()["status"] == "active"

    admin_login = client.post("/api/v1/auth/admin/login", json={"email": "admin@riverside.edu", "password": "AdminPass123"})
    assert admin_login.status_code == 200, admin_login.text
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}
    me = client.get("/api/v1/auth/admin/me", headers=admin_headers)
    assert me.status_code == 200, me.text
    assert me.json()["college_name"] == "Riverside Institute of Technology"

    detail = client.get(f"/api/v1/super-admin/institutions/{college_id}", headers=super_headers)
    assert detail.status_code == 200, detail.text
    actions = [item["action"] for item in detail.json()["history"]]
    assert set(actions) == {"registered", "approved"}

    suspend = client.post(f"/api/v1/super-admin/institutions/{college_id}/suspend", headers=super_headers, json={"reason": "Fee payment overdue"})
    assert suspend.status_code == 200, suspend.text
    assert suspend.json()["status"] == "suspended"

    blocked_after_suspend = client.post("/api/v1/auth/admin/login", json={"email": "admin@riverside.edu", "password": "AdminPass123"})
    assert blocked_after_suspend.status_code == 401

    reactivate = client.post(f"/api/v1/super-admin/institutions/{college_id}/reactivate", headers=super_headers)
    assert reactivate.status_code == 200, reactivate.text
    assert reactivate.json()["status"] == "active"

    restored_login = client.post("/api/v1/auth/admin/login", json={"email": "admin@riverside.edu", "password": "AdminPass123"})
    assert restored_login.status_code == 200, restored_login.text

    role = client.get("/api/v1/auth/staff/role", headers=admin_headers)
    assert role.status_code == 200, role.text
    assert role.json()["role"] == "admin"

    super_role = client.get("/api/v1/auth/staff/role", headers=super_headers)
    assert super_role.status_code == 200, super_role.text
    assert super_role.json()["role"] == "super_admin"

    profile = client.get("/api/v1/admin/institution", headers=admin_headers)
    assert profile.status_code == 200, profile.text
    assert profile.json()["name"] == "Riverside Institute of Technology"
    assert profile.json()["student_count"] == 0

    updated = client.put("/api/v1/admin/institution", headers=admin_headers, json={
        "contact_name": "Priya Sharma", "contact_email": "priya.updated@riverside.edu",
        "contact_phone": "9876500099", "address": "45 New Campus Road",
    })
    assert updated.status_code == 200, updated.text
    assert updated.json()["contact_email"] == "priya.updated@riverside.edu"

    super_admin_blocked = client.get("/api/v1/admin/institution", headers=super_headers)
    assert super_admin_blocked.status_code == 403

    with TestingSession() as db:
        program = Program(name="B.Tech Computer Science")
        db.add(program); db.commit()

    programs = client.get("/api/v1/admin/institution/programs", headers=admin_headers)
    assert programs.status_code == 200, programs.text
    assert all(item["offered"] is False for item in programs.json())
    program_id = programs.json()[0]["id"]

    added = client.post(f"/api/v1/admin/institution/programs/{program_id}", headers=admin_headers)
    assert added.status_code == 200, added.text
    assert added.json()["offered"] is True

    removed = client.delete(f"/api/v1/admin/institution/programs/{program_id}", headers=admin_headers)
    assert removed.status_code == 204, removed.text

    students = client.get("/api/v1/admin/institution/students", headers=admin_headers)
    assert students.status_code == 200, students.text
    assert students.json() == []


def test_rejected_institution_admin_cannot_log_in():
    super_token = seed_super_admin()
    super_headers = {"Authorization": f"Bearer {super_token}"}
    registered = register_college("Hilltop College of Arts", admin_email="admin@hilltop.edu", admin_mobile="9876500003")
    college_id = registered["college_id"]

    reject = client.post(f"/api/v1/super-admin/institutions/{college_id}/reject", headers=super_headers, json={"reason": "Incomplete documentation"})
    assert reject.status_code == 200, reject.text
    assert reject.json()["status"] == "rejected"

    login = client.post("/api/v1/auth/admin/login", json={"email": "admin@hilltop.edu", "password": "AdminPass123"})
    assert login.status_code == 401
