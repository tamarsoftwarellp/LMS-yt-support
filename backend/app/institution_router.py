import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import get_db
from .dependencies import get_current_super_admin
from .institution_schemas import (
    InstitutionActionIn,
    InstitutionDetailOut,
    InstitutionHistoryEntry,
    InstitutionOut,
    InstitutionRegisterIn,
    InstitutionRegisterOut,
)
from .models import College, InstitutionStatusHistory, StudentProfile, User
from .security import hash_password

public_router = APIRouter(prefix="/api/v1/institutions", tags=["Institution Registration"])
router = APIRouter(prefix="/api/v1/super-admin/institutions", tags=["Super Admin — Institutions"])


def _log(db: Session, college_id, action: str, reason: str | None, performed_by) -> None:
    db.add(InstitutionStatusHistory(college_id=college_id, action=action, reason=reason, performed_by=performed_by))


@public_router.post("/register", status_code=status.HTTP_201_CREATED, response_model=InstitutionRegisterOut)
def register_institution(payload: InstitutionRegisterIn, db: Session = Depends(get_db)) -> InstitutionRegisterOut:
    if db.scalar(select(College).where(College.name == payload.college_name.strip())):
        raise HTTPException(status_code=422, detail="A college with this name is already registered")
    admin_email = str(payload.admin_email).lower()
    if db.scalar(select(User).where((User.email == admin_email) | (User.mobile == payload.admin_mobile))):
        raise HTTPException(status_code=422, detail="An account with this email or mobile already exists")

    college = College(name=payload.college_name.strip(), status="pending", is_active=False,
        contact_name=payload.contact_name.strip(), contact_email=str(payload.contact_email).lower(),
        contact_phone=payload.contact_phone.strip(), address=(payload.address or "").strip() or None)
    db.add(college)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=422, detail="A college with this name is already registered")

    admin = User(email=admin_email, mobile=payload.admin_mobile.strip(), password_hash=hash_password(payload.admin_password),
        role="admin", college_id=college.id, is_active=False)
    db.add(admin)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=422, detail="An account with this email or mobile already exists")

    _log(db, college.id, "registered", None, None)
    db.commit()
    return InstitutionRegisterOut(college_id=str(college.id), status=college.status,
        message="Registration submitted. You can log in once our team approves your institution.")


def _counts(db: Session, college_id) -> tuple[int, int]:
    students = db.scalar(select(func.count(StudentProfile.id)).where(StudentProfile.college_id == college_id)) or 0
    admins = db.scalar(select(func.count(User.id)).where(User.college_id == college_id, User.role == "admin")) or 0
    return students, admins


def _out(college: College, db: Session) -> InstitutionOut:
    students, admins = _counts(db, college.id)
    return InstitutionOut(id=str(college.id), name=college.name, status=college.status,
        contact_name=college.contact_name, contact_email=college.contact_email, contact_phone=college.contact_phone,
        address=college.address, student_count=students, admin_count=admins,
        created_at=college.created_at, approved_at=college.approved_at, rejected_reason=college.rejected_reason)


@router.get("", response_model=list[InstitutionOut])
def list_institutions(status_filter: str | None = Query(default=None, alias="status"), search: str | None = Query(default=None, max_length=100),
                       admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> list[InstitutionOut]:
    query = select(College)
    if status_filter:
        query = query.where(College.status == status_filter)
    if search and search.strip():
        query = query.where(College.name.ilike(f"%{search.strip()}%"))
    colleges = list(db.scalars(query.order_by(College.created_at.desc())))
    return [_out(college, db) for college in colleges]


@router.get("/{college_id}", response_model=InstitutionDetailOut)
def get_institution(college_id: uuid.UUID, admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> InstitutionDetailOut:
    college = db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    history_rows = list(db.scalars(select(InstitutionStatusHistory).where(InstitutionStatusHistory.college_id == college.id).order_by(InstitutionStatusHistory.created_at.desc())))
    history = [InstitutionHistoryEntry(action=row.action, reason=row.reason,
        performed_by_name=(db.get(User, row.performed_by).email if row.performed_by else None), created_at=row.created_at) for row in history_rows]
    base = _out(college, db)
    return InstitutionDetailOut(**base.model_dump(), history=history)


@router.post("/{college_id}/approve", response_model=InstitutionOut)
def approve_institution(college_id: uuid.UUID, admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> InstitutionOut:
    college = db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    if college.status == "active":
        raise HTTPException(status_code=422, detail="Institution is already active")
    college.status = "active"; college.is_active = True; college.approved_at = datetime.now(timezone.utc); college.rejected_reason = None
    db.query(User).filter(User.college_id == college.id, User.role == "admin").update({"is_active": True}, synchronize_session=False)
    _log(db, college.id, "approved", None, admin.id)
    db.commit(); db.refresh(college)
    return _out(college, db)


@router.post("/{college_id}/reject", response_model=InstitutionOut)
def reject_institution(college_id: uuid.UUID, payload: InstitutionActionIn, admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> InstitutionOut:
    college = db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    if college.status == "active":
        raise HTTPException(status_code=422, detail="Cannot reject an already active institution — suspend it instead")
    college.status = "rejected"; college.is_active = False; college.rejected_reason = payload.reason
    db.query(User).filter(User.college_id == college.id, User.role == "admin").update({"is_active": False}, synchronize_session=False)
    _log(db, college.id, "rejected", payload.reason, admin.id)
    db.commit(); db.refresh(college)
    return _out(college, db)


@router.post("/{college_id}/suspend", response_model=InstitutionOut)
def suspend_institution(college_id: uuid.UUID, payload: InstitutionActionIn, admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> InstitutionOut:
    college = db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    if college.status != "active":
        raise HTTPException(status_code=422, detail="Only an active institution can be suspended")
    college.status = "suspended"; college.is_active = False
    db.query(User).filter(User.college_id == college.id, User.role == "admin").update({"is_active": False}, synchronize_session=False)
    _log(db, college.id, "suspended", payload.reason, admin.id)
    db.commit(); db.refresh(college)
    return _out(college, db)


@router.post("/{college_id}/reactivate", response_model=InstitutionOut)
def reactivate_institution(college_id: uuid.UUID, admin: User = Depends(get_current_super_admin), db: Session = Depends(get_db)) -> InstitutionOut:
    college = db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    if college.status != "suspended":
        raise HTTPException(status_code=422, detail="Only a suspended institution can be reactivated")
    college.status = "active"; college.is_active = True
    db.query(User).filter(User.college_id == college.id, User.role == "admin").update({"is_active": True}, synchronize_session=False)
    _log(db, college.id, "reactivated", None, admin.id)
    db.commit(); db.refresh(college)
    return _out(college, db)
