"""Add time to events

Revision ID: f3ca43b9a652
Revises: 0e27ae9d8373
Create Date: 2025-04-16 19:46:18.124948

"""

import enum
import typing
from datetime import datetime, timezone
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

# revision identifiers, used by Alembic.
revision: str = "f3ca43b9a652"
down_revision: Union[str, None] = "0e27ae9d8373"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class Base(AsyncAttrs, DeclarativeBase):
    type_annotation_map = {
        enum.Enum: sa.Enum(enum.Enum, native_enum=False),
        typing.Literal: sa.Enum(enum.Enum, native_enum=False),
    }


class ListingEvent(Base):
    __tablename__ = "listing_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    time: Mapped[datetime]


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    with op.batch_alter_table("listing_events", schema=None) as batch_op:
        batch_op.add_column(sa.Column("time", sa.DateTime(), nullable=True))

    session.execute(sa.update(ListingEvent).values(time=datetime.now(tz=timezone.utc)))
    session.commit

    with op.batch_alter_table("listing_events", schema=None) as batch_op:
        batch_op.alter_column("time", existing_type=sa.DateTime(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("listing_events", schema=None) as batch_op:
        batch_op.drop_column("time")
