from fastapi import APIRouter, Depends

from app.core.security import verify_supabase_jwt
from app.api.v1 import members, projects, settings, posts, announcements

router = APIRouter(prefix="/api/v1")

router.include_router(members.router)
router.include_router(projects.router)
router.include_router(settings.router)
router.include_router(posts.router)
router.include_router(announcements.router)


@router.get("/me", tags=["auth"])
async def me(payload: dict = Depends(verify_supabase_jwt)):
    """Returns the decoded JWT payload — useful for the frontend to confirm auth."""
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "role": (payload.get("app_metadata") or {}).get("role"),
    }
