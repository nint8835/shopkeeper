import discord
from discord import app_commands
from sqlalchemy import select

import shopkeeper.models.listing as listing

from .config import config
from .db import async_session

guild = discord.Object(config.guild_id)


class ShopkeeperBot(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)

        self.tree = app_commands.CommandTree(self)

    async def on_thread_update(self, before: discord.Thread, after: discord.Thread):
        if after.archived and not before.archived:
            async with async_session() as session:
                thread_listing = (
                    await session.execute(
                        select(listing.Listing)
                        .filter_by(thread_id=after.id)
                        .filter(listing.Listing.status != listing.ListingStatus.Closed)
                    )
                ).scalar_one_or_none()

                if not thread_listing:
                    return

                await after.edit(archived=False)


intents = discord.Intents.default()
client = ShopkeeperBot(intents=intents)
