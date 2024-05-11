import traceback

import discord
from discord import app_commands
from sqlalchemy import select

from shopkeeper.bot import client, guild
from shopkeeper.config import config
from shopkeeper.db import async_session
from shopkeeper.models.listing import Listing, ListingStatus


class EditListingInfoModal(discord.ui.Modal):
    listing_title = discord.ui.TextInput["EditListingInfoModal"](label="Title")
    listing_description = discord.ui.TextInput["EditListingInfoModal"](
        label="Description", style=discord.TextStyle.paragraph, required=False
    )
    listing_price = discord.ui.TextInput["EditListingInfoModal"](
        label="Price", required=False
    )

    def __init__(self, listing: Listing):
        super().__init__(title="Edit listing information")
        self.listing = listing

        self.listing_title.default = listing.title
        self.listing_description.default = listing.description or ""
        self.listing_price.default = listing.price or ""

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await Listing.edit(
            interaction,
            self.listing.id,
            title=self.listing_title.value,
            description=self.listing_description.value or None,
            price=self.listing_price.value or None,
        )

    async def on_error(
        self, interaction: discord.Interaction, error: Exception
    ) -> None:
        await interaction.response.send_message(
            f"Something went wrong.\n```py\n{"\n".join(traceback.format_exception(error))}\n```",
            ephemeral=True,
        )


async def edit_autocomplete(
    interaction: discord.Interaction, current: str
) -> list[app_commands.Choice[int]]:
    async with async_session() as session:
        is_admin_query = interaction.user.id == config.owner_id and current.startswith(
            "admin:"
        )

        if is_admin_query:
            current = current.removeprefix("admin:")

        query = (
            select(Listing)
            .filter(Listing.title.ilike(f"%{current}%"))
            .filter(Listing.status != ListingStatus.Closed)
        )

        if is_admin_query:
            query = query.filter(Listing.owner_id != interaction.user.id)
        else:
            query = query.filter(Listing.owner_id == interaction.user.id)

        result = await session.execute(query)

        return [
            app_commands.Choice(name=listing.title, value=listing.id)
            for listing in result.scalars().all()
        ]


class EditListing(app_commands.Group):
    @app_commands.command()
    @app_commands.describe(
        listing="The listing to edit.", status="The new status of the listing."
    )
    async def status(
        self, interaction: discord.Interaction, listing: int, status: ListingStatus
    ) -> None:
        """Edit the status of a listing."""
        await Listing.edit(
            interaction,
            listing,
            status=status,
        )

    @status.autocomplete("listing")
    async def status_listing_autocomplete(
        self, interaction: discord.Interaction, current: str
    ) -> list[app_commands.Choice[int]]:
        return await edit_autocomplete(interaction, current)

    @app_commands.command()
    @app_commands.describe(listing="The listing to edit.")
    async def info(self, interaction: discord.Interaction, listing: int) -> None:
        """Edit information about a listing."""
        async with async_session() as session:
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

        await interaction.response.send_modal(EditListingInfoModal(listing_instance))

    @info.autocomplete("listing")
    async def info_listing_autocomplete(
        self, interaction: discord.Interaction, current: str
    ) -> list[app_commands.Choice[int]]:
        return await edit_autocomplete(interaction, current)


client.tree.add_command(EditListing(), guild=guild)
