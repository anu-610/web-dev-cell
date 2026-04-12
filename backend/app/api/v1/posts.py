import uuid
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin, verify_supabase_jwt
from app.core.recaptcha import verify_recaptcha
from app.db.session import get_db
from app.models.models import Post
from app.schemas.schemas import PostCreate, PostOut, PostStatusUpdate

router = APIRouter(prefix="/posts", tags=["posts"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


# ── Public: Upload thumbnail ───────────────────────────────────────────────────

@router.post("/upload-thumbnail", tags=["posts"])
async def upload_thumbnail(file: UploadFile = File(...)):
    """Public endpoint — upload a thumbnail image, returns its URL path."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type: {file.content_type}. Use JPEG, PNG, WEBP, or GIF.",
        )

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    unique_name = f"{uuid.uuid4()}.{ext}"
    dest = os.path.join(UPLOADS_DIR, unique_name)

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"url": f"/uploads/{unique_name}"}


# ── Public: Submit a new post (requires valid reCAPTCHA) ──────────────────────

@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(request: Request, body: PostCreate, db: AsyncSession = Depends(get_db)):
    """Any user can submit a post. It starts as 'pending' unless an admin creates it."""
    is_admin = False
    author_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
            payload = await verify_supabase_jwt(creds)
            author_id = payload.get("sub")
            role = (payload.get("app_metadata") or {}).get("role", "")
            if role == "admin":
                is_admin = True
        except Exception:
            pass

    if not is_admin:
        await verify_recaptcha(body.recaptcha_token)

    post = Post(
        title=body.title.strip(),
        content=body.content,
        author_name=body.author_name.strip(),
        author_id=author_id,
        category=body.category.strip(),
        thumbnail_url=body.thumbnail_url,
        status="approved" if is_admin else "pending",
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


# ── Public: List approved posts ───────────────────────────────────────────────

@router.get("", response_model=list[PostOut])
async def list_approved_posts(db: AsyncSession = Depends(get_db)):
    """Public — returns all approved posts, newest first."""
    result = await db.execute(
        select(Post)
        .where(Post.status == "approved")
        .order_by(Post.created_at.desc())
    )
    return result.scalars().all()


# ── Authenticated: List my posts ──────────────────────────────────────────────

@router.get("/me", response_model=list[PostOut])
async def list_my_posts(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(verify_supabase_jwt),
):
    """Authenticated users — returns their own posts of any status."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    result = await db.execute(
        select(Post)
        .where(Post.author_id == user_id)
        .order_by(Post.created_at.desc())
    )
    return result.scalars().all()


# ── Public: Get single approved post (or any status for owner/admin) ──────────

@router.get("/{post_id}", response_model=PostOut)
async def get_post(request: Request, post_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.status != "approved":
        # Check if the requester is an admin or the author
        can_view = False
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
                payload = await verify_supabase_jwt(creds)

                # Admin check
                role = (payload.get("app_metadata") or {}).get("role", "")
                if role == "admin":
                    can_view = True

                # Owner check
                user_id = payload.get("sub")
                if user_id and post.author_id == user_id:
                    can_view = True
            except Exception:
                pass

        if not can_view:
            raise HTTPException(status_code=404, detail="Post not found")

    return post


# ── Admin: List all posts (any status) ────────────────────────────────────────

@router.get("/admin/all", response_model=list[PostOut])
async def admin_list_posts(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin — returns all posts ordered by created_at desc."""
    result = await db.execute(select(Post).order_by(Post.created_at.desc()))
    return result.scalars().all()


# ── User/Admin: Update post content/metadata ──────────────────────────────────

from pydantic import BaseModel
class PostAdminUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    author_name: str | None = None
    category: str | None = None
    thumbnail_url: str | None = None

@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: uuid.UUID,
    body: PostAdminUpdate,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(verify_supabase_jwt),
):
    """Owner or Admin — update post metadata and content."""
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    user_id = payload.get("sub")
    role = (payload.get("app_metadata") or {}).get("role", "")
    is_admin = role == "admin"

    if not is_admin and post.author_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this post")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    if not is_admin:
        post.status = "pending"
        post.rejection_reason = None
    else:
        post.status = "approved"
        post.rejection_reason = None

    await db.commit()
    await db.refresh(post)
    return post


# ── Admin: Approve or reject a post ───────────────────────────────────────────

@router.patch("/{post_id}/status", response_model=PostOut)
async def update_post_status(
    post_id: uuid.UUID,
    body: PostStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Admin — set post status to 'approved' or 'rejected'."""
    if body.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = body.status
    if body.status == "rejected" and body.rejection_reason:
        post.rejection_reason = body.rejection_reason.strip()
    elif body.status == "approved":
        post.rejection_reason = None

    await db.commit()
    await db.refresh(post)
    return post


# ── Admin: Delete a post ──────────────────────────────────────────────────────

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
