"""youtube video watched ranges and resume progress"""
from alembic import op
import sqlalchemy as sa

revision = "20260830_08_video_progress"
down_revision = "20260828_07_assignment_system"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("lesson_progress", sa.Column("video_duration_seconds", sa.Integer(), nullable=True))
    op.add_column("lesson_progress", sa.Column("watched_ranges", sa.JSON(), nullable=False, server_default="[]"))


def downgrade() -> None:
    op.drop_column("lesson_progress", "watched_ranges")
    op.drop_column("lesson_progress", "video_duration_seconds")
