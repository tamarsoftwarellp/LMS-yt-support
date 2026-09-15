from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, model_validator


class AssignmentUpsertIn(BaseModel):
    instructions: str = Field(min_length=1, max_length=10000)
    maximum_marks: int = Field(ge=1, le=10000)
    passing_marks: int = Field(ge=0, le=10000)
    maximum_attempts: int = Field(ge=1, le=20)
    allowed_submission_types: list[Literal["file", "text", "link"]] = Field(min_length=1)
    allowed_file_extensions: list[Literal["pdf", "docx", "zip"]] = Field(default_factory=list)
    maximum_file_size_mb: int = Field(default=50, ge=1, le=100)
    due_at: datetime | None = None
    allow_late_submission: bool = False
    allow_resubmission: bool = True

    @model_validator(mode="after")
    def validate_configuration(self):
        if self.passing_marks > self.maximum_marks:
            raise ValueError("Passing marks cannot exceed maximum marks")
        self.allowed_submission_types = list(dict.fromkeys(self.allowed_submission_types))
        self.allowed_file_extensions = list(dict.fromkeys(self.allowed_file_extensions))
        if "file" in self.allowed_submission_types and not self.allowed_file_extensions:
            raise ValueError("Select at least one allowed file extension")
        return self


class AssignmentEvaluationIn(BaseModel):
    marks_awarded: int = Field(ge=0, le=10000)
    decision: Literal["passed", "failed", "resubmission_required"]
    feedback: str | None = Field(default=None, max_length=10000)

