"""student registration schema"""
from alembic import op
import sqlalchemy as sa


revision = "20260825_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "colleges",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_colleges_name", "colleges", ["name"])
    op.create_table(
        "programs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_programs_name", "programs", ["name"])
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("mobile", sa.String(15), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(30), nullable=False, server_default="student"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("mobile"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_mobile", "users", ["mobile"])
    op.create_table(
        "college_programs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("college_id", sa.Uuid(), sa.ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("program_id", sa.Uuid(), sa.ForeignKey("programs.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("college_id", "program_id", name="uq_college_program"),
    )
    op.create_index("ix_college_programs_college_id", "college_programs", ["college_id"])
    op.create_index("ix_college_programs_program_id", "college_programs", ["program_id"])
    op.create_table(
        "student_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("college_id", sa.Uuid(), sa.ForeignKey("colleges.id"), nullable=False),
        sa.Column("program_id", sa.Uuid(), sa.ForeignKey("programs.id"), nullable=False),
        sa.Column("current_year", sa.String(30), nullable=False),
        sa.Column("roll_number", sa.String(80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_student_profiles_college_id", "student_profiles", ["college_id"])
    op.create_index("ix_student_profiles_program_id", "student_profiles", ["program_id"])


def downgrade() -> None:
    op.drop_table("student_profiles")
    op.drop_table("college_programs")
    op.drop_table("users")
    op.drop_table("programs")
    op.drop_table("colleges")

