import io
import secrets
import uuid
from datetime import datetime, timezone

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .dependencies import get_current_admin, get_current_student
from .models import Certificate, CertificateEvent, CourseEnrollment, CourseLesson, LessonProgress, User

student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Certificates"])
admin_router = APIRouter(prefix="/api/v1/admin/certificates", tags=["Admin Certificates"])
public_router = APIRouter(prefix="/api/v1/certificates", tags=["Certificate Verification"])


class RevokeIn(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


def _number() -> str:
    now = datetime.now(timezone.utc)
    return f"EDU-{now:%Y%m}-{secrets.token_hex(5).upper()}"


def _out(item: Certificate, include_events: bool = False) -> dict:
    result = {"id": item.id, "certificate_number": item.certificate_number,
        "verification_token": item.verification_token, "student_id": item.student_id,
        "course_id": item.course_id, "enrollment_id": item.enrollment_id,
        "student_name": item.student_name, "course_title": item.course_title,
        "instructor_name": item.instructor_name, "status": item.status,
        "issued_at": item.issued_at, "revoked_at": item.revoked_at,
        "revocation_reason": item.revocation_reason}
    if include_events:
        result["events"] = [{"type": event.event_type, "details": event.details,
            "created_at": event.created_at} for event in item.events]
    return result


def _eligible(enrollment: CourseEnrollment, db: Session) -> bool:
    lesson_ids = list(db.scalars(select(CourseLesson.id).join(CourseLesson.section)
        .where(CourseLesson.section.has(course_id=enrollment.course_id))))
    completed = db.scalars(select(LessonProgress.lesson_id).where(
        LessonProgress.enrollment_id == enrollment.id, LessonProgress.status == "completed")).all()
    return bool(lesson_ids) and enrollment.status == "completed" and enrollment.progress_percentage == 100 and set(lesson_ids) <= set(completed)


def _issue(enrollment: CourseEnrollment, actor_id: uuid.UUID | None, db: Session,
           parent: Certificate | None = None) -> Certificate:
    student_name = enrollment.user.student_profile.full_name if enrollment.user.student_profile else enrollment.user.email
    item = Certificate(certificate_number=_number(), verification_token=secrets.token_urlsafe(32),
        student_id=enrollment.user_id, course_id=enrollment.course_id, enrollment_id=enrollment.id,
        parent_certificate_id=parent.id if parent else None, student_name=student_name,
        course_title=enrollment.course.title, instructor_name=enrollment.course.instructor_name,
        status="issued", issued_by_user_id=actor_id)
    db.add(item); db.flush()
    db.add(CertificateEvent(certificate_id=item.id, event_type="reissued" if parent else "issued",
        actor_user_id=actor_id, details={"parent_certificate_id": str(parent.id) if parent else None}))
    return item


def _pdf(item: Certificate) -> io.BytesIO:
    settings = get_settings()
    verify_url = f"{settings.public_app_url.rstrip('/')}/verify-certificate/{item.verification_token}"
    qr = qrcode.make(verify_url)
    qr_buffer = io.BytesIO(); qr.save(qr_buffer, format="PNG"); qr_buffer.seek(0)
    output = io.BytesIO(); page = landscape(A4); width, height = page
    pdf = canvas.Canvas(output, pagesize=page, pageCompression=1)
    navy = colors.HexColor("#1B3A6B"); gold = colors.HexColor("#D97706"); muted = colors.HexColor("#5A6A8A")
    pdf.setFillColor(colors.HexColor("#F7F9FD")); pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setStrokeColor(navy); pdf.setLineWidth(5); pdf.rect(22, 22, width-44, height-44, fill=0, stroke=1)
    pdf.setStrokeColor(gold); pdf.setLineWidth(1.5); pdf.rect(32, 32, width-64, height-64, fill=0, stroke=1)
    pdf.setFillColor(navy); pdf.setFont("Helvetica-Bold", 22); pdf.drawCentredString(width/2, height-88, "EDUCONNECT")
    pdf.setFillColor(muted); pdf.setFont("Helvetica", 12); pdf.drawCentredString(width/2, height-118, "CERTIFICATE OF COMPLETION")
    pdf.setFillColor(muted); pdf.setFont("Helvetica", 11); pdf.drawCentredString(width/2, height-166, "This certificate is proudly presented to")
    pdf.setFillColor(navy); pdf.setFont("Helvetica-Bold", 29); pdf.drawCentredString(width/2, height-212, item.student_name)
    pdf.setStrokeColor(gold); pdf.setLineWidth(1); pdf.line(width/2-180, height-224, width/2+180, height-224)
    pdf.setFillColor(muted); pdf.setFont("Helvetica", 11); pdf.drawCentredString(width/2, height-258, "for successfully completing the course")
    pdf.setFillColor(navy); pdf.setFont("Helvetica-Bold", 20); pdf.drawCentredString(width/2, height-294, item.course_title)
    issued = item.issued_at.date().strftime("%d %B %Y") if item.issued_at else datetime.now(timezone.utc).strftime("%d %B %Y")
    pdf.setFillColor(muted); pdf.setFont("Helvetica", 9); pdf.drawString(72, 78, f"Issued: {issued}")
    pdf.drawString(72, 61, f"Certificate No: {item.certificate_number}")
    pdf.drawImage(ImageReader(qr_buffer), width-145, 55, 72, 72, preserveAspectRatio=True, mask="auto")
    pdf.setFont("Helvetica", 7); pdf.drawCentredString(width-109, 47, "Scan to verify")
    if item.instructor_name:
        pdf.setFillColor(navy); pdf.setFont("Helvetica-Bold", 10); pdf.drawCentredString(width/2, 76, item.instructor_name)
        pdf.setFillColor(muted); pdf.setFont("Helvetica", 8); pdf.drawCentredString(width/2, 60, "Course Instructor")
    pdf.showPage(); pdf.save(); output.seek(0); return output


@student_router.get("/certificates")
def my_certificates(user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    items = db.scalars(select(Certificate).where(Certificate.student_id == user.id)
        .order_by(Certificate.issued_at.desc())).all()
    return [_out(item) for item in items]


@student_router.post("/enrollments/{enrollment_id}/certificate", status_code=status.HTTP_201_CREATED)
def issue_certificate(enrollment_id: uuid.UUID, response: Response,
                      user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    enrollment = db.get(CourseEnrollment, enrollment_id)
    if not enrollment or enrollment.user_id != user.id:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    existing = db.scalar(select(Certificate).where(Certificate.enrollment_id == enrollment.id,
        Certificate.status == "issued").order_by(Certificate.issued_at.desc()))
    if existing:
        response.status_code = status.HTTP_200_OK
        return _out(existing)
    if not _eligible(enrollment, db):
        raise HTTPException(status_code=409, detail="Complete every course lesson before generating a certificate")
    item = _issue(enrollment, user.id, db); db.commit(); db.refresh(item)
    return _out(item)


@student_router.get("/certificates/{certificate_id}/download")
def download_certificate(certificate_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    item = db.get(Certificate, certificate_id)
    if not item or item.student_id != user.id:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if item.status != "issued":
        raise HTTPException(status_code=409, detail="This certificate is no longer valid")
    return StreamingResponse(_pdf(item), media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{item.certificate_number}.pdf"'})


@public_router.get("/verify/{verification_token}")
def verify_certificate(verification_token: str, db: Session = Depends(get_db)):
    item = db.scalar(select(Certificate).where(Certificate.verification_token == verification_token))
    if not item:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"is_valid": item.status == "issued", "certificate_number": item.certificate_number,
        "student_name": item.student_name, "course_title": item.course_title,
        "issued_at": item.issued_at, "status": item.status,
        "revoked_at": item.revoked_at, "revocation_reason": item.revocation_reason}


@admin_router.get("")
def list_certificates(search: str | None = Query(default=None, max_length=120),
                      certificate_status: str | None = Query(default=None, alias="status"),
                      admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    del admin
    query = select(Certificate)
    if certificate_status:
        query = query.where(Certificate.status == certificate_status)
    if search and search.strip():
        value = f"%{search.strip()}%"
        query = query.where(or_(Certificate.student_name.ilike(value), Certificate.course_title.ilike(value),
            Certificate.certificate_number.ilike(value)))
    items = db.scalars(query.order_by(Certificate.issued_at.desc())).all()
    return [_out(item, include_events=True) for item in items]


@admin_router.post("/{certificate_id}/revoke")
def revoke_certificate(certificate_id: uuid.UUID, payload: RevokeIn,
                       admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    item = db.get(Certificate, certificate_id)
    if not item:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if item.status != "issued":
        raise HTTPException(status_code=409, detail="Only an issued certificate can be revoked")
    item.status = "revoked"; item.revoked_at = datetime.now(timezone.utc); item.revocation_reason = payload.reason.strip()
    db.add(CertificateEvent(certificate_id=item.id, event_type="revoked", actor_user_id=admin.id,
        details={"reason": item.revocation_reason})); db.commit(); db.refresh(item)
    return _out(item, include_events=True)


@admin_router.post("/{certificate_id}/reissue", status_code=status.HTTP_201_CREATED)
def reissue_certificate(certificate_id: uuid.UUID, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    item = db.get(Certificate, certificate_id)
    if not item:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if item.status != "revoked":
        raise HTTPException(status_code=409, detail="Reissue requires a revoked certificate")
    enrollment = db.get(CourseEnrollment, item.enrollment_id)
    if not enrollment or not _eligible(enrollment, db):
        raise HTTPException(status_code=409, detail="Enrollment is no longer eligible for certification")
    item.status = "superseded"
    replacement = _issue(enrollment, admin.id, db, parent=item)
    db.add(CertificateEvent(certificate_id=item.id, event_type="superseded", actor_user_id=admin.id,
        details={"replacement_certificate_id": str(replacement.id)}))
    db.commit(); db.refresh(replacement)
    return _out(replacement, include_events=True)
