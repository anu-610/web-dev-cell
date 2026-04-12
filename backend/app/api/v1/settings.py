from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin
from app.db.session import get_db
from app.models.models import SiteSettings
from app.schemas.schemas import ThemeOut, ThemeUpdate

VALID_THEMES = {"aurora", "mesh", "circuit"}

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/theme", response_model=ThemeOut)
async def get_theme(db: AsyncSession = Depends(get_db)):
    """Public — returns the currently active hero theme."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()
    return ThemeOut(theme=row.hero_theme if row else "aurora")


@router.put("/theme", response_model=ThemeOut)
async def set_theme(
    body: ThemeUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin-only — updates the active hero theme."""
    if body.theme not in VALID_THEMES:
        raise HTTPException(status_code=422, detail=f"theme must be one of {sorted(VALID_THEMES)}")

    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()

    if row:
        row.hero_theme = body.theme
    else:
        db.add(SiteSettings(id=1, hero_theme=body.theme))

    await db.commit()
    return ThemeOut(theme=body.theme)
