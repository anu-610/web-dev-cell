from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

bearer_scheme = HTTPBearer()

ALGORITHM = "HS256"


def verify_supabase_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates a Supabase-issued JWT.
    The token is signed with SUPABASE_JWT_SECRET (HS256).
    Raises 401 if the token is missing, expired, or has a bad signature.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},  # Supabase uses 'authenticated' audience
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_admin(payload: dict = Depends(verify_supabase_jwt)) -> dict:
    """
    Extends verify_supabase_jwt: additionally checks that the user's role
    is 'admin' (stored in app_metadata.role inside the Supabase JWT).
    """
    role = (payload.get("app_metadata") or {}).get("role", "")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return payload
