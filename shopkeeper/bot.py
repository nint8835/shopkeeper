import discord
from discord import app_commands

from .config import config

guild = discord.Object(config.guild_id)


class ShopkeeperBot(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)

        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self) -> None:
        # TODO: Better place for syncing?
        if config.sync_commands:
            await self.tree.sync(guild=guild)


intents = discord.Intents.default()
client = ShopkeeperBot(intents=intents)


@client.tree.command(guild=guild)
async def test(interaction: discord.Interaction) -> None:
    await interaction.response.send_message("Hello, world!")
