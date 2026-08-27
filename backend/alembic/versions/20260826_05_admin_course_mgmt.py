"""admin course management"""
from __future__ import annotations

import re
import unicodedata

from alembic import op
import sqlalchemy as sa

revision = "20260826_05_admin_course_mgmt"
down_revision = "20260826_04"
branch_labels = None
depends_on = None


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "course"


def upgrade() -> None:
    op.add_column("courses", sa.Column("slug", sa.String(length=220), nullable=True))
    op.add_column("courses", sa.Column("thumbnail_url", sa.String(length=500), nullable=True))
    op.add_column("courses", sa.Column("instructor_name", sa.String(length=180), nullable=True))
    op.add_column("courses", sa.Column("created_by_user_id", sa.Uuid(), nullable=True))
    op.add_column("courses", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column("courses", sa.Column("published_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("courses", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))

    bind = op.get_bind()
    courses = sa.table(
        "courses",
        sa.column("id", sa.Uuid()),
        sa.column("title", sa.String()),
        sa.column("slug", sa.String()),
    )
    existing_slugs: set[str] = set()
    rows = bind.execute(sa.select(courses.c.id, courses.c.title)).all()
    for course_id, title in rows:
        base_slug = slugify(title)
        candidate = base_slug
        counter = 2
        while candidate in existing_slugs:
            candidate = f"{base_slug}-{counter}"
            counter += 1
        existing_slugs.add(candidate)
        bind.execute(sa.update(courses).where(courses.c.id == course_id).values(slug=candidate))

    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("courses", recreate="always") as batch:
            batch.alter_column("slug", nullable=False)
            batch.create_unique_constraint("uq_courses_slug", ["slug"])
            batch.create_foreign_key("fk_courses_created_by_user_id_users", "users", ["created_by_user_id"], ["id"], ondelete="SET NULL")
            batch.create_check_constraint("ck_courses_status", "status in ('draft', 'published', 'archived')")
    else:
        op.alter_column("courses", "slug", nullable=False)
        op.alter_column("courses", "status", existing_type=sa.String(length=30), server_default=sa.text("'draft'"), existing_nullable=False)
        op.create_unique_constraint("uq_courses_slug", "courses", ["slug"])
        op.create_foreign_key("fk_courses_created_by_user_id_users", "courses", "users", ["created_by_user_id"], ["id"], ondelete="SET NULL")
        op.create_check_constraint("ck_courses_status", "courses", "status in ('draft', 'published', 'archived')")
    op.create_index("ix_courses_slug", "courses", ["slug"])

    op.add_column("course_sections", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column("course_sections", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("course_sections", recreate="always") as batch:
            batch.create_unique_constraint("uq_course_section_sequence", ["course_id", "sequence"])
            batch.create_check_constraint("ck_course_sections_sequence_positive", "sequence > 0")
    else:
        op.create_unique_constraint("uq_course_section_sequence", "course_sections", ["course_id", "sequence"])
        op.create_check_constraint("ck_course_sections_sequence_positive", "course_sections", "sequence > 0")

    op.add_column("course_lessons", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column("course_lessons", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("course_lessons", recreate="always") as batch:
            batch.create_unique_constraint("uq_course_lesson_sequence", ["section_id", "sequence"])
            batch.create_check_constraint("ck_course_lessons_sequence_positive", "sequence > 0")
            batch.create_check_constraint("ck_course_lessons_duration_positive", "duration_minutes > 0")
            batch.create_check_constraint("ck_course_lessons_type", "lesson_type in ('video', 'article', 'quiz', 'assignment')")
    else:
        op.create_unique_constraint("uq_course_lesson_sequence", "course_lessons", ["section_id", "sequence"])
        op.create_check_constraint("ck_course_lessons_sequence_positive", "course_lessons", "sequence > 0")
        op.create_check_constraint("ck_course_lessons_duration_positive", "course_lessons", "duration_minutes > 0")
        op.create_check_constraint("ck_course_lessons_type", "course_lessons", "lesson_type in ('video', 'article', 'quiz', 'assignment')")


def downgrade() -> None:
    op.drop_constraint("ck_course_lessons_type", "course_lessons", type_="check")
    op.drop_constraint("ck_course_lessons_duration_positive", "course_lessons", type_="check")
    op.drop_constraint("ck_course_lessons_sequence_positive", "course_lessons", type_="check")
    op.drop_constraint("uq_course_lesson_sequence", "course_lessons", type_="unique")
    op.drop_column("course_lessons", "updated_at")
    op.drop_column("course_lessons", "created_at")

    op.drop_constraint("ck_course_sections_sequence_positive", "course_sections", type_="check")
    op.drop_constraint("uq_course_section_sequence", "course_sections", type_="unique")
    op.drop_column("course_sections", "updated_at")
    op.drop_column("course_sections", "created_at")

    op.drop_constraint("ck_courses_status", "courses", type_="check")
    op.drop_constraint("fk_courses_created_by_user_id_users", "courses", type_="foreignkey")
    op.drop_index("ix_courses_slug", table_name="courses")
    op.drop_constraint("uq_courses_slug", "courses", type_="unique")
    op.drop_column("courses", "archived_at")
    op.drop_column("courses", "published_at")
    op.drop_column("courses", "updated_at")
    op.drop_column("courses", "created_by_user_id")
    op.drop_column("courses", "instructor_name")
    op.drop_column("courses", "thumbnail_url")
    op.drop_column("courses", "slug")

