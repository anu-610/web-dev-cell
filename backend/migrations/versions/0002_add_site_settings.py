"""add site_settings table for global config (hero theme)

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "hero_theme",
            sa.String(32),
            nullable=False,
            server_default="aurora",
        ),
    )
    # Seed the singleton row so GET /settings/theme always finds a value
    op.execute("INSERT INTO site_settings (id, hero_theme) VALUES (1, 'aurora')")


def downgrade() -> None:
    op.drop_table("site_settings")
