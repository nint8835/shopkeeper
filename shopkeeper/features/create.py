import traceback
from typing import cast

import discord

from shopkeeper.bot import client, guild
from shopkeeper.config import config
from shopkeeper.db import async_session
from shopkeeper.models.listing import Listing, ListingStatus, ListingType


class CreateListingModal(discord.ui.Modal):
    listing_title = discord.ui.TextInput["CreateListingModal"](label="Title")
    listing_description = discord.ui.TextInput["CreateListingModal"](
        label="Description", style=discord.TextStyle.paragraph, required=False
    )
    listing_price = discord.ui.TextInput["CreateListingModal"](
        label="Price", required=False
    )

    def __init__(self, listing_type: ListingType):
        self.listing_type = listing_type

        type_titles = {
            ListingType.Buy: "Create a buy request",
            ListingType.Sell: "List an item for sale",
        }

        super().__init__(title=type_titles[listing_type])

    async def on_submit(self, interaction: discord.Interaction):
        new_listing = Listing(
            type=self.listing_type,
            title=self.listing_title.value,
            description=self.listing_description.value or None,
            price=self.listing_price.value or None,
            owner_id=interaction.user.id,
            status=ListingStatus.Open,
        )

        marketplace_channel = cast(
            discord.TextChannel, await client.fetch_channel(config.channel_id)
        )

        thread_message = await marketplace_channel.send(embed=new_listing.embed)

        thread = await marketplace_channel.create_thread(
            name=new_listing.title,
            message=thread_message,
            auto_archive_duration=10080,
        )
        new_listing.thread_id = thread.id
        new_listing.message_id = thread_message.id

        await thread.add_user(discord.Object(interaction.user.id))

        async with async_session() as session:
            async with session.begin():
                session.add(new_listing)
                await session.commit()

        await interaction.response.send_message(
            f"Listing created: {thread_message.jump_url}", ephemeral=True
        )

    async def on_error(
        self, interaction: discord.Interaction, error: Exception
    ) -> None:
        await interaction.response.send_message(
            f"Something went wrong.\n```py\n{"\n".join(traceback.format_exception(error))}\n```",
            ephemeral=True,
        )


@client.tree.command(guild=guild)
async def sell(interaction: discord.Interaction):
    """List a new item for sale."""
    await interaction.response.send_modal(CreateListingModal(ListingType.Sell))


@client.tree.command(guild=guild)
async def buy(interaction: discord.Interaction):
    """Create a new buy request."""
    await interaction.response.send_modal(CreateListingModal(ListingType.Buy))
