from __future__ import annotations

import os
import re
import sys

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import User
from app.security import hash_password


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")
MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def normalize_email(value: str) -> str:
    return value.strip().lower()


def validate_password(value: str) -> None:
    if not PASSWORD_RE.fullmatch(value):
        raise SystemExit("SUPER_ADMIN_PASSWORD must be at least 8 characters and include both a letter and a number")


def validate_email(value: str) -> None:
    if not EMAIL_RE.fullmatch(value):
        raise SystemExit("SUPER_ADMIN_EMAIL is not a valid email address")


def validate_mobile(value: str) -> None:
    if not MOBILE_RE.fullmatch(value):
        raise SystemExit("SUPER_ADMIN_MOBILE must be a valid 10-digit mobile number")


def main() -> int:
    email_raw = (sys.argv[1] if len(sys.argv) > 1 else None) or os.getenv("SUPER_ADMIN_EMAIL", "")
    password = os.getenv("SUPER_ADMIN_PASSWORD", "")
    mobile = os.getenv("SUPER_ADMIN_MOBILE", "")

    if not email_raw or not password or not mobile:
        raise SystemExit(
            "Set SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, and SUPER_ADMIN_MOBILE before running this script.\n"
            "Example:\n"
            "  SUPER_ADMIN_EMAIL=owner@educonnect.dev SUPER_ADMIN_PASSWORD=StrongPass123 "
            "SUPER_ADMIN_MOBILE=9876500000 python scripts/seed_super_admin.py"
        )

    email = normalize_email(email_raw)
    validate_email(email)
    validate_password(password)
    validate_mobile(mobile)

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        password_hash = hash_password(password)
        if user and user.role not in ("super_admin", "admin"):
            raise SystemExit(f"An account with a different role already exists for {email}")
        if not user:
            user = User(email=email, mobile=mobile, password_hash=password_hash, role="super_admin", is_active=True)
            db.add(user)
            action = "created"
        else:
            user.role = "super_admin"
            user.college_id = None
            user.is_active = True
            user.mobile = mobile
            user.password_hash = password_hash
            action = "promoted to super_admin and updated"
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit(f"Unable to create or update super admin account: {exc.orig}") from exc

    print(f"Super admin account {action} for {email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
