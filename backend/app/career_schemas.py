import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SkillInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(default="Other", max_length=80)
    proficiency_level: Literal["Beginner", "Intermediate", "Advanced", "Expert"]
    experience_months: int | None = Field(default=None, ge=0, le=600)


class SkillOut(SkillInput):
    id: uuid.UUID
    source: str


class CareerGoalInput(BaseModel):
    target_role: str = Field(min_length=2, max_length=150)
    preferred_domain: str = Field(min_length=2, max_length=120)
    current_level: Literal["Beginner", "Intermediate", "Advanced"]
    target_duration_months: int = Field(ge=1, le=24)
    weekly_learning_hours: int = Field(ge=1, le=60)
    goal_description: str | None = Field(default=None, max_length=1000)


class CareerGoalOut(CareerGoalInput):
    id: uuid.UUID
    updated_at: datetime


class SkillGap(BaseModel):
    skill: str
    priority: Literal["high", "medium", "low"]
    reason: str


class RoadmapProject(BaseModel):
    title: str
    description: str


class RoadmapPhase(BaseModel):
    sequence: int
    title: str
    duration_weeks: int
    objective: str
    skills: list[str]
    milestones: list[str]
    projects: list[RoadmapProject]


class RoadmapDraft(BaseModel):
    title: str
    summary: str
    duration_weeks: int
    skill_gaps: list[SkillGap]
    phases: list[RoadmapPhase]

