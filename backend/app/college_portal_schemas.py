from datetime import datetime

from pydantic import BaseModel, Field


class InstitutionProfileOut(BaseModel):
    id: str
    name: str
    status: str
    contact_name: str | None
    contact_email: str | None
    contact_phone: str | None
    address: str | None
    student_count: int
    program_count: int


class InstitutionProfileUpdateIn(BaseModel):
    contact_name: str = Field(min_length=2, max_length=150)
    contact_email: str = Field(min_length=3, max_length=254)
    contact_phone: str = Field(min_length=7, max_length=20)
    address: str | None = Field(default=None, max_length=2000)


class InstitutionProgramOut(BaseModel):
    id: str
    name: str
    offered: bool
    student_count: int


class InstitutionStudentOut(BaseModel):
    full_name: str
    email: str
    mobile: str
    program_name: str
    current_year: str
    roll_number: str | None
    created_at: datetime
