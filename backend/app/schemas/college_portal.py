from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InstitutionProfileOut(BaseModel):
    id: str
    name: str
    status: str
    contact_name: str | None
    contact_email: str | None
    contact_phone: str | None
    address: str | None
    website_url: str | None
    logo_url: str | None
    student_count: int
    program_count: int


class InstitutionProfileUpdateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contact_name: str = Field(min_length=2, max_length=150)
    contact_phone: str = Field(min_length=7, max_length=20)
    address: str | None = Field(default=None, max_length=2000)


class InstitutionProgramOut(BaseModel):
    id: str
    name: str
    offered: bool
    student_count: int


class InstitutionStudentOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    mobile: str
    program_id: str
    program_name: str
    current_year: str
    roll_number: str | None
    created_at: datetime
    is_active: bool
    progress_percentage: int
    enrollment_count: int
    batch_id: str | None = None
    batch_name: str | None = None
    section_id: str | None = None
    section_name: str | None = None
