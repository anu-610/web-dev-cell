"""add project and member fields plus github stats

Revision ID: 0005
Revises: 0004
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add thumbnail_url to projects
    op.add_column("projects", sa.Column("thumbnail_url", sa.String(500), nullable=True))

    # Add instagram_url to members
    op.add_column("members", sa.Column("instagram_url", sa.String(255), nullable=True))

    # Avatar url exists in members, need to change length to 500? Actually just leaving it is fine, but model says 500.
    op.alter_column("members", "avatar_url", type_=sa.String(500), existing_type=sa.String(255))

    # Add github stats toggles to site_settings
    op.add_column("site_settings", sa.Column("show_github_stats", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("site_settings", sa.Column("github_repo", sa.String(255), nullable=True, server_default="kamandprompt/dev-cell"))


def downgrade() -> None:
    op.drop_column("site_settings", "github_repo")
    op.drop_column("site_settings", "show_github_stats")

    op.alter_column("members", "avatar_url", type_=sa.String(255), existing_type=sa.String(500))
    op.drop_column("members", "instagram_url")

    op.drop_column("projects", "thumbnail_url")
