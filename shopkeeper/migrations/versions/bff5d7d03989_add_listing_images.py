"""Add listing images

Revision ID: bff5d7d03989
Revises: 1acae44de005
Create Date: 2024-07-02 19:46:21.433352

"""

import asyncio
import enum
import typing
import uuid
from pathlib import Path
from typing import Sequence, Union, cast

import discord
import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from shopkeeper.config import config

# revision identifiers, used by Alembic.
revision: str = "bff5d7d03989"
down_revision: Union[str, None] = "1acae44de005"
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
    listing_id: Mapped[int]

    @classmethod
    async def from_attachment(
        cls, *, listing_id: int, attachment: discord.Attachment, session: Session
    ) -> "ListingImage | None":
        attachment_extension = Path(attachment.filename).suffix

        if attachment_extension not in [".png", ".jpg", ".jpeg"]:
            return None

        listing_image_prefix = config.image_path / str(listing_id)
        listing_image_prefix.mkdir(parents=True, exist_ok=True)

        image_path = Path(str(listing_id)) / (str(uuid.uuid4()) + attachment_extension)
        file_path = config.image_path / image_path

        with open(file_path, "wb") as f:
            await attachment.save(f)

        instance = ListingImage(listing_id=listing_id, path=str(image_path))
        session.add(instance)

        return instance


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int]
    thread_id: Mapped[int]


async def backfill_images() -> None:
    intents = discord.Intents.default()
    intents.message_content = True
    bot = discord.Client(intents=intents)
    await bot.login(config.token)

    bind = op.get_bind()
    session = Session(bind=bind)

    listings = session.execute(sa.select(Listing)).scalars().all()

    for listing in listings:
        channel = cast(discord.Thread, await bot.fetch_channel(listing.thread_id))

        async for message in channel.history(limit=None):
            if message.author.id != listing.owner_id:
                continue

            for attachment in message.attachments:
                await ListingImage.from_attachment(
                    listing_id=listing.id,
                    attachment=attachment,
                    session=session,
                )

    session.commit()


def upgrade() -> None:
    op.create_table(
        "listing_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("path", sa.String(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["listing_id"],
            ["listings.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    asyncio.run(backfill_images())


def downgrade() -> None:
    op.drop_table("listing_images")
