from datetime import datetime, timedelta, timezone
from typing import Annotated
import hmac
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from config import get_settings, Settings
from db.database import get_db
from db.models import AuthSession

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(
    data: dict,
    secret_key: str,
    algorithm: str,
    expires_delta: timedelta | None = None,
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        secret_key,
        algorithm=algorithm,
    )


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    settings: Annotated[Settings, Depends(get_settings)],
    db: Annotated[Session, Depends(get_db)],
):
    # Verify username is admin
    is_admin = hmac.compare_digest(
        form_data.username.encode("utf-8"),
        b"admin",
    )

    # Verify password
    is_password_correct = hmac.compare_digest(
        form_data.password.encode("utf-8"),
        settings.ADMIN_PASSWORD.encode("utf-8"),
    )

    if not (is_admin and is_password_correct):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    secret_key = settings.SECRET_KEY
    algorithm = settings.ALGORITHM

    # Create a random server-side session identifier.
    session_id = secrets.token_hex(32)

    expires_at = datetime.now(timezone.utc) + access_token_expires

    access_token = create_access_token(
        data={
            "sub": "admin",
            "sid": session_id,
        },
        secret_key=secret_key,
        algorithm=algorithm,
        expires_delta=access_token_expires,
    )

    # Store only the session ID, never the JWT.
    db.add(
        AuthSession(
            session_id=session_id,
            username="admin",
            expires_at=expires_at,
        )
    )
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    token: Annotated[str, Depends(oauth2_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
    db: Annotated[Session, Depends(get_db)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        username = payload.get("sub")
        session_id = payload.get("sid")

        if username != "admin" or not session_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    session = db.execute(
        select(AuthSession).where(
            AuthSession.session_id == session_id,
            AuthSession.username == "admin",
        )
    ).scalar_one_or_none()

    if session is None:
        raise credentials_exception

    if session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()

    return {"message": "Logged out successfully"}


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
    db: Annotated[Session, Depends(get_db)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        username = payload.get("sub")
        session_id = payload.get("sid")

        if username != "admin" or not session_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    session = db.execute(
        select(AuthSession).where(
            AuthSession.session_id == session_id,
            AuthSession.username == "admin",
        )
    ).scalar_one_or_none()

    if session is None:
        raise credentials_exception

    now = datetime.now(timezone.utc)

    if session.revoked_at is not None:
        raise credentials_exception

    # SQLite returns naive datetimes, so normalize before comparison.
    expires_at = session.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        raise credentials_exception

    return username