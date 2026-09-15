"""complete college admin operational workflows"""

from alembic import op
import sqlalchemy as sa

revision = "20260912_15_college_complete"
down_revision = "20260912_14_college_ops"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "course_enrollments", sa.Column("previous_status", sa.String(30), nullable=True)
    )
    op.create_table(
        "college_profile_change_requests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "college_id",
            sa.Uuid(),
            sa.ForeignKey("colleges.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "requested_by_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("changes", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("rejection_reason", sa.Text()),
        sa.Column("reviewed_by_user_id", sa.Uuid(), sa.ForeignKey("users.id")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
    )
    op.create_index(
        "ix_college_profile_change_requests_college_id",
        "college_profile_change_requests",
        ["college_id"],
    )
    op.create_index(
        "ix_college_profile_change_requests_status",
        "college_profile_change_requests",
        ["status"],
    )
    op.create_table(
        "student_password_reset_requests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "college_id",
            sa.Uuid(),
            sa.ForeignKey("colleges.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column(
            "requested_by_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.create_index(
        "ix_student_password_reset_requests_college_id",
        "student_password_reset_requests",
        ["college_id"],
    )
    op.create_index(
        "ix_student_password_reset_requests_user_id",
        "student_password_reset_requests",
        ["user_id"],
    )
    op.create_index(
        "ix_student_password_reset_requests_token_hash",
        "student_password_reset_requests",
        ["token_hash"],
        unique=True,
    )


def downgrade():
    op.drop_table("student_password_reset_requests")
    op.drop_table("college_profile_change_requests")
    op.drop_column("course_enrollments", "previous_status")
