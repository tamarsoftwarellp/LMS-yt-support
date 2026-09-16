"""quiz engine and student attempts"""
from alembic import op
import sqlalchemy as sa

revision = "20260826_06_quiz_engine"
down_revision = "20260826_05_admin_course_mgmt"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("quizzes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("instructions", sa.Text(), nullable=False), sa.Column("passing_percentage", sa.Integer(), nullable=False),
        sa.Column("maximum_attempts", sa.Integer(), nullable=False), sa.Column("time_limit_minutes", sa.Integer(), nullable=True),
        sa.Column("show_explanations", sa.Boolean(), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("passing_percentage between 1 and 100", name="ck_quizzes_passing_percentage"),
        sa.CheckConstraint("maximum_attempts > 0", name="ck_quizzes_maximum_attempts"))
    op.create_index("ix_quizzes_lesson_id", "quizzes", ["lesson_id"])
    op.create_index("ix_quizzes_status", "quizzes", ["status"])
    op.create_table("quiz_questions",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("quiz_id", sa.Uuid(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False), sa.Column("question_type", sa.String(30), nullable=False),
        sa.Column("marks", sa.Integer(), nullable=False), sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("sequence", sa.Integer(), nullable=False), sa.UniqueConstraint("quiz_id", "sequence", name="uq_quiz_question_sequence"))
    op.create_index("ix_quiz_questions_quiz_id", "quiz_questions", ["quiz_id"])
    op.create_table("quiz_options",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("question_id", sa.Uuid(), sa.ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("option_text", sa.Text(), nullable=False), sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False), sa.UniqueConstraint("question_id", "sequence", name="uq_quiz_option_sequence"))
    op.create_index("ix_quiz_options_question_id", "quiz_options", ["question_id"])
    op.create_table("student_quiz_attempts",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("quiz_id", sa.Uuid(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), sa.ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False), sa.Column("status", sa.String(30), nullable=False),
        sa.Column("earned_marks", sa.Integer(), nullable=False), sa.Column("total_marks", sa.Integer(), nullable=False),
        sa.Column("percentage", sa.Integer(), nullable=False), sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("quiz_id", "enrollment_id", "attempt_number", name="uq_quiz_enrollment_attempt"))
    op.create_index("ix_student_quiz_attempts_quiz_id", "student_quiz_attempts", ["quiz_id"])
    op.create_index("ix_student_quiz_attempts_enrollment_id", "student_quiz_attempts", ["enrollment_id"])
    op.create_table("student_quiz_answers",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("attempt_id", sa.Uuid(), sa.ForeignKey("student_quiz_attempts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Uuid(), sa.ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("selected_option_ids", sa.JSON(), nullable=False), sa.Column("awarded_marks", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False), sa.UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question_answer"))
    op.create_index("ix_student_quiz_answers_attempt_id", "student_quiz_answers", ["attempt_id"])
    op.create_index("ix_student_quiz_answers_question_id", "student_quiz_answers", ["question_id"])


def downgrade() -> None:
    for table in ["student_quiz_answers", "student_quiz_attempts", "quiz_options", "quiz_questions", "quizzes"]:
        op.drop_table(table)
