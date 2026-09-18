from pydantic import BaseModel, Field, HttpUrl


class ResumeEntry(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    subtitle: str | None = Field(default=None, max_length=220)
    start_date: str | None = Field(default=None, max_length=30)
    end_date: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    bullets: list[str] = Field(default_factory=list, max_length=12)
    technologies: list[str] = Field(default_factory=list, max_length=30)
    url: str | None = Field(default=None, max_length=500)


class ResumeBuilderIn(BaseModel):
    headline: str | None = Field(default=None, max_length=180)
    location: str | None = Field(default=None, max_length=180)
    linkedin_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    professional_summary: str | None = Field(default=None, max_length=2500)
    educations: list[ResumeEntry] = Field(default_factory=list, max_length=10)
    experiences: list[ResumeEntry] = Field(default_factory=list, max_length=20)
    projects: list[ResumeEntry] = Field(default_factory=list, max_length=20)
    certifications: list[ResumeEntry] = Field(default_factory=list, max_length=20)
    achievements: list[str] = Field(default_factory=list, max_length=30)
    languages: list[str] = Field(default_factory=list, max_length=20)


class GenerateResumeIn(BaseModel):
    target_role: str = Field(min_length=2, max_length=180)
    title: str | None = Field(default=None, max_length=180)


class ResumeContent(BaseModel):
    professional_summary: str = Field(min_length=30, max_length=1500)
    skills: list[str] = Field(default_factory=list, max_length=60)
    educations: list[ResumeEntry] = Field(default_factory=list)
    experiences: list[ResumeEntry] = Field(default_factory=list)
    projects: list[ResumeEntry] = Field(default_factory=list)
    certifications: list[ResumeEntry] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


class UpdateResumeIn(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=180)
    content: ResumeContent
