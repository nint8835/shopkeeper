from itertools import groupby
from typing import cast

import discord
from sqlalchemy import select

from shopkeeper.bot import client
from shopkeeper.config import config
from shopkeeper.db import async_session
from shopkeeper.models.listing import Listing, ListingStatus


def pluralise(count: int, singular: str, plural: str) -> str:
    return singular if count == 1 else plural


async def send_reminders():
    guild = cast(discord.Guild, client.get_guild(config.guild_id))
    guild_members = guild.members

    async with async_session() as session:
        pending_listings_with_issues = (
            (
                await session.execute(
                    select(Listing)
                    .filter(
                        Listing.owner_id.in_([member.id for member in guild_members])
                    )
                    .filter(Listing.get_issues_clause())
                    .filter(Listing.status != ListingStatus.Closed)
                )
            )
            .scalars()
            .all()
        )

        issues_by_user = {
            k: len(list(v))
            for k, v in groupby(pending_listings_with_issues, key=lambda x: x.owner_id)
        }

        for user_id, issues_count in issues_by_user.items():
            user = guild.get_member(user_id)
            if user:
                await user.send(
                    f"You have {issues_count} active {pluralise(issues_count, 'listing', 'listings')} with issues that need your attention. Please check the Shopkeeper UI for more details."
                )


__all__ = ["send_reminders"]
