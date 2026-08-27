"""course curriculum and lesson progress"""
from alembic import op
import sqlalchemy as sa

revision = "20260826_04"
down_revision = "20260825_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("course_sections",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("course_id", sa.Uuid(), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(180), nullable=False), sa.Column("sequence", sa.Integer(), nullable=False))
    op.create_index("ix_course_sections_course_id", "course_sections", ["course_id"])
    op.create_table("course_lessons",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("section_id", sa.Uuid(), sa.ForeignKey("course_sections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(220), nullable=False), sa.Column("lesson_type", sa.String(30), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False), sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("youtube_id", sa.String(30), nullable=True), sa.Column("article_content", sa.Text(), nullable=True),
        sa.Column("is_preview", sa.Boolean(), nullable=False))
    op.create_index("ix_course_lessons_section_id", "course_lessons", ["section_id"])
    op.create_table("lesson_progress",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(30), nullable=False), sa.Column("watched_seconds", sa.Integer(), nullable=False),
        sa.Column("last_position_seconds", sa.Integer(), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson_progress"))
    op.create_index("ix_lesson_progress_enrollment_id", "lesson_progress", ["enrollment_id"])
    op.create_index("ix_lesson_progress_lesson_id", "lesson_progress", ["lesson_id"])


def downgrade() -> None:
    op.drop_table("lesson_progress")
    op.drop_table("course_lessons")
    op.drop_table("course_sections")
