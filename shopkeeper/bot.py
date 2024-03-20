import discord
from discord import app_commands

from .config import config

guild = discord.Object(config.guild_id)


class ShopkeeperBot(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)

        self.tree = app_commands.CommandTree(self)


intents = discord.Intents.default()
client = ShopkeeperBot(intents=intents)
