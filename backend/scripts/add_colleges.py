"""
Bulk-create colleges + their college_admin accounts, already approved/active
(bypasses the public registration + LMS-admin approval flow — use this only
for seeding known/trusted colleges directly).

Run from the backend/ folder (so the `app` package resolves):

    cd backend
    python scripts/add_colleges.py

All three admin accounts get the SAME password: pass@123
Change ADMIN_PASSWORD below if you want a different one.
"""

from __future__ import annotations

import re
import sys
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import College, User
from app.security import hash_password

# ---- Configuration -----------------------------------------------------

ADMIN_PASSWORD = "pass@123"

COLLEGES = [
    {
        "name": "Delhi Institute of Engineering & Technology, Meerut",
        "contact_name": "Admin Office",
        "contact_email": "admin@diet-meerut.edu.in",
        "contact_phone": "9000000001",
        "address": "Meerut, Uttar Pradesh",
    },
    {
        "name": "Meerut Institute of Engineering & Technology, Meerut",
        "contact_name": "Admin Office",
        "contact_email": "admin@miet-meerut.edu.in",
        "contact_phone": "9000000002",
        "address": "Meerut, Uttar Pradesh",
    },
    {
        "name": "Dewan V.S. Institute of Engineering & Technology, Meerut",
        "contact_name": "Admin Office",
        "contact_email": "admin@dvsiet-meerut.edu.in",
        "contact_phone": "9000000003",
        "address": "Meerut, Uttar Pradesh",
    },
]

# ---- Validation (mirrors scripts/create_admin.py) -----------------------

PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")
MOBILE_RE = re.compile(r"^[6-9]\d{9}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate() -> None:
    if not PASSWORD_RE.fullmatch(ADMIN_PASSWORD):
        raise SystemExit("ADMIN_PASSWORD must be at least 8 characters and include both a letter and a number")
    seen_emails, seen_mobiles = set(), set()
    for row in COLLEGES:
        if not EMAIL_RE.fullmatch(row["contact_email"]):
            raise SystemExit(f"Invalid admin email for {row['name']}: {row['contact_email']}")
        if not MOBILE_RE.fullmatch(row["contact_phone"]):
            raise SystemExit(f"Invalid admin mobile for {row['name']}: {row['contact_phone']}")
        if row["contact_email"] in seen_emails:
            raise SystemExit(f"Duplicate admin email in COLLEGES list: {row['contact_email']}")
        if row["contact_phone"] in seen_mobiles:
            raise SystemExit(f"Duplicate admin mobile in COLLEGES list: {row['contact_phone']}")
        seen_emails.add(row["contact_email"])
        seen_mobiles.add(row["contact_phone"])


def main() -> int:
    validate()
    password_hash = hash_password(ADMIN_PASSWORD)

    with SessionLocal() as db:
        for row in COLLEGES:
            college = db.scalar(select(College).where(College.name == row["name"]))
            if college:
                print(f"College already exists, skipping college row: {row['name']}")
            else:
                college = College(
                    name=row["name"],
                    is_active=True,
                    status="active",
                    contact_name=row["contact_name"],
                    contact_email=row["contact_email"],
                    contact_phone=row["contact_phone"],
                    address=row["address"],
                    approved_at=datetime.now(timezone.utc),
                )
                db.add(college)
                db.flush()  # get college.id without committing yet
                print(f"Created college: {row['name']}")

            admin = db.scalar(select(User).where(User.email == row["contact_email"]))
            if admin:
                if admin.role != "college_admin":
                    raise SystemExit(f"A non-college_admin account already exists for {row['contact_email']}")
                admin.college_id = college.id
                admin.is_active = True
                admin.mobile = row["contact_phone"]
                admin.password_hash = password_hash
                print(f"Updated existing college_admin: {row['contact_email']}")
            else:
                admin = User(
                    email=row["contact_email"],
                    mobile=row["contact_phone"],
                    password_hash=password_hash,
                    role="college_admin",
                    college_id=college.id,
                    is_active=True,
                )
                db.add(admin)
                print(f"Created college_admin: {row['contact_email']} (password: {ADMIN_PASSWORD})")

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit(f"Unable to create colleges/admins: {exc.orig}") from exc

    print("\nDone. All 3 colleges are active and their admins can log in immediately with:")
    for row in COLLEGES:
        print(f"  - {row['contact_email']}  /  {ADMIN_PASSWORD}   -> {row['name']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())