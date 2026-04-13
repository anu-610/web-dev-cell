import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl, ConfigDict


# ── Member ────────────────────────────────────────────────────────────────────

class MemberBase(BaseModel):
    name: str
    role: str
    bio: str | None = None
    year: int | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    instagram_url: str | None = None
    avatar_url: str | None = None
    is_active: bool = True


class MemberCreate(MemberBase):
    supabase_uid: str | None = None


class MemberUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    bio: str | None = None
    year: int | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    instagram_url: str | None = None
    avatar_url: str | None = None
    is_active: bool | None = None


class MemberOut(MemberBase):
    id: uuid.UUID
    supabase_uid: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Project ───────────────────────────────────────────────────────────────────

class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    tags: str | None = None
    thumbnail_url: str | None = None
    github_url: str | None = None
    live_url: str | None = None
    featured: bool = False
    is_active: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    tags: str | None = None
    thumbnail_url: str | None = None
    github_url: str | None = None
    live_url: str | None = None
    featured: bool | None = None
    is_active: bool | None = None


class ProjectOut(ProjectBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



# ── Post ──────────────────────────────────────────────────────────────────────

VALID_CATEGORIES = ["vulnerability", "new-feature", "tutorial", "news", "announcement", "other"]


class PostCreate(BaseModel):
    title: str
    content: str
    author_name: str
    category: str
    thumbnail_url: str
    recaptcha_token: str


class PostOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    author_name: str
    author_id: str | None = None
    category: str
    thumbnail_url: str
    status: str
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PostStatusUpdate(BaseModel):
    status: str  # "approved" | "rejected"
    rejection_reason: str | None = None


# ── Announcement ──────────────────────────────────────────────────────────────

class AnnouncementBase(BaseModel):
    title: str
    message: str
    link_url: str | None = None
    end_date: datetime
    is_active: bool = True

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    link_url: str | None = None
    end_date: datetime | None = None
    is_active: bool | None = None

class AnnouncementOut(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Site Settings ─────────────────────────────────────────────────────────────

class ThemeOut(BaseModel):
    theme: str

class SiteSettingsOut(BaseModel):
    hero_theme: str
    show_github_stats: bool
    github_repo: str | None
    hero_stats: list | None = None

    model_config = ConfigDict(from_attributes=True)

class SiteSettingsUpdate(BaseModel):
    hero_theme: str | None = None
    show_github_stats: bool | None = None
    github_repo: str | None = None
    hero_stats: list | None = None

class ThemeUpdate(BaseModel):
    theme: str
