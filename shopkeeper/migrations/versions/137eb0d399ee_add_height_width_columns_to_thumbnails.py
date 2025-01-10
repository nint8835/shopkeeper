"""Add height & width columns to thumbnails

Revision ID: 137eb0d399ee
Revises: 729844398f3f
Create Date: 2025-01-10 16:48:49.284900

"""

import enum
import typing
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from shopkeeper.config import config

# revision identifiers, used by Alembic.
revision: str = "137eb0d399ee"
down_revision: Union[str, None] = "729844398f3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class Base(AsyncAttrs, DeclarativeBase):
    type_annotation_map = {
        enum.Enum: sa.Enum(enum.Enum, native_enum=False),
        typing.Literal: sa.Enum(enum.Enum, native_enum=False),
    }


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str]
    width: Mapped[int]
    height: Mapped[int]


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.add_column(sa.Column("width", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("height", sa.Integer(), nullable=True))

    listing_images = session.execute(sa.select(ListingImage)).scalars().all()

    for listing_image in listing_images:
        with Image.open(config.image_path / listing_image.path) as img:
            listing_image.width = img.width
            listing_image.height = img.height

    session.commit()

    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.alter_column("width", existing_type=sa.Integer(), nullable=False)
        batch_op.alter_column("height", existing_type=sa.Integer(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.drop_column("height")
        batch_op.drop_column("width")
