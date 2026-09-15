from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    print("=== ALEMBIC VERSION ===")
    rows = conn.execute(
        text("SELECT version_num FROM alembic_version")
    ).fetchall()
    for row in rows:
        print(row[0])

    print("\n=== COLLEGES COLUMNS ===")
    rows = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'colleges'
        ORDER BY ordinal_position
    """)).fetchall()
    for row in rows:
        print(row[0])

    print("\n=== COURSE_ENROLLMENTS COLUMNS ===")
    rows = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'course_enrollments'
        ORDER BY ordinal_position
    """)).fetchall()
    for row in rows:
        print(row[0])
