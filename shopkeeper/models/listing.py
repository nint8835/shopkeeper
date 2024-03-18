from enum import Enum
from typing import Optional, cast

import discord
from sqlalchemy.orm import Mapped, mapped_column

from shopkeeper.bot import client
from shopkeeper.config import config
from shopkeeper.db import Base


class ListingType(Enum):
    Buy = "buy"
    Sell = "sell"


class ListingStatus(Enum):
    Open = "open"
    Pending = "pending"
    Closed = "closed"


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str]
    description: Mapped[Optional[str]]
    type: Mapped[ListingType]
    status: Mapped[ListingStatus]

    owner_id: Mapped[str]
    message_id: Mapped[str]
    thread_id: Mapped[str]

    @property
    def embed(self) -> discord.Embed:
        return (
            discord.Embed(
                title=self.title,
                description=self.description or "No description",
                color=discord.Color.blurple(),
            )
            .add_field(name="Type", value=self.type.name)
            .add_field(name="Status", value=self.status.name)
        )

    async def update_listing_state(self) -> None:
        channel = await client.fetch_channel(config.channel_id)
        message = await channel.fetch_message(self.message_id)

        await message.edit(embed=self.embed)

        if self.status == ListingStatus.Closed:
            thread = cast(discord.Thread, await client.fetch_channel(self.thread_id))
            await thread.edit(locked=True, archived=True)
