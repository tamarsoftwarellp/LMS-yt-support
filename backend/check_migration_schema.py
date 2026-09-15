from sqlalchemy import text
from app.database import engine

tables = [
    "college_faculty",
    "college_batches",
    "college_sections",
    "college_course_allocations",
    "college_certificate_requests",
    "college_audit_logs",
    "college_profile_change_requests",
    "student_password_reset_requests",
]

with engine.connect() as conn:
    print("=== MIGRATION 13-15 TABLE CHECK ===")

    for table in tables:
        result = conn.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = :table
                )
            """),
            {"table": table},
        ).scalar()

        print(f"{table}: {'EXISTS' if result else 'MISSING'}")

    print("\n=== USERS ROLE CONSTRAINT ===")

    rows = conn.execute(text("""
        SELECT conname, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'users'::regclass
          AND contype = 'c'
    """)).fetchall()

    for name, definition in rows:
        print(f"{name}: {definition}")
