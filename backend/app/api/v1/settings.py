from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin
from app.core.recaptcha import verify_recaptcha
from app.db.session import get_db
from app.models.models import SiteSettings
from app.schemas.schemas import ThemeOut, ThemeUpdate, SiteSettingsOut, SiteSettingsUpdate
from pydantic import BaseModel

VALID_THEMES = {"aurora", "mesh", "circuit"}

router = APIRouter(prefix="/settings", tags=["settings"])

class RecaptchaVerifyRequest(BaseModel):
    recaptcha_token: str

@router.post("/verify-recaptcha")
async def verify_recaptcha_endpoint(body: RecaptchaVerifyRequest):
    """Public — verifies a reCAPTCHA token for login or generic forms."""
    await verify_recaptcha(body.recaptcha_token)
    return {"success": True}

@router.get("/site", response_model=SiteSettingsOut)
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    """Public — returns global site settings (theme, github stats config)."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()
    if not row:
        row = SiteSettings(id=1, hero_theme="aurora", show_github_stats=False, github_repo="kamandprompt/dev-cell")
        db.add(row)
        await db.commit()
    return row

@router.patch("/site", response_model=SiteSettingsOut)
async def update_site_settings(
    body: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin-only — updates site settings."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()
    if not row:
        row = SiteSettings(id=1, hero_theme="aurora", show_github_stats=False, github_repo="kamandprompt/dev-cell")
        db.add(row)

    for field, value in body.model_dump(exclude_none=True).items():
        if field == 'hero_theme' and value not in VALID_THEMES:
            raise HTTPException(status_code=422, detail=f"theme must be one of {sorted(VALID_THEMES)}")
        setattr(row, field, value)

    await db.commit()
    await db.refresh(row)
    return row

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
