from enum import Enum
from typing import Optional

import discord
from sqlalchemy.orm import Mapped, mapped_column

from shopkeeper.db import Base


class ListingType(Enum):
    BUY = "buy"
    SELL = "sell"


class ListingStatus(Enum):
    OPEN = "open"
    PENDING = "pending"
    CLOSED = "closed"


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
        return discord.Embed(
            title=self.title,
            description=self.description or "No description",
            color=discord.Color.blurple(),
        ).add_field(name="Type", value=self.type.value.capitalize())
