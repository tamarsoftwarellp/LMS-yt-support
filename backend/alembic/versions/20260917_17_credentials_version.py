"""invalidate access tokens after credential changes"""

from alembic import op
import sqlalchemy as sa


revision = "20260917_17_credentials_version"
down_revision = "20260917_16_coding_tests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "credentials_version",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "credentials_version")
