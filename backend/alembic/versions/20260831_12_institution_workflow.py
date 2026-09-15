"""institution registration, approval workflow and college-scoped admins"""
from alembic import op
import sqlalchemy as sa

revision = "20260831_12_institutions"
down_revision = "20260831_11_resume_builder"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("colleges", sa.Column("status", sa.String(20), nullable=False, server_default="active"))
    op.add_column("colleges", sa.Column("contact_name", sa.String(150), nullable=True))
    op.add_column("colleges", sa.Column("contact_email", sa.String(254), nullable=True))
    op.add_column("colleges", sa.Column("contact_phone", sa.String(20), nullable=True))
    op.add_column("colleges", sa.Column("address", sa.Text(), nullable=True))
    op.add_column("colleges", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("colleges", sa.Column("rejected_reason", sa.Text(), nullable=True))
    op.alter_column("colleges", "status", server_default=None)

    op.add_column("users", sa.Column("college_id", sa.Uuid(), sa.ForeignKey("colleges.id"), nullable=True))
    op.create_index("ix_users_college_id", "users", ["college_id"])

    op.create_table("institution_status_history",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("college_id", sa.Uuid(), sa.ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action", sa.String(30), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("performed_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_institution_status_history_college_id", "institution_status_history", ["college_id"])


def downgrade() -> None:
    op.drop_table("institution_status_history")
    op.drop_index("ix_users_college_id", table_name="users")
    op.drop_column("users", "college_id")
    for column in ["status", "contact_name", "contact_email", "contact_phone", "address", "approved_at", "rejected_reason"]:
        op.drop_column("colleges", column)
