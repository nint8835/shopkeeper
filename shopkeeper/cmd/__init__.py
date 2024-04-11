import alembic.config
import typer

from shopkeeper.bot import client, guild
from shopkeeper.config import config
from shopkeeper.features import *  # noqa: F401, F403

from .utils import async_command

app = typer.Typer()


@app.command()
def start() -> None:
    """Run the bot."""
    client.run(config.token)


@app.command()
@async_command
async def sync() -> None:
    """Sync the bot's slash commands with Discord."""
    await client.login(config.token)
    await client.tree.sync(guild=guild)

    # Explicitly closing is required as otherwise it will warn of unclosed connectors
    await client.close()


@app.command()
def upgrade() -> None:
    """Perform database migrations."""
    print("Performing migrations against path", config.sync_db_connection_uri)
    alembic.config.main(argv=["--raiseerr", "upgrade", "head"])


__all__ = ["app"]
