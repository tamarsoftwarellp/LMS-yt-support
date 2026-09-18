"""coding tests with monaco-editor style submissions"""
from alembic import op
import sqlalchemy as sa

revision = "20260917_16_coding_tests"
down_revision = "20260912_15_college_complete"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_course_lessons_type", "course_lessons", type_="check")
    op.create_check_constraint("ck_course_lessons_type", "course_lessons",
        "lesson_type in ('video', 'article', 'quiz', 'assignment', 'coding_test')")

    op.create_table("coding_tests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("mode", sa.String(20), nullable=False), sa.Column("problem_statement", sa.Text(), nullable=False),
        sa.Column("supported_languages", sa.JSON(), nullable=False), sa.Column("starter_code", sa.JSON(), nullable=False),
        sa.Column("maximum_attempts", sa.Integer(), nullable=False), sa.Column("time_limit_minutes", sa.Integer(), nullable=True),
        sa.Column("passing_percentage", sa.Integer(), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("mode in ('algorithmic', 'web', 'react')", name="ck_coding_tests_mode"),
        sa.CheckConstraint("maximum_attempts > 0", name="ck_coding_tests_maximum_attempts"),
        sa.CheckConstraint("passing_percentage between 1 and 100", name="ck_coding_tests_passing_percentage"),
        sa.CheckConstraint("status in ('draft', 'published')", name="ck_coding_tests_status"))
    op.create_index("ix_coding_tests_lesson_id", "coding_tests", ["lesson_id"])
    op.create_index("ix_coding_tests_status", "coding_tests", ["status"])

    op.create_table("coding_test_cases",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("coding_test_id", sa.Uuid(), sa.ForeignKey("coding_tests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False), sa.Column("title", sa.String(160), nullable=False),
        sa.Column("case_type", sa.String(20), nullable=False), sa.Column("is_hidden", sa.Boolean(), nullable=False),
        sa.Column("weight", sa.Integer(), nullable=False), sa.Column("stdin", sa.Text(), nullable=True),
        sa.Column("expected_output", sa.Text(), nullable=True), sa.Column("checks", sa.JSON(), nullable=False),
        sa.UniqueConstraint("coding_test_id", "sequence", name="uq_coding_test_case_sequence"),
        sa.CheckConstraint("case_type in ('io', 'structural')", name="ck_coding_test_cases_type"),
        sa.CheckConstraint("weight > 0", name="ck_coding_test_cases_weight"))
    op.create_index("ix_coding_test_cases_coding_test_id", "coding_test_cases", ["coding_test_id"])

    op.create_table("student_coding_submissions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("coding_test_id", sa.Uuid(), sa.ForeignKey("coding_tests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False), sa.Column("language", sa.String(30), nullable=False),
        sa.Column("source_files", sa.JSON(), nullable=False), sa.Column("total_weight", sa.Integer(), nullable=False),
        sa.Column("earned_weight", sa.Integer(), nullable=False), sa.Column("percentage", sa.Integer(), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("coding_test_id", "enrollment_id", "attempt_number", name="uq_coding_test_enrollment_attempt"))
    for column in ["coding_test_id", "enrollment_id"]:
        op.create_index(f"ix_student_coding_submissions_{column}", "student_coding_submissions", [column])

    op.create_table("student_coding_test_results",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("submission_id", sa.Uuid(), sa.ForeignKey("student_coding_submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("test_case_id", sa.Uuid(), sa.ForeignKey("coding_test_cases.id", ondelete="CASCADE"), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False), sa.Column("actual_output", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True))
    op.create_index("ix_student_coding_test_results_submission_id", "student_coding_test_results", ["submission_id"])
    op.create_index("ix_student_coding_test_results_test_case_id", "student_coding_test_results", ["test_case_id"])


def downgrade() -> None:
    op.drop_table("student_coding_test_results")
    op.drop_table("student_coding_submissions")
    op.drop_table("coding_test_cases")
    op.drop_table("coding_tests")
    op.drop_constraint("ck_course_lessons_type", "course_lessons", type_="check")
    op.create_check_constraint("ck_course_lessons_type", "course_lessons",
        "lesson_type in ('video', 'article', 'quiz', 'assignment')")
