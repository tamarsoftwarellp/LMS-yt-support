"""add dual course catalog access type"""

from alembic import op
import sqlalchemy as sa


revision = "20260918_18_dual_course_catalog"
down_revision = "20260917_17_credentials_version"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "courses",
        sa.Column("access_type", sa.String(length=30), nullable=False, server_default="college_allocated"),
    )
    op.create_index("ix_courses_access_type", "courses", ["access_type"])
    op.create_check_constraint(
        "ck_courses_access_type",
        "courses",
        "access_type in ('college_allocated', 'open_elective')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_courses_access_type", "courses", type_="check")
    op.drop_index("ix_courses_access_type", table_name="courses")
    op.drop_column("courses", "access_type")
