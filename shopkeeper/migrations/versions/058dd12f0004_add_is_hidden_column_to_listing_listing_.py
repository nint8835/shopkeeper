"""Add is_hidden column to listing & listing image

Revision ID: 058dd12f0004
Revises: 137eb0d399ee
Create Date: 2025-01-11 12:48:18.039194

"""

import enum
import typing
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

# revision identifiers, used by Alembic.
revision: str = "058dd12f0004"
down_revision: Union[str, None] = "137eb0d399ee"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class Base(AsyncAttrs, DeclarativeBase):
    type_annotation_map = {
        enum.Enum: sa.Enum(enum.Enum, native_enum=False),
        typing.Literal: sa.Enum(enum.Enum, native_enum=False),
    }


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    is_hidden: Mapped[bool]


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    is_hidden: Mapped[bool]


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.add_column(sa.Column("is_hidden", sa.Boolean(), nullable=True))

    with op.batch_alter_table("listings", schema=None) as batch_op:
        batch_op.add_column(sa.Column("is_hidden", sa.Boolean(), nullable=True))

    session.execute(sa.update(Listing).values(is_hidden=False))
    session.execute(sa.update(ListingImage).values(is_hidden=False))
    session.commit()

    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.alter_column("is_hidden", existing_type=sa.Boolean(), nullable=False)

    with op.batch_alter_table("listings", schema=None) as batch_op:
        batch_op.alter_column("is_hidden", existing_type=sa.Boolean(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("listings", schema=None) as batch_op:
        batch_op.drop_column("is_hidden")

    with op.batch_alter_table("listing_images", schema=None) as batch_op:
        batch_op.drop_column("is_hidden")
