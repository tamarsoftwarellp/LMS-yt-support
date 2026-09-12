"""separate LMS admin and college admin roles"""

from alembic import op
import sqlalchemy as sa


revision = "20260912_13_lms_admin_roles"
down_revision = "20260831_12_institutions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE users SET role = 'lms_admin' WHERE role = 'super_admin'")
    op.execute("UPDATE users SET role = 'college_admin' WHERE role = 'admin' AND college_id IS NOT NULL")
    op.execute("UPDATE users SET role = 'lms_admin' WHERE role = 'admin' AND college_id IS NULL")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role in ('student', 'lms_admin', 'college_admin')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.execute("UPDATE users SET role = 'admin' WHERE role = 'college_admin'")
    op.execute("UPDATE users SET role = 'super_admin' WHERE role = 'lms_admin'")
