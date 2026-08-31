"""learning activity events and analytics"""
from alembic import op
import sqlalchemy as sa

revision = "20260830_09_learning_analytics"
down_revision = "20260830_08_video_progress"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("student_learning_activity",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="SET NULL"), nullable=True),
        sa.Column("activity_type", sa.String(50), nullable=False), sa.Column("seconds_delta", sa.Integer(), nullable=False),
        sa.Column("activity_data", sa.JSON(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    for column in ["user_id", "enrollment_id", "lesson_id", "activity_type", "occurred_at"]:
        op.create_index(f"ix_student_learning_activity_{column}", "student_learning_activity", [column])


def downgrade() -> None:
    op.drop_table("student_learning_activity")
