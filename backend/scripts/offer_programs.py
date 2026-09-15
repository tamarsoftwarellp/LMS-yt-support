"""
Enable ("offer") specific programs/branches for colleges — this is what shows
up as "Programs" in the college_admin portal, and is the closest existing
concept to a "department" (CSE, IT, ECE, etc.) in this codebase.

There is no separate Department table — a college simply links to Program
master rows via CollegeProgram. This script creates those links directly,
bypassing the college_admin UI/API (useful for bulk seeding).

Run from the backend/ folder (so the `app` package resolves):

    cd backend
    $env:PYTHONPATH = "."      # PowerShell — needed so `app` is importable
    python scripts/offer_programs.py

If a program name below doesn't already exist in the Program master table,
this script creates it too (is_active=True) before linking it.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import College, CollegeProgram, Program

# ---- Configuration -------------------------------------------------------
# Edit this if you want DIFFERENT programs per college instead of the same
# set for all three — just change the value list for that college's key.

PROGRAMS_BY_COLLEGE = {
    "Delhi Institute of Engineering & Technology, Meerut": [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Civil Engineering",
    ],
    "Meerut Institute of Engineering & Technology, Meerut": [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Civil Engineering",
    ],
    "Dewan V.S. Institute of Engineering & Technology, Meerut": [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Civil Engineering",
    ],
}


def _get_or_create_program(db, name: str) -> Program:
    program = db.scalar(select(Program).where(Program.name == name))
    if program:
        return program
    program = Program(name=name, is_active=True)
    db.add(program)
    db.flush()  # get program.id without committing yet
    print(f"  Created new program in master list: {name}")
    return program


def main() -> int:
    with SessionLocal() as db:
        for college_name, program_names in PROGRAMS_BY_COLLEGE.items():
            college = db.scalar(select(College).where(College.name == college_name))
            if not college:
                print(f"SKIPPED — college not found (run add_colleges.py first?): {college_name}")
                continue

            print(f"{college_name}:")
            for program_name in program_names:
                program = _get_or_create_program(db, program_name)
                exists = db.scalar(
                    select(CollegeProgram).where(
                        CollegeProgram.college_id == college.id,
                        CollegeProgram.program_id == program.id,
                    )
                )
                if exists:
                    print(f"  Already offered: {program_name}")
                    continue
                db.add(CollegeProgram(college_id=college.id, program_id=program.id))
                print(f"  Offering: {program_name}")

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit(f"Unable to save program offerings: {exc.orig}") from exc

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())