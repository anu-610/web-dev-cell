from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

from app.core.config import settings

bearer_scheme = HTTPBearer()

# Initialize Supabase client with the Service Role / Secret API Key
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)


def verify_supabase_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates a Supabase-issued JWT by asking the Supabase Auth API directly.
    This works perfectly with the new Publishable/Secret key architecture.
    Raises 401 if the token is missing or expired.
    """
    token = credentials.credentials
    try:
        # get_user() securely validates the token against the Supabase server
        response = supabase.auth.get_user(token)
        if not response.user:
            raise ValueError("No user found")

        # Return the user object as a dictionary for downstream dependencies
        return {
            "sub": response.user.id,
            "email": response.user.email,
            "app_metadata": response.user.app_metadata,
            "user_metadata": response.user.user_metadata,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


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

