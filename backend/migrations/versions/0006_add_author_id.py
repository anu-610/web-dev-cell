"""add author_id to posts

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("posts", sa.Column("author_id", sa.String(64), nullable=True))
    op.create_index(op.f("ix_posts_author_id"), "posts", ["author_id"], unique=False)

def downgrade() -> None:
    op.drop_index(op.f("ix_posts_author_id"), table_name="posts")
    op.drop_column("posts", "author_id")
