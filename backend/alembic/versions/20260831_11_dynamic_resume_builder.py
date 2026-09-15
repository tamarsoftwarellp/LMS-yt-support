"""dynamic ATS resume builder and version history"""
from alembic import op
import sqlalchemy as sa

# Alembic creates alembic_version.version_num as VARCHAR(32) by default.
# Keep every revision identifier at or below that portable limit.
revision = "20260831_11_resume_builder"
down_revision = "20260830_10_certificates"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("resume_builder_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("headline", sa.String(180)), sa.Column("location", sa.String(180)), sa.Column("linkedin_url", sa.String(500)), sa.Column("github_url", sa.String(500)), sa.Column("portfolio_url", sa.String(500)),
        sa.Column("professional_summary", sa.Text()), sa.Column("educations", sa.JSON(), nullable=False), sa.Column("experiences", sa.JSON(), nullable=False), sa.Column("projects", sa.JSON(), nullable=False),
        sa.Column("certifications", sa.JSON(), nullable=False), sa.Column("achievements", sa.JSON(), nullable=False), sa.Column("languages", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_resume_builder_profiles_user_id", "resume_builder_profiles", ["user_id"], unique=True)
    op.create_table("generated_resumes",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(180), nullable=False), sa.Column("target_role", sa.String(180), nullable=False), sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("input_snapshot", sa.JSON(), nullable=False), sa.Column("content", sa.JSON(), nullable=False), sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("prompt_version", sa.String(30), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "version", name="uq_generated_resume_user_version"))
    for column in ["user_id", "target_role", "created_at"]: op.create_index(f"ix_generated_resumes_{column}", "generated_resumes", [column])
    op.create_table("resume_ats_evaluations",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("resume_id", sa.Uuid(), sa.ForeignKey("generated_resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False), sa.Column("grade", sa.String(30), nullable=False), sa.Column("breakdown", sa.JSON(), nullable=False),
        sa.Column("strengths", sa.JSON(), nullable=False), sa.Column("issues", sa.JSON(), nullable=False), sa.Column("suggestions", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_resume_ats_evaluations_resume_id", "resume_ats_evaluations", ["resume_id"])
    op.create_index("ix_resume_ats_evaluations_created_at", "resume_ats_evaluations", ["created_at"])


def downgrade() -> None:
    op.drop_table("resume_ats_evaluations"); op.drop_table("generated_resumes"); op.drop_table("resume_builder_profiles")
