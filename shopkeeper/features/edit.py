import traceback

import discord
from discord import app_commands
from sqlalchemy import select

from shopkeeper.bot import client, guild
from shopkeeper.db import async_session
from shopkeeper.models.listing import Listing, ListingStatus


class EditListingInfoModal(discord.ui.Modal):
    listing_title = discord.ui.TextInput(label="Title")
    listing_description = discord.ui.TextInput(
        label="Description", style=discord.TextStyle.paragraph, required=False
    )

    def __init__(self, listing: Listing):
        super().__init__(title="Edit listing information")
        self.listing = listing

        self.listing_title.default = listing.title
        self.listing_description.default = listing.description or ""

    async def on_submit(self, interaction: discord.Interaction):
        async with async_session() as session:
            async with session.begin():
                listing_instance = await session.get(Listing, self.listing.id)

                if listing_instance is None:
                    return await interaction.response.send_message(
                        "Listing not found", ephemeral=True
                    )

                if listing_instance.owner_id != interaction.user.id:
                    return await interaction.response.send_message(
                        "You do not own this listing", ephemeral=True
                    )

                listing_instance.title = self.listing_title.value
                listing_instance.description = self.listing_description.value or None

                session.add(listing_instance)
                await session.commit()

        await listing_instance.update_listing_state()

        await interaction.response.send_message(
            "Listing information updated", ephemeral=True
        )

    async def on_error(
        self, interaction: discord.Interaction, error: Exception
    ) -> None:
        await interaction.response.send_message(
            f"Something went wrong.\n```py\n{"\n".join(traceback.format_exception(error))}\n```",
            ephemeral=True,
        )


class EditListing(app_commands.Group):
    @app_commands.command()
    async def status(
        self, interaction: discord.Interaction, listing: int, status: ListingStatus
    ):
        """Edit the status of a listing."""
        async with async_session() as session:
            async with session.begin():
                listing_instance = await session.get(Listing, listing)

                if listing_instance is None:
                    return await interaction.response.send_message(
                        "Listing not found", ephemeral=True
                    )

                if listing_instance.owner_id != interaction.user.id:
                    return await interaction.response.send_message(
                        "You do not own this listing", ephemeral=True
                    )

                listing_instance.status = status
                await session.commit()

        await listing_instance.update_listing_state()

        await interaction.response.send_message(
            f"Listing status updated to {status.name}", ephemeral=True
        )

    @staticmethod
    @status.autocomplete("listing")
    async def status_listing_autocomplete(
        self, interaction: discord.Interaction, current: str
    ):
        async with async_session() as session:
            result = await session.execute(
                select(Listing)
                .filter_by(owner_id=interaction.user.id)
                .filter(Listing.title.ilike(f"%{current}%"))
                .filter(Listing.status != ListingStatus.Closed)
            )

            return [
                app_commands.Choice(name=listing.title, value=listing.id)
                for listing in result.scalars().all()
            ]

    @app_commands.command()
    async def info(self, interaction: discord.Interaction, listing: int):
        """Edit information about a listing."""
        async with async_session() as session:
            listing_instance = await session.get(Listing, listing)

            if listing_instance is None:
                return await interaction.response.send_message(
                    "Listing not found", ephemeral=True
                )

            if listing_instance.owner_id != interaction.user.id:
                return await interaction.response.send_message(
                    "You do not own this listing", ephemeral=True
                )

        await interaction.response.send_modal(EditListingInfoModal(listing_instance))

    @staticmethod
    @info.autocomplete("listing")
    async def info_listing_autocomplete(
        self, interaction: discord.Interaction, current: str
    ):
        async with async_session() as session:
            result = await session.execute(
                select(Listing)
                .filter_by(owner_id=interaction.user.id)
                .filter(Listing.title.ilike(f"%{current}%"))
                .filter(Listing.status != ListingStatus.Closed)
            )

            return [
                app_commands.Choice(name=listing.title, value=listing.id)
                for listing in result.scalars().all()
            ]


client.tree.add_command(EditListing(), guild=guild)
