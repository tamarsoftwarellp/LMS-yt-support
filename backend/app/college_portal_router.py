import uuid
import csv
import io
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .college_portal_schemas import (
    InstitutionProfileOut,
    InstitutionProfileUpdateIn,
    InstitutionProgramOut,
    InstitutionStudentOut,
)
from .database import get_db
from .dependencies import get_current_college_admin
from .config import get_settings
from .models import (
    AssignmentSubmission,
    Certificate,
    College,
    CollegeAuditLog,
    CollegeBatch,
    CollegeCertificateRequest,
    CollegeCourseAllocation,
    CollegeFaculty,
    CollegeProgram,
    CollegeSection,
    CollegeProfileChangeRequest,
    Course,
    CourseEnrollment,
    Program,
    RefreshToken,
    StudentProfile,
    StudentPasswordResetRequest,
    StudentQuizAttempt,
    User,
)
from .security import hash_password

router = APIRouter(prefix="/api/v1/admin/institution", tags=["College Portal"])


class FacultyIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=180)
    email: EmailStr
    mobile: str | None = Field(default=None, max_length=20)
    designation: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=180)


class BatchIn(BaseModel):
    program_id: uuid.UUID
    name: str = Field(min_length=1, max_length=120)
    academic_year: str = Field(min_length=4, max_length=30)
    capacity: int = Field(default=60, ge=1, le=5000)


class SectionIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    capacity: int = Field(default=30, ge=1, le=1000)
    coordinator_faculty_id: uuid.UUID | None = None


class StudentAdminUpdateIn(BaseModel):
    is_active: bool | None = None
    program_id: uuid.UUID | None = None
    current_year: str | None = Field(default=None, max_length=30)
    college_batch_id: uuid.UUID | None = None
    college_section_id: uuid.UUID | None = None


class CourseAllocationIn(BaseModel):
    course_id: uuid.UUID
    program_id: uuid.UUID
    batch_id: uuid.UUID | None = None
    faculty_id: uuid.UUID | None = None


class ProfileChangeIn(BaseModel):
    college_name: str | None = Field(default=None, min_length=2, max_length=180)
    contact_email: EmailStr | None = None
    website_url: str | None = Field(default=None, max_length=500)


class PasswordResetCompleteIn(BaseModel):
    token: str = Field(min_length=32, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


def _audit(
    db: Session, admin: User, action: str, entity_type: str, entity_id=None, **details
) -> None:
    db.add(
        CollegeAuditLog(
            college_id=admin.college_id,
            actor_user_id=admin.id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=details,
        )
    )


def _require_college(admin: User, db: Session) -> College:
    if not admin.college_id:
        raise HTTPException(
            status_code=404, detail="No institution is linked to your account"
        )
    college = db.get(College, admin.college_id)
    if not college:
        raise HTTPException(status_code=404, detail="Institution not found")
    return college


@router.get("", response_model=InstitutionProfileOut)
def get_profile(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
) -> InstitutionProfileOut:
    college = _require_college(admin, db)
    students = (
        db.scalar(
            select(func.count(StudentProfile.id)).where(
                StudentProfile.college_id == college.id
            )
        )
        or 0
    )
    programs = (
        db.scalar(
            select(func.count(CollegeProgram.id)).where(
                CollegeProgram.college_id == college.id
            )
        )
        or 0
    )
    return InstitutionProfileOut(
        id=str(college.id),
        name=college.name,
        status=college.status,
        contact_name=college.contact_name,
        contact_email=college.contact_email,
        contact_phone=college.contact_phone,
        address=college.address,
        website_url=college.website_url,
        logo_url=college.logo_url,
        student_count=students,
        program_count=programs,
    )


@router.put("", response_model=InstitutionProfileOut)
def update_profile(
    payload: InstitutionProfileUpdateIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
) -> InstitutionProfileOut:
    college = _require_college(admin, db)
    college.contact_name = payload.contact_name.strip()
    college.contact_phone = payload.contact_phone.strip()
    college.address = (payload.address or "").strip() or None
    _audit(db, admin, "profile.updated", "college", college.id)
    db.commit()
    db.refresh(college)
    students = (
        db.scalar(
            select(func.count(StudentProfile.id)).where(
                StudentProfile.college_id == college.id
            )
        )
        or 0
    )
    programs = (
        db.scalar(
            select(func.count(CollegeProgram.id)).where(
                CollegeProgram.college_id == college.id
            )
        )
        or 0
    )
    return InstitutionProfileOut(
        id=str(college.id),
        name=college.name,
        status=college.status,
        contact_name=college.contact_name,
        contact_email=college.contact_email,
        contact_phone=college.contact_phone,
        address=college.address,
        website_url=college.website_url,
        logo_url=college.logo_url,
        student_count=students,
        program_count=programs,
    )


@router.post("/profile-change-requests", status_code=201)
def request_profile_change(
    payload: ProfileChangeIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    changes = {
        key: value
        for key, value in payload.model_dump(mode="json", exclude_none=True).items()
        if value != ""
    }
    if not changes:
        raise HTTPException(422, "Provide at least one sensitive profile change")
    pending = db.scalar(
        select(CollegeProfileChangeRequest).where(
            CollegeProfileChangeRequest.college_id == admin.college_id,
            CollegeProfileChangeRequest.status == "pending",
        )
    )
    if pending:
        raise HTTPException(409, "A profile change request is already pending")
    item = CollegeProfileChangeRequest(
        college_id=admin.college_id, requested_by_user_id=admin.id, changes=changes
    )
    db.add(item)
    db.flush()
    _audit(
        db,
        admin,
        "profile.change_requested",
        "profile_change",
        item.id,
        changes=changes,
    )
    db.commit()
    return {"id": item.id, "status": item.status, "changes": item.changes}


@router.get("/profile-change-requests")
def list_profile_changes(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    return [
        {
            "id": x.id,
            "changes": x.changes,
            "status": x.status,
            "rejection_reason": x.rejection_reason,
            "created_at": x.created_at,
        }
        for x in db.scalars(
            select(CollegeProfileChangeRequest)
            .where(CollegeProfileChangeRequest.college_id == admin.college_id)
            .order_by(CollegeProfileChangeRequest.created_at.desc())
        )
    ]


@router.post("/logo", status_code=201)
async def upload_logo(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()
    allowed = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    if extension not in allowed:
        raise HTTPException(415, "Upload a PNG, JPG, JPEG or WEBP logo")
    content = await file.read(2 * 1024 * 1024 + 1)
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(413, "College logo must be under 2 MB")
    if not content:
        raise HTTPException(422, "Logo file is empty")
    root = Path(get_settings().college_logo_upload_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    for old in root.glob(f"{admin.college_id}.*"):
        old.unlink(missing_ok=True)
    stored = root / f"{admin.college_id}{extension}"
    stored.write_bytes(content)
    college = _require_college(admin, db)
    college.logo_url = "/api/v1/admin/institution/logo"
    _audit(
        db,
        admin,
        "profile.logo_uploaded",
        "college",
        college.id,
        content_type=allowed[extension],
    )
    db.commit()
    return {"logo_url": college.logo_url}


@router.get("/logo")
def get_logo(admin: User = Depends(get_current_college_admin)):
    root = Path(get_settings().college_logo_upload_dir).resolve()
    matches = list(root.glob(f"{admin.college_id}.*"))
    if not matches:
        raise HTTPException(404, "College logo not found")
    return FileResponse(matches[0])


@router.get("/programs", response_model=list[InstitutionProgramOut])
def list_programs(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
) -> list[InstitutionProgramOut]:
    college = _require_college(admin, db)
    offered_ids = {
        row.program_id
        for row in db.scalars(
            select(CollegeProgram).where(CollegeProgram.college_id == college.id)
        )
    }
    counts = dict(
        db.execute(
            select(StudentProfile.program_id, func.count(StudentProfile.id))
            .where(StudentProfile.college_id == college.id)
            .group_by(StudentProfile.program_id)
        ).all()
    )
    programs = list(
        db.scalars(
            select(Program).where(Program.is_active.is_(True)).order_by(Program.name)
        )
    )
    return [
        InstitutionProgramOut(
            id=str(p.id),
            name=p.name,
            offered=p.id in offered_ids,
            student_count=counts.get(p.id, 0),
        )
        for p in programs
    ]


@router.post("/programs/{program_id}", response_model=InstitutionProgramOut)
def add_program(
    program_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
) -> InstitutionProgramOut:
    college = _require_college(admin, db)
    program = db.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    if not db.scalar(
        select(CollegeProgram).where(
            CollegeProgram.college_id == college.id,
            CollegeProgram.program_id == program_id,
        )
    ):
        db.add(CollegeProgram(college_id=college.id, program_id=program_id))
        _audit(db, admin, "program.added", "program", program_id)
        db.commit()
    return InstitutionProgramOut(
        id=str(program.id), name=program.name, offered=True, student_count=0
    )


@router.delete("/programs/{program_id}", status_code=204)
def remove_program(
    program_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
) -> None:
    college = _require_college(admin, db)
    if db.scalar(
        select(func.count(StudentProfile.id)).where(
            StudentProfile.college_id == college.id,
            StudentProfile.program_id == program_id,
        )
    ):
        raise HTTPException(
            status_code=422, detail="Cannot remove a program with enrolled students"
        )
    link = db.scalar(
        select(CollegeProgram).where(
            CollegeProgram.college_id == college.id,
            CollegeProgram.program_id == program_id,
        )
    )
    if link:
        db.delete(link)
        _audit(db, admin, "program.removed", "program", program_id)
        db.commit()


@router.get("/students", response_model=list[InstitutionStudentOut])
def list_students(
    search: str | None = Query(default=None, max_length=100),
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
) -> list[InstitutionStudentOut]:
    college = _require_college(admin, db)
    query = select(StudentProfile).where(StudentProfile.college_id == college.id)
    if search and search.strip():
        value = f"%{search.strip()}%"
        query = query.join(User, User.id == StudentProfile.user_id).where(
            (StudentProfile.full_name.ilike(value))
            | (User.email.ilike(value))
            | (StudentProfile.roll_number.ilike(value))
        )
    rows = list(db.scalars(query.order_by(StudentProfile.created_at.desc()).limit(500)))
    result = []
    for row in rows:
        enrollments = list(
            db.scalars(
                select(CourseEnrollment).where(CourseEnrollment.user_id == row.user_id)
            )
        )
        batch = (
            db.get(CollegeBatch, row.college_batch_id) if row.college_batch_id else None
        )
        section = (
            db.get(CollegeSection, row.college_section_id)
            if row.college_section_id
            else None
        )
        result.append(
            InstitutionStudentOut(
                id=str(row.id),
                user_id=str(row.user_id),
                full_name=row.full_name,
                email=row.user.email,
                mobile=row.user.mobile,
                program_name=row.program.name,
                current_year=row.current_year,
                roll_number=row.roll_number,
                created_at=row.created_at,
                is_active=row.user.is_active,
                progress_percentage=round(
                    sum(x.progress_percentage for x in enrollments) / len(enrollments)
                )
                if enrollments
                else 0,
                enrollment_count=len(enrollments),
                batch_id=str(batch.id) if batch else None,
                batch_name=batch.name if batch else None,
                section_id=str(section.id) if section else None,
                section_name=section.name if section else None,
            )
        )
    return result


@router.get("/dashboard")
def dashboard(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    college = _require_college(admin, db)
    student_ids = select(StudentProfile.user_id).where(
        StudentProfile.college_id == college.id
    )
    students = (
        db.scalar(
            select(func.count(StudentProfile.id)).where(
                StudentProfile.college_id == college.id
            )
        )
        or 0
    )
    enrollments = list(
        db.scalars(
            select(CourseEnrollment).where(CourseEnrollment.user_id.in_(student_ids))
        )
    )
    certificates = (
        db.scalar(
            select(func.count(Certificate.id)).where(
                Certificate.student_id.in_(student_ids), Certificate.status == "issued"
            )
        )
        or 0
    )
    pending = (
        db.scalar(
            select(func.count(AssignmentSubmission.id))
            .join(
                CourseEnrollment,
                CourseEnrollment.id == AssignmentSubmission.enrollment_id,
            )
            .where(
                CourseEnrollment.user_id.in_(student_ids),
                AssignmentSubmission.status == "submitted",
            )
        )
        or 0
    )
    return {
        "student_count": students,
        "active_students": db.scalar(
            select(func.count(User.id)).where(
                User.id.in_(student_ids), User.is_active.is_(True)
            )
        )
        or 0,
        "program_count": db.scalar(
            select(func.count(CollegeProgram.id)).where(
                CollegeProgram.college_id == college.id
            )
        )
        or 0,
        "faculty_count": db.scalar(
            select(func.count(CollegeFaculty.id)).where(
                CollegeFaculty.college_id == college.id,
                CollegeFaculty.is_active.is_(True),
            )
        )
        or 0,
        "batch_count": db.scalar(
            select(func.count(CollegeBatch.id)).where(
                CollegeBatch.college_id == college.id, CollegeBatch.is_active.is_(True)
            )
        )
        or 0,
        "course_allocations": db.scalar(
            select(func.count(CollegeCourseAllocation.id)).where(
                CollegeCourseAllocation.college_id == college.id,
                CollegeCourseAllocation.is_active.is_(True),
            )
        )
        or 0,
        "average_progress": round(
            sum(x.progress_percentage for x in enrollments) / len(enrollments)
        )
        if enrollments
        else 0,
        "pending_evaluations": pending,
        "certificates_issued": certificates,
    }


@router.patch("/students/{student_id}")
def update_student(
    student_id: uuid.UUID,
    payload: StudentAdminUpdateIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    student = db.get(StudentProfile, student_id)
    if not student or student.college_id != admin.college_id:
        raise HTTPException(404, "Student not found")
    if payload.program_id:
        if not db.scalar(
            select(CollegeProgram).where(
                CollegeProgram.college_id == admin.college_id,
                CollegeProgram.program_id == payload.program_id,
            )
        ):
            raise HTTPException(422, "Program is not offered by your college")
        student.program_id = payload.program_id
    if payload.current_year is not None:
        student.current_year = payload.current_year.strip()
    if "college_batch_id" in payload.model_fields_set:
        if payload.college_batch_id:
            batch = db.get(CollegeBatch, payload.college_batch_id)
            if not batch or batch.college_id != admin.college_id:
                raise HTTPException(422, "Invalid college batch")
            student.college_batch_id = batch.id
        else:
            student.college_batch_id = None
            student.college_section_id = None
    if "college_section_id" in payload.model_fields_set:
        if payload.college_section_id:
            section = db.get(CollegeSection, payload.college_section_id)
            if not section or section.batch.college_id != admin.college_id:
                raise HTTPException(422, "Invalid college section")
            if (
                student.college_batch_id
                and section.batch_id != student.college_batch_id
            ):
                raise HTTPException(
                    422, "Section does not belong to the selected batch"
                )
            student.college_section_id = section.id
        else:
            student.college_section_id = None
    if payload.is_active is not None:
        student.user.is_active = payload.is_active
    _audit(
        db,
        admin,
        "student.updated",
        "student",
        student.id,
        changes=payload.model_dump(mode="json", exclude_none=True),
    )
    db.commit()
    return {"status": "updated"}


@router.post("/students/import", status_code=201)
async def import_students(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    if Path(file.filename or "").suffix.lower() != ".csv":
        raise HTTPException(415, "Upload a CSV file")
    content = await file.read(2 * 1024 * 1024 + 1)
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(413, "Student CSV must be under 2 MB")
    try:
        rows = list(csv.DictReader(io.StringIO(content.decode("utf-8-sig"))))
    except UnicodeDecodeError as exc:
        raise HTTPException(422, "CSV must be UTF-8 encoded") from exc
    required = {
        "full_name",
        "email",
        "mobile",
        "password",
        "program_id",
        "current_year",
    }
    if not rows or not required.issubset(set(rows[0])):
        raise HTTPException(422, f"CSV columns required: {', '.join(sorted(required))}")
    created = 0
    errors = []
    for line, row in enumerate(rows, start=2):
        try:
            email = row["email"].strip().lower()
            mobile = row["mobile"].strip()
            program_id = uuid.UUID(row["program_id"].strip())
            if len(row["password"]) < 8:
                raise ValueError("password must contain at least 8 characters")
            if db.scalar(
                select(User.id).where(
                    (func.lower(User.email) == email) | (User.mobile == mobile)
                )
            ):
                raise ValueError("email or mobile already exists")
            if not db.scalar(
                select(CollegeProgram.id).where(
                    CollegeProgram.college_id == admin.college_id,
                    CollegeProgram.program_id == program_id,
                )
            ):
                raise ValueError("program is not offered")
            batch_id = (
                uuid.UUID(row["batch_id"]) if row.get("batch_id", "").strip() else None
            )
            section_id = (
                uuid.UUID(row["section_id"])
                if row.get("section_id", "").strip()
                else None
            )
            if batch_id:
                batch = db.get(CollegeBatch, batch_id)
                if not batch or batch.college_id != admin.college_id:
                    raise ValueError("invalid batch")
            if section_id:
                section = db.get(CollegeSection, section_id)
                if not section or section.batch.college_id != admin.college_id:
                    raise ValueError("invalid section")
            user = User(
                email=email,
                mobile=mobile,
                password_hash=hash_password(row["password"]),
                role="student",
                college_id=admin.college_id,
            )
            db.add(user)
            db.flush()
            db.add(
                StudentProfile(
                    user_id=user.id,
                    college_id=admin.college_id,
                    program_id=program_id,
                    full_name=" ".join(row["full_name"].split()),
                    current_year=row["current_year"].strip(),
                    roll_number=(row.get("roll_number") or "").strip() or None,
                    college_batch_id=batch_id,
                    college_section_id=section_id,
                )
            )
            created += 1
        except Exception as exc:
            db.rollback()
            errors.append({"row": line, "error": str(exc)})
            continue
        db.commit()
    _audit(
        db,
        admin,
        "students.bulk_imported",
        "student",
        created=created,
        failed=len(errors),
    )
    db.commit()
    return {"created": created, "failed": len(errors), "errors": errors[:100]}


@router.post("/students/{student_id}/password-reset", status_code=201)
def initiate_password_reset(
    student_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    student = db.get(StudentProfile, student_id)
    if not student or student.college_id != admin.college_id:
        raise HTTPException(404, "Student not found")
    raw = secrets.token_urlsafe(32)
    digest = hashlib.sha256(raw.encode()).hexdigest()
    item = StudentPasswordResetRequest(
        college_id=admin.college_id,
        user_id=student.user_id,
        token_hash=digest,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        requested_by_user_id=admin.id,
    )
    db.add(item)
    db.flush()
    _audit(db, admin, "student.password_reset_initiated", "student", student.id)
    db.commit()
    return {"status": "created", "expires_in_minutes": 60, "reset_token": raw}


@router.post("/students/password-reset/complete")
def complete_password_reset(
    payload: PasswordResetCompleteIn, db: Session = Depends(get_db)
):
    digest = hashlib.sha256(payload.token.encode()).hexdigest()
    item = db.scalar(
        select(StudentPasswordResetRequest).where(
            StudentPasswordResetRequest.token_hash == digest
        )
    )
    now = datetime.now(timezone.utc)
    expires = (
        item.expires_at.replace(tzinfo=timezone.utc)
        if item and item.expires_at.tzinfo is None
        else (item.expires_at if item else now)
    )
    if not item or item.used_at or expires <= now:
        raise HTTPException(422, "Password reset token is invalid or expired")
    user = db.get(User, item.user_id)
    user.password_hash = hash_password(payload.new_password)
    item.used_at = now
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)
    ).update({"revoked_at": now}, synchronize_session=False)
    db.commit()
    return {"status": "password_updated"}


@router.post("/students/{student_id}/enrollments/{course_id}", status_code=201)
def enroll_student(
    student_id: uuid.UUID,
    course_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    student = db.get(StudentProfile, student_id)
    course = db.get(Course, course_id)
    if not student or student.college_id != admin.college_id:
        raise HTTPException(404, "Student not found")
    allocation = db.scalar(
        select(CollegeCourseAllocation).where(
            CollegeCourseAllocation.college_id == admin.college_id,
            CollegeCourseAllocation.course_id == course_id,
            CollegeCourseAllocation.program_id == student.program_id,
            CollegeCourseAllocation.is_active.is_(True),
        )
    )
    if not course or course.status != "published" or not allocation:
        raise HTTPException(
            422, "Course is not actively allocated to this student's program"
        )
    item = db.scalar(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == student.user_id,
            CourseEnrollment.course_id == course_id,
        )
    )
    was_existing = item is not None
    if item:
        item.status = "enrolled"
    else:
        item = CourseEnrollment(user_id=student.user_id, course_id=course_id)
        db.add(item)
    db.flush()
    _audit(
        db,
        admin,
        "student.enrollment_restored" if was_existing else "student.enrolled",
        "enrollment",
        item.id,
    )
    db.commit()
    return {"id": item.id, "status": item.status}


@router.get("/students/{student_id}/enrollments")
def list_student_enrollments(
    student_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    student = db.get(StudentProfile, student_id)
    if not student or student.college_id != admin.college_id:
        raise HTTPException(404, "Student not found")
    rows = list(
        db.scalars(
            select(CourseEnrollment).where(CourseEnrollment.user_id == student.user_id)
        )
    )
    allocated = list(
        db.scalars(
            select(CollegeCourseAllocation).where(
                CollegeCourseAllocation.college_id == admin.college_id,
                CollegeCourseAllocation.program_id == student.program_id,
                CollegeCourseAllocation.is_active.is_(True),
            )
        )
    )
    by_course = {row.course_id: row for row in rows}
    return [
        {
            "course_id": allocation.course_id,
            "course_title": allocation.course.title,
            "enrollment_id": by_course[allocation.course_id].id
            if allocation.course_id in by_course
            else None,
            "status": by_course[allocation.course_id].status
            if allocation.course_id in by_course
            else "not_enrolled",
            "progress_percentage": by_course[allocation.course_id].progress_percentage
            if allocation.course_id in by_course
            else 0,
        }
        for allocation in allocated
    ]


@router.patch("/students/{student_id}/enrollments/{enrollment_id}")
def set_enrollment_status(
    student_id: uuid.UUID,
    enrollment_id: uuid.UUID,
    active: bool,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    student = db.get(StudentProfile, student_id)
    item = db.get(CourseEnrollment, enrollment_id)
    if (
        not student
        or student.college_id != admin.college_id
        or not item
        or item.user_id != student.user_id
    ):
        raise HTTPException(404, "Enrollment not found")
    if active:
        item.status = item.previous_status or "enrolled"
        item.previous_status = None
    else:
        if item.status != "revoked":
            item.previous_status = item.status
        item.status = "revoked"
    _audit(db, admin, "student.enrollment_status", "enrollment", item.id, active=active)
    db.commit()
    return {"status": item.status}


@router.get("/faculty")
def list_faculty(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    result = []
    for x in db.scalars(
        select(CollegeFaculty)
        .where(CollegeFaculty.college_id == admin.college_id)
        .order_by(CollegeFaculty.full_name)
    ):
        section_count = (
            db.scalar(
                select(func.count(CollegeSection.id))
                .join(CollegeBatch)
                .where(
                    CollegeBatch.college_id == admin.college_id,
                    CollegeSection.coordinator_faculty_id == x.id,
                )
            )
            or 0
        )
        allocations = list(
            db.scalars(
                select(CollegeCourseAllocation).where(
                    CollegeCourseAllocation.college_id == admin.college_id,
                    CollegeCourseAllocation.faculty_id == x.id,
                    CollegeCourseAllocation.is_active.is_(True),
                )
            )
        )
        course_ids = [a.course_id for a in allocations]
        evaluations = 0
        if course_ids:
            evaluations = (
                db.scalar(
                    select(func.count(AssignmentSubmission.id))
                    .join(
                        CourseEnrollment,
                        CourseEnrollment.id == AssignmentSubmission.enrollment_id,
                    )
                    .where(
                        CourseEnrollment.course_id.in_(course_ids),
                        AssignmentSubmission.status == "evaluated",
                    )
                )
                or 0
            )
        result.append(
            {
                "id": x.id,
                "full_name": x.full_name,
                "email": x.email,
                "mobile": x.mobile,
                "designation": x.designation,
                "department": x.department,
                "is_active": x.is_active,
                "invited_at": x.invited_at,
                "section_count": section_count,
                "course_count": len(allocations),
                "evaluations_completed": evaluations,
            }
        )
    return result


@router.post("/faculty", status_code=201)
def add_faculty(
    payload: FacultyIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    if db.scalar(
        select(CollegeFaculty).where(
            CollegeFaculty.college_id == admin.college_id,
            func.lower(CollegeFaculty.email) == str(payload.email).lower(),
        )
    ):
        raise HTTPException(409, "Faculty email already exists")
    item = CollegeFaculty(college_id=admin.college_id, **payload.model_dump())
    item.email = str(payload.email).lower()
    db.add(item)
    db.flush()
    _audit(db, admin, "faculty.invited", "faculty", item.id, email=item.email)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "status": "invited"}


@router.patch("/faculty/{faculty_id}/status")
def faculty_status(
    faculty_id: uuid.UUID,
    is_active: bool,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    item = db.get(CollegeFaculty, faculty_id)
    if not item or item.college_id != admin.college_id:
        raise HTTPException(404, "Faculty not found")
    item.is_active = is_active
    _audit(db, admin, "faculty.status_changed", "faculty", item.id, is_active=is_active)
    db.commit()
    return {"status": "updated"}


@router.get("/batches")
def list_batches(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    batches = list(
        db.scalars(
            select(CollegeBatch)
            .where(CollegeBatch.college_id == admin.college_id)
            .order_by(CollegeBatch.created_at.desc())
        )
    )
    return [
        {
            "id": b.id,
            "name": b.name,
            "academic_year": b.academic_year,
            "capacity": b.capacity,
            "is_active": b.is_active,
            "program_id": b.program_id,
            "program_name": b.program.name,
            "student_count": db.scalar(
                select(func.count(StudentProfile.id)).where(
                    StudentProfile.college_batch_id == b.id
                )
            )
            or 0,
            "sections": [
                {
                    "id": s.id,
                    "name": s.name,
                    "capacity": s.capacity,
                    "is_active": s.is_active,
                    "coordinator": s.coordinator.full_name if s.coordinator else None,
                }
                for s in db.scalars(
                    select(CollegeSection).where(CollegeSection.batch_id == b.id)
                )
            ],
        }
        for b in batches
    ]


@router.post("/batches", status_code=201)
def add_batch(
    payload: BatchIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    if not db.scalar(
        select(CollegeProgram).where(
            CollegeProgram.college_id == admin.college_id,
            CollegeProgram.program_id == payload.program_id,
        )
    ):
        raise HTTPException(422, "Program is not offered by your college")
    item = CollegeBatch(college_id=admin.college_id, **payload.model_dump())
    db.add(item)
    db.flush()
    _audit(db, admin, "batch.created", "batch", item.id)
    db.commit()
    return {"id": item.id}


@router.post("/batches/{batch_id}/sections", status_code=201)
def add_section(
    batch_id: uuid.UUID,
    payload: SectionIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    batch = db.get(CollegeBatch, batch_id)
    if not batch or batch.college_id != admin.college_id:
        raise HTTPException(404, "Batch not found")
    if payload.coordinator_faculty_id:
        faculty = db.get(CollegeFaculty, payload.coordinator_faculty_id)
        if not faculty or faculty.college_id != admin.college_id:
            raise HTTPException(422, "Invalid faculty coordinator")
    item = CollegeSection(batch_id=batch.id, **payload.model_dump())
    db.add(item)
    db.flush()
    _audit(db, admin, "section.created", "section", item.id)
    db.commit()
    return {"id": item.id}


@router.get("/course-allocations")
def allocations(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    catalog = [
        {"id": c.id, "title": c.title, "level": c.level}
        for c in db.scalars(
            select(Course).where(Course.status == "published").order_by(Course.title)
        )
    ]
    items = list(
        db.scalars(
            select(CollegeCourseAllocation).where(
                CollegeCourseAllocation.college_id == admin.college_id
            )
        )
    )
    return {
        "catalog": catalog,
        "allocations": [
            {
                "id": x.id,
                "course_id": x.course_id,
                "course_title": x.course.title,
                "program_id": x.program_id,
                "program_name": x.program.name,
                "batch_name": x.batch.name if x.batch else None,
                "faculty_name": x.faculty.full_name if x.faculty else None,
                "is_active": x.is_active,
            }
            for x in items
        ],
    }


@router.post("/course-allocations", status_code=201)
def allocate(
    payload: CourseAllocationIn,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    course = db.get(Course, payload.course_id)
    if not course or course.status != "published":
        raise HTTPException(422, "Only published LMS courses can be allocated")
    if not db.scalar(
        select(CollegeProgram).where(
            CollegeProgram.college_id == admin.college_id,
            CollegeProgram.program_id == payload.program_id,
        )
    ):
        raise HTTPException(422, "Program is not offered by your college")
    for model, item_id, label in (
        (CollegeBatch, payload.batch_id, "batch"),
        (CollegeFaculty, payload.faculty_id, "faculty"),
    ):
        if item_id:
            item = db.get(model, item_id)
            if not item or item.college_id != admin.college_id:
                raise HTTPException(422, f"Invalid college {label}")
    item = db.scalar(
        select(CollegeCourseAllocation).where(
            CollegeCourseAllocation.college_id == admin.college_id,
            CollegeCourseAllocation.course_id == payload.course_id,
            CollegeCourseAllocation.program_id == payload.program_id,
            CollegeCourseAllocation.batch_id == payload.batch_id,
        )
    )
    if item:
        item.is_active = True
        item.faculty_id = payload.faculty_id
    else:
        item = CollegeCourseAllocation(
            college_id=admin.college_id, **payload.model_dump()
        )
        db.add(item)
    db.flush()
    _audit(db, admin, "course.allocated", "course_allocation", item.id)
    db.commit()
    return {"id": item.id, "is_active": True}


@router.delete("/course-allocations/{allocation_id}", status_code=204)
def remove_allocation(
    allocation_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    item = db.get(CollegeCourseAllocation, allocation_id)
    if not item or item.college_id != admin.college_id:
        raise HTTPException(404, "Allocation not found")
    item.is_active = False
    _audit(db, admin, "course.unallocated", "course_allocation", allocation_id)
    db.commit()


@router.patch("/course-allocations/{allocation_id}/restore")
def restore_allocation(
    allocation_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    item = db.get(CollegeCourseAllocation, allocation_id)
    if not item or item.college_id != admin.college_id:
        raise HTTPException(404, "Allocation not found")
    item.is_active = True
    _audit(db, admin, "course.allocation_restored", "course_allocation", allocation_id)
    db.commit()
    return {"status": "active"}


@router.get("/progress")
def progress(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    students = list(
        db.scalars(
            select(StudentProfile).where(StudentProfile.college_id == admin.college_id)
        )
    )
    result = []
    for student in students:
        rows = list(
            db.scalars(
                select(CourseEnrollment).where(
                    CourseEnrollment.user_id == student.user_id
                )
            )
        )
        average = (
            round(sum(x.progress_percentage for x in rows) / len(rows)) if rows else 0
        )
        evaluations = (
            db.scalar(
                select(func.count(AssignmentSubmission.id))
                .join(
                    CourseEnrollment,
                    CourseEnrollment.id == AssignmentSubmission.enrollment_id,
                )
                .where(
                    CourseEnrollment.user_id == student.user_id,
                    AssignmentSubmission.status == "evaluated",
                )
            )
            or 0
        )
        result.append(
            {
                "student_id": student.id,
                "student_name": student.full_name,
                "program_id": student.program_id,
                "program_name": student.program.name,
                "batch_id": student.college_batch_id,
                "batch_name": db.get(CollegeBatch, student.college_batch_id).name
                if student.college_batch_id
                else None,
                "section_id": student.college_section_id,
                "section_name": db.get(CollegeSection, student.college_section_id).name
                if student.college_section_id
                else None,
                "enrollments": len(rows),
                "completed": sum(x.status == "completed" for x in rows),
                "average_progress": average,
                "at_risk": bool(rows and average < 40),
                "evaluations_completed": evaluations,
            }
        )
    groups = {}
    for row in result:
        for kind, key, label in (
            ("program", "program_id", "program_name"),
            ("batch", "batch_id", "batch_name"),
            ("section", "section_id", "section_name"),
        ):
            if not row[key]:
                continue
            group = groups.setdefault(
                f"{kind}:{row[key]}",
                {
                    "type": kind,
                    "id": row[key],
                    "name": row[label],
                    "students": 0,
                    "at_risk_students": 0,
                    "total_progress": 0,
                },
            )
            group["students"] += 1
            group["at_risk_students"] += int(row["at_risk"])
            group["total_progress"] += row["average_progress"]
    grouped = []
    for group in groups.values():
        group["average_progress"] = round(
            group.pop("total_progress") / group["students"]
        )
        grouped.append(group)
    return {
        "students": result,
        "groups": grouped,
        "at_risk_count": sum(x["at_risk"] for x in result),
    }


@router.get("/certificates")
def college_certificates(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    student_ids = select(StudentProfile.user_id).where(
        StudentProfile.college_id == admin.college_id
    )
    issued = [
        {
            "id": x.id,
            "student_name": x.student_name,
            "course_title": x.course_title,
            "status": x.status,
            "issued_at": x.issued_at,
        }
        for x in db.scalars(
            select(Certificate)
            .where(Certificate.student_id.in_(student_ids))
            .order_by(Certificate.issued_at.desc())
        )
    ]
    eligible = []
    for x in db.scalars(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id.in_(student_ids),
            CourseEnrollment.status == "completed",
        )
    ):
        if not db.scalar(select(Certificate).where(Certificate.enrollment_id == x.id)):
            request = db.scalar(
                select(CollegeCertificateRequest).where(
                    CollegeCertificateRequest.enrollment_id == x.id
                )
            )
            eligible.append(
                {
                    "enrollment_id": x.id,
                    "student_name": x.user.student_profile.full_name,
                    "course_title": x.course.title,
                    "request_status": request.status if request else None,
                }
            )
    return {"issued": issued, "eligible": eligible}


@router.post("/certificates/request/{enrollment_id}", status_code=201)
def request_certificate(
    enrollment_id: uuid.UUID,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    enrollment = db.get(CourseEnrollment, enrollment_id)
    if (
        not enrollment
        or enrollment.user.student_profile.college_id != admin.college_id
        or enrollment.status != "completed"
    ):
        raise HTTPException(422, "Student is not eligible for this certificate")
    item = db.scalar(
        select(CollegeCertificateRequest).where(
            CollegeCertificateRequest.enrollment_id == enrollment_id
        )
    )
    if not item:
        item = CollegeCertificateRequest(
            college_id=admin.college_id,
            enrollment_id=enrollment_id,
            requested_by_user_id=admin.id,
        )
        db.add(item)
        db.flush()
        _audit(db, admin, "certificate.requested", "certificate_request", item.id)
        db.commit()
    return {"id": item.id, "status": item.status}


@router.get("/reports")
def reports(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    return {
        "dashboard": dashboard(admin, db),
        "programs": [
            {
                "name": p.program.name,
                "students": db.scalar(
                    select(func.count(StudentProfile.id)).where(
                        StudentProfile.college_id == admin.college_id,
                        StudentProfile.program_id == p.program_id,
                    )
                )
                or 0,
            }
            for p in db.scalars(
                select(CollegeProgram).where(
                    CollegeProgram.college_id == admin.college_id
                )
            )
        ],
        "generated_for": admin.college.name,
        "available_reports": [
            "students",
            "enrollments",
            "course-completion",
            "assessments",
            "certificates",
        ],
    }


def _report_rows(
    kind: str, college_id: uuid.UUID, db: Session
) -> tuple[list[str], list[list]]:
    student_ids = select(StudentProfile.user_id).where(
        StudentProfile.college_id == college_id
    )
    if kind == "students":
        headers = [
            "Name",
            "Email",
            "Mobile",
            "Program",
            "Year",
            "Roll Number",
            "Status",
        ]
        rows = [
            [
                x.full_name,
                x.user.email,
                x.user.mobile,
                x.program.name,
                x.current_year,
                x.roll_number or "",
                "Active" if x.user.is_active else "Inactive",
            ]
            for x in db.scalars(
                select(StudentProfile)
                .where(StudentProfile.college_id == college_id)
                .order_by(StudentProfile.full_name)
            )
        ]
    elif kind in {"enrollments", "course-completion"}:
        headers = ["Student", "Course", "Status", "Progress", "Enrolled At"]
        query = select(CourseEnrollment).where(
            CourseEnrollment.user_id.in_(student_ids)
        )
        if kind == "course-completion":
            query = query.where(CourseEnrollment.status == "completed")
        rows = [
            [
                x.user.student_profile.full_name,
                x.course.title,
                x.status,
                x.progress_percentage,
                x.enrolled_at,
            ]
            for x in db.scalars(query.order_by(CourseEnrollment.enrolled_at.desc()))
        ]
    elif kind == "assessments":
        headers = ["Student", "Course", "Attempt", "Percentage", "Passed", "Status"]
        rows = []
        for x in db.scalars(
            select(StudentQuizAttempt)
            .join(
                CourseEnrollment,
                CourseEnrollment.id == StudentQuizAttempt.enrollment_id,
            )
            .where(CourseEnrollment.user_id.in_(student_ids))
            .order_by(StudentQuizAttempt.started_at.desc())
        ):
            enrollment = db.get(CourseEnrollment, x.enrollment_id)
            rows.append(
                [
                    enrollment.user.student_profile.full_name,
                    enrollment.course.title,
                    x.attempt_number,
                    x.percentage,
                    "Yes" if x.passed else "No",
                    x.status,
                ]
            )
    elif kind == "certificates":
        headers = ["Student", "Course", "Certificate Number", "Status", "Issued At"]
        rows = [
            [
                x.student_name,
                x.course_title,
                x.certificate_number,
                x.status,
                x.issued_at,
            ]
            for x in db.scalars(
                select(Certificate)
                .where(Certificate.student_id.in_(student_ids))
                .order_by(Certificate.issued_at.desc())
            )
        ]
    else:
        raise HTTPException(404, "Unknown report")
    return headers, rows


@router.get("/reports/students.csv")
def export_students(
    admin: User = Depends(get_current_college_admin), db: Session = Depends(get_db)
):
    headers, rows = _report_rows("students", admin.college_id, db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    _audit(db, admin, "report.exported", "student_report")
    db.commit()
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="college-students.csv"'},
    )


@router.get("/reports/{kind}.csv")
def export_report_csv(
    kind: str,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    headers, rows = _report_rows(kind, admin.college_id, db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    _audit(db, admin, "report.exported", kind, format="csv")
    db.commit()
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="college-{kind}.csv"'},
    )


@router.get("/reports/{kind}.pdf")
def export_report_pdf(
    kind: str,
    admin: User = Depends(get_current_college_admin),
    db: Session = Depends(get_db),
):
    headers, rows = _report_rows(kind, admin.college_id, db)
    output = io.BytesIO()
    pdf = canvas.Canvas(output, pagesize=A4)
    width, height = A4
    y = height - 45
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(
        40, y, f"{admin.college.name} — {kind.replace('-', ' ').title()} Report"
    )
    y -= 28
    pdf.setFont("Helvetica-Bold", 7)
    pdf.drawString(40, y, " | ".join(headers))
    y -= 16
    pdf.setFont("Helvetica", 7)
    for row in rows:
        line = " | ".join(str(v or "") for v in row)
        for start in range(0, len(line), 125):
            if y < 45:
                pdf.showPage()
                pdf.setFont("Helvetica", 7)
                y = height - 45
            pdf.drawString(40, y, line[start : start + 125])
            y -= 11
        y -= 3
    pdf.save()
    output.seek(0)
    _audit(db, admin, "report.exported", kind, format="pdf")
    db.commit()
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="college-{kind}.pdf"'},
    )
