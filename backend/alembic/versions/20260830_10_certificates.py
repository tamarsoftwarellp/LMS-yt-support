"""certificate generation, verification and audit history"""
from alembic import op
import sqlalchemy as sa

revision = "20260830_10_certificates"
down_revision = "20260830_09_learning_analytics"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("certificates",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("certificate_number", sa.String(40), nullable=False),
        sa.Column("verification_token", sa.String(100), nullable=False),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Uuid(), sa.ForeignKey("courses.id"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("parent_certificate_id", sa.Uuid(), sa.ForeignKey("certificates.id"), nullable=True),
        sa.Column("student_name", sa.String(180), nullable=False),
        sa.Column("course_title", sa.String(220), nullable=False),
        sa.Column("instructor_name", sa.String(180), nullable=True),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revocation_reason", sa.Text(), nullable=True),
        sa.Column("issued_by_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.CheckConstraint("status in ('issued', 'revoked', 'superseded')", name="ck_certificates_status"),
        sa.UniqueConstraint("certificate_number"), sa.UniqueConstraint("verification_token"))
    for column in ["certificate_number", "verification_token", "student_id", "course_id", "enrollment_id", "parent_certificate_id", "status", "issued_at"]:
        op.create_index(f"ix_certificates_{column}", "certificates", [column])
    op.create_table("certificate_events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("certificate_id", sa.Uuid(), sa.ForeignKey("certificates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("actor_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    for column in ["certificate_id", "event_type", "actor_user_id", "created_at"]:
        op.create_index(f"ix_certificate_events_{column}", "certificate_events", [column])


def downgrade() -> None:
    op.drop_table("certificate_events")
    op.drop_table("certificates")
