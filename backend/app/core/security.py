import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

bearer_scheme = HTTPBearer()


async def verify_supabase_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates a Supabase-issued JWT by asking the Supabase Auth API directly.
    We use httpx instead of supabase-py to support the new sb_secret_... format
    which the official python client currently rejects.
    """
    token = credentials.credentials
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "apikey": settings.SUPABASE_SECRET_KEY,
                "Authorization": f"Bearer {token}",
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # The /auth/v1/user endpoint returns the user object natively
    user_data = response.json()

    return {
        "sub": user_data.get("id"),
        "email": user_data.get("email"),
        "app_metadata": user_data.get("app_metadata", {}),
        "user_metadata": user_data.get("user_metadata", {}),
    }


def require_admin(payload: dict = Depends(verify_supabase_jwt)) -> dict:
    """
    Extends verify_supabase_jwt: additionally checks that the user's role
    is 'admin' (stored in app_metadata.role).
    """
    role = (payload.get("app_metadata") or {}).get("role", "")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return payload


