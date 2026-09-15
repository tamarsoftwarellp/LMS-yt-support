import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProgramOut(BaseModel):
    id: uuid.UUID
    name: str
    model_config = ConfigDict(from_attributes=True)


class CollegeOut(BaseModel):
    id: uuid.UUID
    name: str
    model_config = ConfigDict(from_attributes=True)


class StudentRegistrationIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    mobile: str = Field(pattern=r"^[6-9]\d{9}$")
    password: str = Field(min_length=8, max_length=128)
    college_id: uuid.UUID
    program_id: uuid.UUID
    current_year: str = Field(min_length=2, max_length=30)
    roll_number: str | None = Field(default=None, max_length=80)
    accept_terms: bool

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Full name is required")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("roll_number")
    @classmethod
    def normalize_roll_number(cls, value: str | None) -> str | None:
        value = value.strip() if value else None
        return value or None

    @field_validator("accept_terms")
    @classmethod
    def terms_are_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Terms must be accepted")
        return value


class StudentRegistrationOut(BaseModel):
    user_id: uuid.UUID
    student_profile_id: uuid.UUID
    full_name: str
    email: EmailStr
    created_at: datetime
    message: str = "Student account created successfully"


class StudentLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshIn(BaseModel):
    refresh_token: str


class CurrentStudentOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    mobile: str
    role: str
    full_name: str
    college_id: uuid.UUID
    college_name: str
    program_id: uuid.UUID
    program_name: str
    current_year: str
    roll_number: str | None


class OnboardingStepIn(BaseModel):
    data: dict
    status: str = Field(default="in_progress", pattern=r"^(in_progress|completed)$")


class OnboardingStepOut(BaseModel):
    step_key: str
    step_number: int
    status: str
    data: dict
    updated_at: datetime


class OnboardingProgressOut(BaseModel):
    current_step: int
    completed_steps: list[str]
    overall_percentage: int
    steps: list[OnboardingStepOut]
