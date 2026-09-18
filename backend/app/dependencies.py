import uuid

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token


def _get_current_user(required_role: str | tuple[str, ...], authorization: str | None, db: Session) -> User:
    allowed_roles = (required_role,) if isinstance(required_role, str) else required_role
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = decode_access_token(authorization.removeprefix("Bearer ").strip())
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    user = db.get(User, user_id)
    if (
        not user
        or not user.is_active
        or user.role not in allowed_roles
    ):
        label = allowed_roles[0].title() if len(allowed_roles) == 1 else "Staff"
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"{label} access required")
    if int(payload.get("cv", -1)) != user.credentials_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    return user


def get_current_student(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    user = _get_current_user("student", authorization, db)
    profile = user.student_profile
    if profile and (not profile.college or profile.college.status != "active"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your institution's access is currently suspended")
    return user


def get_current_lms_admin(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    return _get_current_user("lms_admin", authorization, db)


def get_current_college_admin(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    user = _get_current_user("college_admin", authorization, db)
    if not user.college_id or not user.college or user.college.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your institution's access is currently suspended")
    return user


def get_current_admin(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    """Backward-compatible dependency name used by LMS management endpoints."""
    return get_current_lms_admin(authorization, db)


def get_current_staff(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    user = _get_current_user(("lms_admin", "college_admin"), authorization, db)
    if user.role == "college_admin" and (not user.college_id or not user.college or user.college.status != "active"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your institution's access is currently suspended")
    return user
