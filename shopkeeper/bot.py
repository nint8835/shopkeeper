import traceback

import discord
from discord import app_commands
from sqlalchemy import select

from shopkeeper.models import listing, listing_image

from .config import config
from .db import async_session

guild = discord.Object(config.guild_id)


class ShopkeeperBot(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)

        self.tree = app_commands.CommandTree(self)

    async def on_thread_update(self, before: discord.Thread, after: discord.Thread):
        try:
            if after.archived and not before.archived:
                async with async_session() as session:
                    thread_listing = (
                        await session.execute(
                            select(listing.Listing)
                            .filter_by(thread_id=after.id)
                            .filter(
                                listing.Listing.status != listing.ListingStatus.Closed
                            )
                        )
                    ).scalar_one_or_none()

                    if not thread_listing:
                        return

                    await after.edit(archived=False)
        except:  # noqa
            traceback.print_exc()

    async def on_message(self, message: discord.Message):
        try:
            if not message.attachments:
                return

            async with async_session() as session, session.begin():
                message_listing = (
                    await session.execute(
                        select(listing.Listing).filter_by(
                            thread_id=message.channel.id, owner_id=message.author.id
                        )
                    )
                ).scalar_one_or_none()

                if not message_listing:
                    return

                for attachment in message.attachments:
                    await listing_image.ListingImage.from_attachment(
                        listing_id=message_listing.id,
                        attachment=attachment,
                        session=session,
                    )
                await session.commit()
        except:  # noqa
            traceback.print_exc()


intents = discord.Intents.default()
intents.message_content = True
intents.members = True
client = ShopkeeperBot(intents=intents)
