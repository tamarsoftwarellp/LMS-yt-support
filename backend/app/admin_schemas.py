import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

CourseStatus = Literal["draft", "published", "archived"]
LessonType = Literal["video", "article", "quiz", "assignment"]


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AdminMeOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    mobile: str
    role: Literal["admin", "super_admin"]
    is_active: bool
    created_at: datetime
    college_id: uuid.UUID | None = None
    college_name: str | None = None
    model_config = ConfigDict(from_attributes=True)


class AdminCourseBase(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=180)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    description: str | None = None
    level: str | None = Field(default=None, min_length=2, max_length=30)
    duration_hours: int | None = Field(default=None, gt=0)
    skills: list[str] | None = None
    status: CourseStatus | None = None
    thumbnail_url: str | None = Field(default=None, max_length=500)
    instructor_name: str | None = Field(default=None, max_length=180)


class AdminCourseCreateIn(AdminCourseBase):
    title: str = Field(min_length=2, max_length=180)
    description: str = Field(min_length=1)
    level: str = Field(min_length=2, max_length=30)
    duration_hours: int = Field(gt=0)
    skills: list[str] = Field(default_factory=list)
    status: CourseStatus = "draft"


class AdminCourseUpdateIn(AdminCourseBase):
    pass


class AdminSectionIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    sequence: int | None = Field(default=None, gt=0)


class AdminLessonIn(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    lesson_type: LessonType = "article"
    duration_minutes: int = Field(gt=0)
    sequence: int | None = Field(default=None, gt=0)
    # Accept a raw 11-character ID or a full YouTube URL. The router stores only the extracted ID.
    youtube_id: str | None = Field(default=None, max_length=500)
    article_content: str | None = None
    is_preview: bool = False


class ReorderPayload(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1)


class PublicationReadinessOut(BaseModel):
    is_ready: bool
    issues: list[str] = Field(default_factory=list)


class AdminLessonOut(BaseModel):
    id: uuid.UUID
    section_id: uuid.UUID
    title: str
    lesson_type: LessonType
    duration_minutes: int
    sequence: int
    youtube_id: str | None
    article_content: str | None
    is_preview: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AdminSectionOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    sequence: int
    created_at: datetime
    updated_at: datetime
    lessons: list[AdminLessonOut] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class AdminCourseListItem(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: str
    level: str
    duration_hours: int
    skills: list[str]
    status: CourseStatus
    thumbnail_url: str | None
    instructor_name: str | None
    created_by_user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    archived_at: datetime | None
    enrollment_count: int = 0
    section_count: int = 0
    lesson_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class AdminCourseDetailOut(AdminCourseListItem):
    publication_readiness: PublicationReadinessOut
    sections: list[AdminSectionOut] = Field(default_factory=list)


class PaginatedAdminCoursesOut(BaseModel):
    items: list[AdminCourseListItem]
    page: int
    page_size: int
    total: int
    pages: int


class ActionResult(BaseModel):
    detail: str
    model_config = ConfigDict(from_attributes=True)
