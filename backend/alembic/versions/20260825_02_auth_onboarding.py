"""student authentication and onboarding persistence"""
from alembic import op
import sqlalchemy as sa

revision = "20260825_02"
down_revision = "20260825_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "student_onboarding_steps",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("step_key", sa.String(50), nullable=False),
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="in_progress"),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "step_key", name="uq_student_onboarding_step"),
    )
    op.create_index("ix_student_onboarding_steps_user_id", "student_onboarding_steps", ["user_id"])
    op.create_index("ix_student_onboarding_steps_step_key", "student_onboarding_steps", ["step_key"])
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.Text(), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"])


def downgrade() -> None:
    op.drop_table("refresh_tokens")
    op.drop_table("student_onboarding_steps")
