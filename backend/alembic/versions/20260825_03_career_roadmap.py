"""career inputs, AI roadmaps, courses and enrollments"""
from alembic import op
import sqlalchemy as sa

revision = "20260825_03"
down_revision = "20260825_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("skills",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("name", sa.String(120), nullable=False, unique=True),
        sa.Column("category", sa.String(80), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_skills_name", "skills", ["name"])
    op.create_table("student_skills",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("skill_id", sa.Uuid(), sa.ForeignKey("skills.id"), nullable=False), sa.Column("proficiency_level", sa.String(30), nullable=False),
        sa.Column("experience_months", sa.Integer(), nullable=True), sa.Column("source", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "skill_id", name="uq_student_skill"))
    op.create_index("ix_student_skills_user_id", "student_skills", ["user_id"])
    op.create_index("ix_student_skills_skill_id", "student_skills", ["skill_id"])
    op.create_table("career_goals",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("target_role", sa.String(150), nullable=False), sa.Column("preferred_domain", sa.String(120), nullable=False),
        sa.Column("current_level", sa.String(30), nullable=False), sa.Column("target_duration_months", sa.Integer(), nullable=False),
        sa.Column("weekly_learning_hours", sa.Integer(), nullable=False), sa.Column("goal_description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_career_goals_user_id", "career_goals", ["user_id"])
    op.create_table("student_resumes",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("original_file_name", sa.String(255), nullable=False), sa.Column("storage_path", sa.String(500), nullable=False),
        sa.Column("mime_type", sa.String(120), nullable=False), sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("parsing_status", sa.String(30), nullable=False), sa.Column("parsed_text", sa.Text(), nullable=True),
        sa.Column("parsed_data", sa.JSON(), nullable=False), sa.Column("is_current", sa.Boolean(), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True), sa.Column("processing_error", sa.Text(), nullable=True))
    op.create_index("ix_student_resumes_user_id", "student_resumes", ["user_id"])
    op.create_table("courses",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("title", sa.String(180), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=False), sa.Column("level", sa.String(30), nullable=False),
        sa.Column("duration_hours", sa.Integer(), nullable=False), sa.Column("skills", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_courses_status", "courses", ["status"])
    op.create_table("student_roadmaps",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("career_goal_id", sa.Uuid(), sa.ForeignKey("career_goals.id"), nullable=False),
        sa.Column("resume_id", sa.Uuid(), sa.ForeignKey("student_resumes.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False), sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("duration_weeks", sa.Integer(), nullable=False), sa.Column("skill_gaps", sa.JSON(), nullable=False),
        sa.Column("phases", sa.JSON(), nullable=False), sa.Column("recommendations", sa.JSON(), nullable=False),
        sa.Column("input_snapshot", sa.JSON(), nullable=False), sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("prompt_version", sa.String(30), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False), sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_student_roadmaps_user_id", "student_roadmaps", ["user_id"])
    op.create_table("course_enrollments",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Uuid(), sa.ForeignKey("courses.id"), nullable=False),
        sa.Column("roadmap_id", sa.Uuid(), sa.ForeignKey("student_roadmaps.id"), nullable=True),
        sa.Column("status", sa.String(30), nullable=False), sa.Column("progress_percentage", sa.Integer(), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "course_id", name="uq_student_course_enrollment"))
    op.create_index("ix_course_enrollments_user_id", "course_enrollments", ["user_id"])
    op.create_index("ix_course_enrollments_course_id", "course_enrollments", ["course_id"])


def downgrade() -> None:
    for table in ["course_enrollments", "student_roadmaps", "courses", "student_resumes", "career_goals", "student_skills", "skills"]:
        op.drop_table(table)
