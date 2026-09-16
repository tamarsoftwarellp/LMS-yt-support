from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class InstitutionRegisterIn(BaseModel):
    college_name: str = Field(min_length=2, max_length=180)
    contact_name: str = Field(min_length=2, max_length=150)
    contact_email: EmailStr
    contact_phone: str = Field(min_length=7, max_length=20)
    address: str | None = Field(default=None, max_length=2000)
    admin_full_name: str = Field(min_length=2, max_length=150)
    admin_email: EmailStr
    admin_mobile: str = Field(min_length=7, max_length=15)
    admin_password: str = Field(min_length=8, max_length=128)


class InstitutionRegisterOut(BaseModel):
    college_id: str
    status: str
    message: str


class InstitutionActionIn(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)


class InstitutionOut(BaseModel):
    id: str
    name: str
    status: str
    contact_name: str | None
    contact_email: str | None
    contact_phone: str | None
    address: str | None
    student_count: int
    admin_count: int
    created_at: datetime
    approved_at: datetime | None
    rejected_reason: str | None


class InstitutionHistoryEntry(BaseModel):
    action: str
    reason: str | None
    performed_by_name: str | None
    created_at: datetime


class InstitutionDetailOut(InstitutionOut):
    history: list[InstitutionHistoryEntry]
