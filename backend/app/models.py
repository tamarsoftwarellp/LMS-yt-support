import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class College(Base):
    __tablename__ = "colleges"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    programs: Mapped[list["CollegeProgram"]] = relationship(back_populates="college", cascade="all, delete-orphan")


class Program(Base):
    __tablename__ = "programs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    colleges: Mapped[list["CollegeProgram"]] = relationship(back_populates="program", cascade="all, delete-orphan")


class CollegeProgram(Base):
    __tablename__ = "college_programs"
    __table_args__ = (UniqueConstraint("college_id", "program_id", name="uq_college_program"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), index=True)
    program_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("programs.id", ondelete="CASCADE"), index=True)
    college: Mapped[College] = relationship(back_populates="programs")
    program: Mapped[Program] = relationship(back_populates="colleges")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    mobile: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="student", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    student_profile: Mapped["StudentProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[str] = mapped_column(String(150))
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id"), index=True)
    program_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("programs.id"), index=True)
    current_year: Mapped[str] = mapped_column(String(30))
    roll_number: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="student_profile")
    college: Mapped[College] = relationship()
    program: Mapped[Program] = relationship()


class StudentOnboardingStep(Base):
    __tablename__ = "student_onboarding_steps"
    __table_args__ = (UniqueConstraint("user_id", "step_key", name="uq_student_onboarding_step"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    step_key: Mapped[str] = mapped_column(String(50), index=True)
    step_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="in_progress")
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(Text, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(80), default="Other")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StudentSkill(Base):
    __tablename__ = "student_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_student_skill"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("skills.id"), index=True)
    proficiency_level: Mapped[str] = mapped_column(String(30))
    experience_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    skill: Mapped[Skill] = relationship()


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    target_role: Mapped[str] = mapped_column(String(150))
    preferred_domain: Mapped[str] = mapped_column(String(120))
    current_level: Mapped[str] = mapped_column(String(30))
    target_duration_months: Mapped[int] = mapped_column(Integer)
    weekly_learning_hours: Mapped[int] = mapped_column(Integer)
    goal_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class StudentResume(Base):
    __tablename__ = "student_resumes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    original_file_name: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(String(500))
    mime_type: Mapped[str] = mapped_column(String(120))
    file_size: Mapped[int] = mapped_column(Integer)
    parsing_status: Mapped[str] = mapped_column(String(30), default="uploaded")
    parsed_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_data: Mapped[dict] = mapped_column(JSON, default=dict)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_error: Mapped[str | None] = mapped_column(Text, nullable=True)


class Course(Base):
    __tablename__ = "courses"
    __table_args__ = (
        CheckConstraint("duration_hours > 0", name="ck_courses_duration_hours_positive"),
        CheckConstraint("status in ('draft', 'published', 'archived')", name="ck_courses_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(180), unique=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    level: Mapped[str] = mapped_column(String(30))
    duration_hours: Mapped[int] = mapped_column(Integer)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instructor_name: Mapped[str | None] = mapped_column(String(180), nullable=True)
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[User | None] = relationship()
    sections: Mapped[list["CourseSection"]] = relationship(back_populates="course", cascade="all, delete-orphan", order_by="CourseSection.sequence")


class CourseSection(Base):
    __tablename__ = "course_sections"
    __table_args__ = (
        UniqueConstraint("course_id", "sequence", name="uq_course_section_sequence"),
        CheckConstraint("sequence > 0", name="ck_course_sections_sequence_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    sequence: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    course: Mapped[Course] = relationship(back_populates="sections")
    lessons: Mapped[list["CourseLesson"]] = relationship(back_populates="section", cascade="all, delete-orphan", order_by="CourseLesson.sequence")


class CourseLesson(Base):
    __tablename__ = "course_lessons"
    __table_args__ = (
        UniqueConstraint("section_id", "sequence", name="uq_course_lesson_sequence"),
        CheckConstraint("sequence > 0", name="ck_course_lessons_sequence_positive"),
        CheckConstraint("duration_minutes > 0", name="ck_course_lessons_duration_positive"),
        CheckConstraint("lesson_type in ('video', 'article', 'quiz', 'assignment')", name="ck_course_lessons_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    section_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_sections.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(220))
    lesson_type: Mapped[str] = mapped_column(String(30), default="article")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)
    sequence: Mapped[int] = mapped_column(Integer)
    youtube_id: Mapped[str | None] = mapped_column(String(30), nullable=True)
    article_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    section: Mapped[CourseSection] = relationship(back_populates="lessons")
    quiz: Mapped["Quiz | None"] = relationship(back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    assignment: Mapped["Assignment | None"] = relationship(back_populates="lesson", uselist=False, cascade="all, delete-orphan")


class Quiz(Base):
    __tablename__ = "quizzes"
    __table_args__ = (
        CheckConstraint("passing_percentage between 1 and 100", name="ck_quizzes_passing_percentage"),
        CheckConstraint("maximum_attempts > 0", name="ck_quizzes_maximum_attempts"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_lessons.id", ondelete="CASCADE"), unique=True, index=True)
    instructions: Mapped[str] = mapped_column(Text, default="Answer all questions and submit your attempt.")
    passing_percentage: Mapped[int] = mapped_column(Integer, default=60)
    maximum_attempts: Mapped[int] = mapped_column(Integer, default=3)
    time_limit_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    show_explanations: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    lesson: Mapped[CourseLesson] = relationship(back_populates="quiz")
    questions: Mapped[list["QuizQuestion"]] = relationship(back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.sequence")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    __table_args__ = (UniqueConstraint("quiz_id", "sequence", name="uq_quiz_question_sequence"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    question_text: Mapped[str] = mapped_column(Text)
    question_type: Mapped[str] = mapped_column(String(30))
    marks: Mapped[int] = mapped_column(Integer, default=1)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer)
    quiz: Mapped[Quiz] = relationship(back_populates="questions")
    options: Mapped[list["QuizOption"]] = relationship(back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.sequence")


class QuizOption(Base):
    __tablename__ = "quiz_options"
    __table_args__ = (UniqueConstraint("question_id", "sequence", name="uq_quiz_option_sequence"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quiz_questions.id", ondelete="CASCADE"), index=True)
    option_text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    sequence: Mapped[int] = mapped_column(Integer)
    question: Mapped[QuizQuestion] = relationship(back_populates="options")


class StudentRoadmap(Base):
    __tablename__ = "student_roadmaps"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    career_goal_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("career_goals.id"))
    resume_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("student_resumes.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text)
    duration_weeks: Mapped[int] = mapped_column(Integer)
    skill_gaps: Mapped[list] = mapped_column(JSON, default=list)
    phases: Mapped[list] = mapped_column(JSON, default=list)
    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    input_snapshot: Mapped[dict] = mapped_column(JSON)
    model_name: Mapped[str] = mapped_column(String(100))
    prompt_version: Mapped[str] = mapped_column(String(30), default="v1")
    status: Mapped[str] = mapped_column(String(30), default="generated")
    version: Mapped[int] = mapped_column(Integer, default=1)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_student_course_enrollment"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id"), index=True)
    roadmap_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("student_roadmaps.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="enrolled")
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    course: Mapped[Course] = relationship()
    user: Mapped[User] = relationship()
    lesson_progress: Mapped[list["LessonProgress"]] = relationship(cascade="all, delete-orphan")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson_progress"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_enrollments.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_lessons.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(30), default="in_progress")
    watched_seconds: Mapped[int] = mapped_column(Integer, default=0)
    last_position_seconds: Mapped[int] = mapped_column(Integer, default=0)
    video_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    watched_ranges: Mapped[list] = mapped_column(JSON, default=list)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class StudentQuizAttempt(Base):
    __tablename__ = "student_quiz_attempts"
    __table_args__ = (UniqueConstraint("quiz_id", "enrollment_id", "attempt_number", name="uq_quiz_enrollment_attempt"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_enrollments.id", ondelete="CASCADE"), index=True)
    attempt_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="in_progress")
    earned_marks: Mapped[int] = mapped_column(Integer, default=0)
    total_marks: Mapped[int] = mapped_column(Integer, default=0)
    percentage: Mapped[int] = mapped_column(Integer, default=0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    answers: Mapped[list["StudentQuizAnswer"]] = relationship(cascade="all, delete-orphan")


class StudentQuizAnswer(Base):
    __tablename__ = "student_quiz_answers"
    __table_args__ = (UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question_answer"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("student_quiz_attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quiz_questions.id", ondelete="CASCADE"), index=True)
    selected_option_ids: Mapped[list] = mapped_column(JSON, default=list)
    awarded_marks: Mapped[int] = mapped_column(Integer, default=0)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        CheckConstraint("maximum_marks > 0", name="ck_assignments_maximum_marks"),
        CheckConstraint("passing_marks >= 0 and passing_marks <= maximum_marks", name="ck_assignments_passing_marks"),
        CheckConstraint("maximum_attempts > 0", name="ck_assignments_maximum_attempts"),
        CheckConstraint("status in ('draft', 'published')", name="ck_assignments_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_lessons.id", ondelete="CASCADE"), unique=True, index=True)
    instructions: Mapped[str] = mapped_column(Text)
    maximum_marks: Mapped[int] = mapped_column(Integer, default=100)
    passing_marks: Mapped[int] = mapped_column(Integer, default=40)
    maximum_attempts: Mapped[int] = mapped_column(Integer, default=1)
    allowed_submission_types: Mapped[list] = mapped_column(JSON, default=lambda: ["file", "text", "link"])
    allowed_file_extensions: Mapped[list] = mapped_column(JSON, default=lambda: ["pdf", "docx", "zip"])
    maximum_file_size_mb: Mapped[int] = mapped_column(Integer, default=50)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    allow_late_submission: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_resubmission: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    lesson: Mapped[CourseLesson] = relationship(back_populates="assignment")
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(back_populates="assignment", cascade="all, delete-orphan")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    __table_args__ = (
        UniqueConstraint("assignment_id", "enrollment_id", "attempt_number", name="uq_assignment_enrollment_attempt"),
        CheckConstraint("status in ('draft', 'submitted', 'evaluated', 'resubmission_required')", name="ck_assignment_submissions_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    assignment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assignments.id", ondelete="CASCADE"), index=True)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_enrollments.id", ondelete="CASCADE"), index=True)
    attempt_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    text_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    link_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    original_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    storage_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_late: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    assignment: Mapped[Assignment] = relationship(back_populates="submissions")
    enrollment: Mapped[CourseEnrollment] = relationship()
    evaluations: Mapped[list["AssignmentEvaluation"]] = relationship(cascade="all, delete-orphan", order_by="AssignmentEvaluation.evaluated_at")


class AssignmentEvaluation(Base):
    __tablename__ = "assignment_evaluations"
    __table_args__ = (CheckConstraint("decision in ('passed', 'failed', 'resubmission_required')", name="ck_assignment_evaluations_decision"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assignment_submissions.id", ondelete="CASCADE"), index=True)
    evaluated_by_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    marks_awarded: Mapped[int] = mapped_column(Integer)
    decision: Mapped[str] = mapped_column(String(30))
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StudentLearningActivity(Base):
    __tablename__ = "student_learning_activity"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    enrollment_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=True, index=True)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("course_lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_type: Mapped[str] = mapped_column(String(50), index=True)
    seconds_delta: Mapped[int] = mapped_column(Integer, default=0)
    activity_data: Mapped[dict] = mapped_column(JSON, default=dict)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class Certificate(Base):
    __tablename__ = "certificates"
    __table_args__ = (
        CheckConstraint("status in ('issued', 'revoked', 'superseded')", name="ck_certificates_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    certificate_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    verification_token: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id"), index=True)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("course_enrollments.id", ondelete="CASCADE"), index=True)
    parent_certificate_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("certificates.id"), nullable=True, index=True)
    student_name: Mapped[str] = mapped_column(String(180))
    course_title: Mapped[str] = mapped_column(String(220))
    instructor_name: Mapped[str | None] = mapped_column(String(180), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="issued", index=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revocation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    issued_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    student: Mapped[User] = relationship(foreign_keys=[student_id])
    course: Mapped[Course] = relationship()
    enrollment: Mapped[CourseEnrollment] = relationship()
    events: Mapped[list["CertificateEvent"]] = relationship(cascade="all, delete-orphan", order_by="CertificateEvent.created_at")


class CertificateEvent(Base):
    __tablename__ = "certificate_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    certificate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("certificates.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class ResumeBuilderProfile(Base):
    __tablename__ = "resume_builder_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    headline: Mapped[str | None] = mapped_column(String(180), nullable=True)
    location: Mapped[str | None] = mapped_column(String(180), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    professional_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    educations: Mapped[list] = mapped_column(JSON, default=list)
    experiences: Mapped[list] = mapped_column(JSON, default=list)
    projects: Mapped[list] = mapped_column(JSON, default=list)
    certifications: Mapped[list] = mapped_column(JSON, default=list)
    achievements: Mapped[list] = mapped_column(JSON, default=list)
    languages: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class GeneratedResume(Base):
    __tablename__ = "generated_resumes"
    __table_args__ = (UniqueConstraint("user_id", "version", name="uq_generated_resume_user_version"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    target_role: Mapped[str] = mapped_column(String(180), index=True)
    version: Mapped[int] = mapped_column(Integer)
    input_snapshot: Mapped[dict] = mapped_column(JSON)
    content: Mapped[dict] = mapped_column(JSON)
    model_name: Mapped[str] = mapped_column(String(100))
    prompt_version: Mapped[str] = mapped_column(String(30), default="resume-groq-v1")
    status: Mapped[str] = mapped_column(String(30), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    evaluations: Mapped[list["ResumeAtsEvaluation"]] = relationship(cascade="all, delete-orphan", order_by="ResumeAtsEvaluation.created_at")


class ResumeAtsEvaluation(Base):
    __tablename__ = "resume_ats_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("generated_resumes.id", ondelete="CASCADE"), index=True)
    score: Mapped[int] = mapped_column(Integer)
    grade: Mapped[str] = mapped_column(String(30))
    breakdown: Mapped[dict] = mapped_column(JSON)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    issues: Mapped[list] = mapped_column(JSON, default=list)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
