"""coding-test lessons: challenges + student submissions"""
from alembic import op
import sqlalchemy as sa

revision = "20260916_16_coding_challenges"
down_revision = "20260912_15_college_complete"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_course_lessons_type", "course_lessons", type_="check")
    op.create_check_constraint("ck_course_lessons_type", "course_lessons",
        "lesson_type in ('video', 'article', 'quiz', 'assignment', 'coding')")
    op.create_table("coding_challenges",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column("function_name", sa.String(80), nullable=False),
        sa.Column("starter_code", sa.Text(), nullable=False),
        sa.Column("test_cases", sa.JSON(), nullable=False),
        sa.Column("maximum_attempts", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("maximum_attempts > 0", name="ck_coding_challenges_maximum_attempts"),
        sa.CheckConstraint("status in ('draft', 'published')", name="ck_coding_challenges_status"))
    op.create_index("ix_coding_challenges_lesson_id", "coding_challenges", ["lesson_id"])
    op.create_index("ix_coding_challenges_status", "coding_challenges", ["status"])
    op.create_table("student_coding_submissions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("challenge_id", sa.Uuid(), sa.ForeignKey("coding_challenges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("passed_count", sa.Integer(), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("challenge_id", "enrollment_id", "attempt_number", name="uq_coding_enrollment_attempt"))
    op.create_index("ix_student_coding_submissions_challenge_id", "student_coding_submissions", ["challenge_id"])
    op.create_index("ix_student_coding_submissions_enrollment_id", "student_coding_submissions", ["enrollment_id"])


def downgrade() -> None:
    op.drop_table("student_coding_submissions")
    op.drop_table("coding_challenges")
    op.drop_constraint("ck_course_lessons_type", "course_lessons", type_="check")
    op.create_check_constraint("ck_course_lessons_type", "course_lessons",
        "lesson_type in ('video', 'article', 'quiz', 'assignment')")
