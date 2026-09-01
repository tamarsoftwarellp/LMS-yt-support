import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .college_portal_schemas import (
    InstitutionProfileOut,
    InstitutionProfileUpdateIn,
    InstitutionProgramOut,
    InstitutionStudentOut,
)
from .database import get_db
from .dependencies import get_current_admin
from .models import College, CollegeProgram, Program, StudentProfile, User

router = APIRouter(prefix="/api/v1/admin/institution", tags=["College Portal"])


def _require_college(admin: User, db: Session) -> College:
    if not admin.college_id:
        raise HTTPException(status_code=404, detail="No institution is linked to your account")
    college = db.get(College, admin.college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    return college


@router.get("", response_model=InstitutionProfileOut)
def get_profile(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> InstitutionProfileOut:
    college = _require_college(admin, db)
    students = db.scalar(select(func.count(StudentProfile.id)).where(StudentProfile.college_id == college.id)) or 0
    programs = db.scalar(select(func.count(CollegeProgram.id)).where(CollegeProgram.college_id == college.id)) or 0
    return InstitutionProfileOut(id=str(college.id), name=college.name, status=college.status,
        contact_name=college.contact_name, contact_email=college.contact_email, contact_phone=college.contact_phone,
        address=college.address, student_count=students, program_count=programs)


@router.put("", response_model=InstitutionProfileOut)
def update_profile(payload: InstitutionProfileUpdateIn, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> InstitutionProfileOut:
    college = _require_college(admin, db)
    college.contact_name = payload.contact_name.strip()
    college.contact_email = payload.contact_email.strip().lower()
    college.contact_phone = payload.contact_phone.strip()
    college.address = (payload.address or "").strip() or None
    db.commit(); db.refresh(college)
    students = db.scalar(select(func.count(StudentProfile.id)).where(StudentProfile.college_id == college.id)) or 0
    programs = db.scalar(select(func.count(CollegeProgram.id)).where(CollegeProgram.college_id == college.id)) or 0
    return InstitutionProfileOut(id=str(college.id), name=college.name, status=college.status,
        contact_name=college.contact_name, contact_email=college.contact_email, contact_phone=college.contact_phone,
        address=college.address, student_count=students, program_count=programs)


@router.get("/programs", response_model=list[InstitutionProgramOut])
def list_programs(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[InstitutionProgramOut]:
    college = _require_college(admin, db)
    offered_ids = {row.program_id for row in db.scalars(select(CollegeProgram).where(CollegeProgram.college_id == college.id))}
    counts = dict(db.execute(select(StudentProfile.program_id, func.count(StudentProfile.id))
        .where(StudentProfile.college_id == college.id).group_by(StudentProfile.program_id)).all())
    programs = list(db.scalars(select(Program).where(Program.is_active.is_(True)).order_by(Program.name)))
    return [InstitutionProgramOut(id=str(p.id), name=p.name, offered=p.id in offered_ids, student_count=counts.get(p.id, 0)) for p in programs]


@router.post("/programs/{program_id}", response_model=InstitutionProgramOut)
def add_program(program_id: uuid.UUID, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> InstitutionProgramOut:
    college = _require_college(admin, db)
    program = db.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    if not db.scalar(select(CollegeProgram).where(CollegeProgram.college_id == college.id, CollegeProgram.program_id == program_id)):
        db.add(CollegeProgram(college_id=college.id, program_id=program_id)); db.commit()
    return InstitutionProgramOut(id=str(program.id), name=program.name, offered=True, student_count=0)


@router.delete("/programs/{program_id}", status_code=204)
def remove_program(program_id: uuid.UUID, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> None:
    college = _require_college(admin, db)
    if db.scalar(select(func.count(StudentProfile.id)).where(StudentProfile.college_id == college.id, StudentProfile.program_id == program_id)):
        raise HTTPException(status_code=422, detail="Cannot remove a program with enrolled students")
    link = db.scalar(select(CollegeProgram).where(CollegeProgram.college_id == college.id, CollegeProgram.program_id == program_id))
    if link:
        db.delete(link); db.commit()


@router.get("/students", response_model=list[InstitutionStudentOut])
def list_students(search: str | None = Query(default=None, max_length=100), admin: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[InstitutionStudentOut]:
    college = _require_college(admin, db)
    query = select(StudentProfile).where(StudentProfile.college_id == college.id)
    if search and search.strip():
        value = f"%{search.strip()}%"
        query = query.join(User, User.id == StudentProfile.user_id).where(
            (StudentProfile.full_name.ilike(value)) | (User.email.ilike(value)) | (StudentProfile.roll_number.ilike(value)))
    rows = list(db.scalars(query.order_by(StudentProfile.created_at.desc()).limit(500)))
    return [InstitutionStudentOut(full_name=row.full_name, email=row.user.email, mobile=row.user.mobile,
        program_name=row.program.name, current_year=row.current_year, roll_number=row.roll_number, created_at=row.created_at) for row in rows]
