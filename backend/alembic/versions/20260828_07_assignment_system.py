"""assignment submission and evaluation system"""
from alembic import op
import sqlalchemy as sa

revision = "20260828_07_assignment_system"
down_revision = "20260826_06_quiz_engine"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("assignments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("instructions", sa.Text(), nullable=False), sa.Column("maximum_marks", sa.Integer(), nullable=False),
        sa.Column("passing_marks", sa.Integer(), nullable=False), sa.Column("maximum_attempts", sa.Integer(), nullable=False),
        sa.Column("allowed_submission_types", sa.JSON(), nullable=False), sa.Column("allowed_file_extensions", sa.JSON(), nullable=False),
        sa.Column("maximum_file_size_mb", sa.Integer(), nullable=False), sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("allow_late_submission", sa.Boolean(), nullable=False), sa.Column("allow_resubmission", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("maximum_marks > 0", name="ck_assignments_maximum_marks"),
        sa.CheckConstraint("passing_marks >= 0 and passing_marks <= maximum_marks", name="ck_assignments_passing_marks"),
        sa.CheckConstraint("maximum_attempts > 0", name="ck_assignments_maximum_attempts"),
        sa.CheckConstraint("status in ('draft', 'published')", name="ck_assignments_status"))
    op.create_index("ix_assignments_lesson_id", "assignments", ["lesson_id"])
    op.create_index("ix_assignments_status", "assignments", ["status"])
    op.create_table("assignment_submissions",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("assignment_id", sa.Uuid(), sa.ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("text_content", sa.Text(), nullable=True), sa.Column("link_url", sa.String(1000), nullable=True),
        sa.Column("original_file_name", sa.String(255), nullable=True), sa.Column("storage_path", sa.String(500), nullable=True),
        sa.Column("mime_type", sa.String(120), nullable=True), sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("is_late", sa.Boolean(), nullable=False), sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("assignment_id", "enrollment_id", "attempt_number", name="uq_assignment_enrollment_attempt"),
        sa.CheckConstraint("status in ('draft', 'submitted', 'evaluated', 'resubmission_required')", name="ck_assignment_submissions_status"))
    for column in ["assignment_id", "enrollment_id", "status"]:
        op.create_index(f"ix_assignment_submissions_{column}", "assignment_submissions", [column])
    op.create_table("assignment_evaluations",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("submission_id", sa.Uuid(), sa.ForeignKey("assignment_submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("evaluated_by_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("marks_awarded", sa.Integer(), nullable=False), sa.Column("decision", sa.String(30), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("evaluated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("decision in ('passed', 'failed', 'resubmission_required')", name="ck_assignment_evaluations_decision"))
    op.create_index("ix_assignment_evaluations_submission_id", "assignment_evaluations", ["submission_id"])
    op.create_index("ix_assignment_evaluations_evaluated_by_user_id", "assignment_evaluations", ["evaluated_by_user_id"])


def downgrade() -> None:
    op.drop_table("assignment_evaluations")
    op.drop_table("assignment_submissions")
    op.drop_table("assignments")
