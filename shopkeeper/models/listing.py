from dataclasses import dataclass
from difflib import unified_diff
from enum import Enum
from types import EllipsisType
from typing import TYPE_CHECKING, Callable, Literal, cast

import discord
from fastapi import HTTPException
from sqlalchemy import ColumnElement, and_, not_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

import shopkeeper.bot as bot
from shopkeeper.config import config
from shopkeeper.db import Base

if TYPE_CHECKING:
    from .listing_image import ListingImage


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


def stringify_diff_field(val: str | None, empty_placeholder: str = "`(empty)`") -> str:
    return val if val is not None else empty_placeholder


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str]
    description: Mapped[str]
    price: Mapped[str]
    type: Mapped[ListingType]
    status: Mapped[ListingStatus]
    is_hidden: Mapped[bool] = mapped_column(default=False)

    owner_id: Mapped[int]
    message_id: Mapped[int]
    thread_id: Mapped[int]

    images: Mapped[list["ListingImage"]] = relationship(
        back_populates="listing",
        lazy="raise",
        primaryjoin="and_(Listing.id == ListingImage.listing_id, ListingImage.is_hidden == False)",
    )

    @property
    def url(self) -> str:
        return f"https://discord.com/channels/{config.guild_id}/{config.channel_id}/{self.message_id}"

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

        if self.price:
            embed.add_field(name="Price", value=self.price, inline=True)

        return embed

    @property
    def issues(self) -> list["ListingIssueDetails"]:
        if self.status == ListingStatus.Closed:
            return []

        return [issue.details for issue in all_listing_issues if issue.predicate(self)]

    @staticmethod
    def get_issues_clause() -> ColumnElement[bool]:
        return or_(*[issue.sql_clause() for issue in all_listing_issues])

    @classmethod
    async def create(
        cls,
        type: ListingType,
        title: str,
        description: str,
        price: str,
        owner_id: int,
        session: AsyncSession,
    ) -> "Listing":
        new_listing = Listing(
            type=type,
            title=title,
            description=description,
            price=price,
            owner_id=owner_id,
            status=ListingStatus.Open,
        )

        marketplace_channel = cast(
            discord.TextChannel, await bot.client.fetch_channel(config.channel_id)
        )

        thread_message = await marketplace_channel.send(embed=new_listing.embed)

        thread = await marketplace_channel.create_thread(
            name=new_listing.title,
            message=thread_message,
            auto_archive_duration=10080,
        )
        new_listing.thread_id = thread.id
        new_listing.message_id = thread_message.id

        await thread.add_user(discord.Object(owner_id))

        async with session.begin():
            session.add(new_listing)
            await session.commit()

        if config.events_channel_id is not None:
            await cast(
                discord.TextChannel,
                await bot.client.fetch_channel(config.events_channel_id),
            ).send(
                content=f"## Listing **[{new_listing.title}]({thread_message.jump_url})** created",
                suppress_embeds=True,
            )

        return new_listing

    @classmethod
    async def edit(
        cls,
        listing: int,
        user_id: int,
        session: AsyncSession,
        *,
        title: str | EllipsisType = ...,
        description: str | EllipsisType = ...,
        price: str | EllipsisType = ...,
        status: ListingStatus | EllipsisType = ...,
    ) -> "Listing":
        async with session.begin():
            listing_instance = await session.get(Listing, listing)

            if listing_instance is None:
                raise HTTPException(status_code=404, detail="Listing not found")

            if listing_instance.owner_id != user_id and user_id != config.owner_id:
                raise HTTPException(
                    status_code=403, detail="You do not own this listing"
                )

            if listing_instance.status == ListingStatus.Closed:
                raise HTTPException(status_code=400, detail="Listing is closed")

            channel = cast(
                discord.TextChannel, await bot.client.fetch_channel(config.channel_id)
            )
            message = await channel.fetch_message(listing_instance.message_id)
            thread = cast(
                discord.Thread,
                await bot.client.fetch_channel(listing_instance.thread_id),
            )

            edited_message_sections: list[str] = []
            should_close_thread = False

            if title is not ...:
                if listing_instance.title != title:
                    edited_message_sections.append(
                        f"Title changed from {listing_instance.title} to {title}"
                    )
                    await thread.edit(name=title)

                listing_instance.title = title

            if description is not ...:
                if listing_instance.description != description:
                    diff = unified_diff(
                        stringify_diff_field(
                            listing_instance.description, ""
                        ).splitlines(),
                        stringify_diff_field(description, "").splitlines(),
                        lineterm="",
                        fromfile="Old description",
                        tofile="New description",
                    )

                    edited_message_sections.append(
                        f"Description changed:\n```diff\n{'\n'.join(diff)}\n```"
                    )

                listing_instance.description = description
            if price is not ...:
                if listing_instance.price != price:
                    edited_message_sections.append(
                        f"Price changed from {stringify_diff_field(listing_instance.price)} to {stringify_diff_field(price)}"
                    )

                listing_instance.price = price
            if status is not ...:
                if listing_instance.status != status:
                    edited_message_sections.append(
                        f"Status changed from {listing_instance.status.name} to {status.name}"
                    )
                    if status == ListingStatus.Closed:
                        should_close_thread = True

                listing_instance.status = status

            await session.commit()

        if edited_message_sections:
            await message.edit(embed=listing_instance.embed)

        if should_close_thread:
            await thread.edit(archived=True, locked=True)

        if config.events_channel_id is not None and edited_message_sections:
            await cast(
                discord.TextChannel,
                await bot.client.fetch_channel(config.events_channel_id),
            ).send(
                content=f"## Listing **[{listing_instance.title}]({message.jump_url})** edited\n{'\n'.join(edited_message_sections)}",
                suppress_embeds=True,
            )

        return listing_instance


type ListingIssueIcon = Literal["image", "text", "dollar-sign"]
type ListingIssueResolutionLocation = Literal["ui", "discord"]


@dataclass
class ListingIssueDetails:
    title: str
    description: str
    icon: ListingIssueIcon
    resolution_location: ListingIssueResolutionLocation = "ui"


@dataclass
class ListingIssues:
    details: ListingIssueDetails
    sql_clause: Callable[[], ColumnElement[bool]]
    predicate: Callable[["Listing"], bool]


all_listing_issues: list[ListingIssues] = [
    ListingIssues(
        details=ListingIssueDetails(
            title="No images",
            description="Your listing has no images. Please send at least one photo the item in your listing's thread.",
            icon="image",
            resolution_location="discord",
        ),
        sql_clause=lambda: and_(
            not_(Listing.images.any()), Listing.type == ListingType.Sell
        ),
        predicate=lambda listing: (
            len(listing.images) == 0 and listing.type == ListingType.Sell
        ),
    ),
    ListingIssues(
        details=ListingIssueDetails(
            title="No price",
            description="Your listing has no price.",
            icon="dollar-sign",
        ),
        sql_clause=lambda: and_(Listing.price == "", Listing.type == ListingType.Sell),
        predicate=lambda listing: (
            listing.price == "" and listing.type == ListingType.Sell
        ),
    ),
    ListingIssues(
        details=ListingIssueDetails(
            title="No description",
            description="Your listing has no description.",
            icon="text",
        ),
        sql_clause=lambda: Listing.description == "",
        predicate=lambda listing: listing.description == "",
    ),
]
