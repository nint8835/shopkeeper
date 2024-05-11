from enum import Enum
from types import EllipsisType
from typing import Optional, cast

import discord
from sqlalchemy.orm import Mapped, mapped_column

import shopkeeper.bot as bot
from shopkeeper.config import config
from shopkeeper.db import Base, async_session


class ListingType(Enum):
    Buy = "buy"
    Sell = "sell"


class ListingStatus(Enum):
    Open = "open"
    Pending = "pending"
    Closed = "closed"


listing_colours: dict[tuple[ListingType, ListingStatus], discord.Colour] = {
    (ListingType.Buy, ListingStatus.Open): discord.Colour.blue(),
    (ListingType.Buy, ListingStatus.Pending): discord.Colour.gold(),
    (ListingType.Buy, ListingStatus.Closed): discord.Colour.red(),
    (ListingType.Sell, ListingStatus.Open): discord.Colour.green(),
    (ListingType.Sell, ListingStatus.Pending): discord.Colour.gold(),
    (ListingType.Sell, ListingStatus.Closed): discord.Colour.red(),
}


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str]
    description: Mapped[Optional[str]]
    price: Mapped[Optional[str]]
    type: Mapped[ListingType]
    status: Mapped[ListingStatus]

    owner_id: Mapped[int]
    message_id: Mapped[int]
    thread_id: Mapped[int]

    @property
    def embed(self) -> discord.Embed:
        embed = (
            discord.Embed(
                title=self.title,
                description=self.description or "No description.",
                color=listing_colours[(self.type, self.status)],
            )
            .add_field(name="Type", value=self.type.name, inline=True)
            .add_field(name="Status", value=self.status.name, inline=True)
            .add_field(name="Owner", value=f"<@{self.owner_id}>", inline=True)
        )

        if self.price is not None:
            embed.add_field(name="Price", value=self.price, inline=True)

        return embed

    @classmethod
    async def edit(
        cls,
        interaction: discord.Interaction,
        listing: int,
        *,
        title: str | EllipsisType = ...,
        description: str | None | EllipsisType = ...,
        price: str | None | EllipsisType = ...,
        status: ListingStatus | EllipsisType = ...,
    ) -> None:
        async with async_session() as session:
            async with session.begin():
                listing_instance = await session.get(Listing, listing)

                if listing_instance is None:
                    return await interaction.response.send_message(
                        "Listing not found", ephemeral=True
                    )

                if (
                    listing_instance.owner_id != interaction.user.id
                    and interaction.user.id != config.owner_id
                ):
                    return await interaction.response.send_message(
                        "You do not own this listing", ephemeral=True
                    )

                if listing_instance.status == ListingStatus.Closed:
                    return await interaction.response.send_message(
                        "Listing is closed", ephemeral=True
                    )

                if title is not ...:
                    listing_instance.title = title
                if description is not ...:
                    listing_instance.description = description
                if price is not ...:
                    listing_instance.price = price
                if status is not ...:
                    listing_instance.status = status

                await session.commit()

        channel = cast(
            discord.TextChannel, await bot.client.fetch_channel(config.channel_id)
        )
        message = await channel.fetch_message(listing_instance.message_id)
        thread = cast(
            discord.Thread,
            await bot.client.fetch_channel(listing_instance.thread_id),
        )

        if any(value is not ... for value in (title, description, status)):
            await message.edit(embed=listing_instance.embed)

        if title is not ...:
            await thread.edit(name=title)

        if status == ListingStatus.Closed:
            await thread.edit(locked=True, archived=True)

        await interaction.response.send_message("Listing updated", ephemeral=True)
