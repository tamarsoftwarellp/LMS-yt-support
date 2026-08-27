import uuid

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token


def _get_current_user(required_role: str, authorization: str | None, db: Session) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = decode_access_token(authorization.removeprefix("Bearer ").strip())
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    user = db.get(User, user_id)
    if not user or not user.is_active or user.role != required_role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"{required_role.title()} access required")
    return user


def get_current_student(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    return _get_current_user("student", authorization, db)


def get_current_admin(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    return _get_current_user("admin", authorization, db)
