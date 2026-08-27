from __future__ import annotations

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
        raise SystemExit("ADMIN_PASSWORD must be at least 8 characters and include both a letter and a number")


def validate_email(value: str) -> None:
    if not EMAIL_RE.fullmatch(value):
        raise SystemExit("ADMIN_EMAIL is not a valid email address")


def validate_mobile(value: str) -> None:
    if value and not MOBILE_RE.fullmatch(value):
        raise SystemExit("ADMIN_MOBILE must be a valid 10-digit mobile number")


def main() -> int:
    email_raw = (sys.argv[1] if len(sys.argv) > 1 else None) or __import__("os").getenv("ADMIN_EMAIL", "")
    password = __import__("os").getenv("ADMIN_PASSWORD", "")
    mobile = __import__("os").getenv("ADMIN_MOBILE", "")

    if not email_raw or not password or not mobile:
        raise SystemExit("Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_MOBILE before running this script")

    email = normalize_email(email_raw)
    validate_email(email)
    validate_password(password)
    validate_mobile(mobile)

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        password_hash = hash_password(password)
        if user and user.role != "admin":
            raise SystemExit(f"A non-admin account already exists for {email}")
        if not user:
            user = User(email=email, mobile=mobile, password_hash=password_hash, role="admin", is_active=True)
            db.add(user)
            action = "created"
        else:
            user.role = "admin"
            user.is_active = True
            user.mobile = mobile
            user.password_hash = password_hash
            action = "updated"
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit(f"Unable to create or update admin account: {exc.orig}") from exc

    print(f"Admin account {action} for {email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
