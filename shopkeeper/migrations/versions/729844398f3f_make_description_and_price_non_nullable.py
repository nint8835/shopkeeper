"""Make description and price non-nullable

Revision ID: 729844398f3f
Revises: bff5d7d03989
Create Date: 2024-07-20 18:27:13.528838

"""

import enum
import typing
from typing import Optional, Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

# revision identifiers, used by Alembic.
revision: str = "729844398f3f"
down_revision: Union[str, None] = "bff5d7d03989"
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
    description: Mapped[Optional[str]]
    price: Mapped[Optional[str]]


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    session.execute(
        sa.update(Listing).where(Listing.description.is_(None)).values(description="")
    )
    session.execute(sa.update(Listing).where(Listing.price.is_(None)).values(price=""))

    with op.batch_alter_table("listings", schema=None) as batch_op:
        batch_op.alter_column("description", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.alter_column("price", existing_type=sa.VARCHAR(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("listings", schema=None) as batch_op:
        batch_op.alter_column("price", existing_type=sa.VARCHAR(), nullable=True)
        batch_op.alter_column("description", existing_type=sa.VARCHAR(), nullable=True)
