import traceback

import discord

from shopkeeper.bot import client, guild
from shopkeeper.models.listing import Listing, ListingType


class CreateListingModal(discord.ui.Modal):
    listing_title = discord.ui.TextInput(label="Title")
    listing_description = discord.ui.TextInput(
        label="Description", style=discord.TextStyle.paragraph, required=False
    )

    def __init__(self, listing_type: ListingType):
        self.listing_type = listing_type

        type_titles = {
            ListingType.BUY: "Create a buy request",
            ListingType.SELL: "List an item for sale",
        }

        super().__init__(title=type_titles[listing_type])

    async def on_submit(self, interaction: discord.Interaction):
        new_listing = Listing(
            type=self.listing_type,
            title=self.listing_title.value,
            description=self.listing_description.value,
            owner_id=interaction.user.id,
        )

        await interaction.response.send_message(embed=new_listing.embed, ephemeral=True)

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
    await interaction.response.send_modal(CreateListingModal(ListingType.SELL))


@client.tree.command(guild=guild)
async def buy(interaction: discord.Interaction):
    """Create a new buy request."""
    await interaction.response.send_modal(CreateListingModal(ListingType.BUY))
