import discord
from discord import app_commands
from sqlalchemy import select

from shopkeeper.bot import client, guild
from shopkeeper.db import async_session
from shopkeeper.models.listing import Listing, ListingStatus


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


client.tree.add_command(EditListing(), guild=guild)
