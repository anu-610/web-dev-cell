import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin
from app.db.session import get_db
from app.models.models import Announcement
from app.schemas.schemas import AnnouncementCreate, AnnouncementOut, AnnouncementUpdate

router = APIRouter(prefix="/announcements", tags=["announcements"])

# ── Public: List active announcements for popup ───────────────────────────────

@router.get("/active", response_model=list[AnnouncementOut])
async def list_active_announcements(db: AsyncSession = Depends(get_db)):
    """Public — returns currently active announcements (end_date >= now)."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Announcement)
        .where(Announcement.is_active == True)
        .where(Announcement.end_date >= now)
        .order_by(Announcement.created_at.desc())
    )
    return result.scalars().all()


# ── Public: List all announcements (historical) ───────────────────────────────

@router.get("", response_model=list[AnnouncementOut])
async def list_all_announcements(db: AsyncSession = Depends(get_db)):
    """Public — returns all announcements for the notifications page."""
    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()))
    return result.scalars().all()


# ── Admin: Create announcement ────────────────────────────────────────────────

@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    body: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin — create a new announcement."""
    announcement = Announcement(**body.model_dump())
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement


# ── Admin: Update announcement ────────────────────────────────────────────────

@router.patch("/{announcement_id}", response_model=AnnouncementOut)
async def update_announcement(
    announcement_id: uuid.UUID,
    body: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin — update announcement (e.g., set is_active = False)."""
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(announcement, field, value)

    await db.commit()
    await db.refresh(announcement)
    return announcement


# ── Admin: Delete announcement ────────────────────────────────────────────────

@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin — delete announcement completely."""
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await db.delete(announcement)
    await db.commit()
