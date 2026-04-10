import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin
from app.db.session import get_db
from app.models.models import Member
from app.schemas.schemas import MemberCreate, MemberOut, MemberUpdate

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
async def list_members(db: AsyncSession = Depends(get_db)):
    """Public — returns all active members."""
    result = await db.execute(select(Member).where(Member.is_active.is_(True)))
    return result.scalars().all()


@router.get("/{member_id}", response_model=MemberOut)
async def get_member(member_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def create_member(
    body: MemberCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    member = Member(**body.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


@router.patch("/{member_id}", response_model=MemberOut)
async def update_member(
    member_id: uuid.UUID,
    body: MemberUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(member, field, value)
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
    await db.commit()
