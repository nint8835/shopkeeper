import alembic.config
import typer
import uvicorn

from shopkeeper.bot import client, guild
from shopkeeper.config import config
from shopkeeper.features import *  # noqa: F401, F403

from .utils import async_command

app = typer.Typer()


@app.command()
def start() -> None:
    """Run Shopkeeper."""

    if config.init_on_startup:
        upgrade()

    uvicorn.run(
        "shopkeeper.web.app:app",
        host=config.bind_host,
        port=config.bind_port,
        proxy_headers=config.behind_reverse_proxy,
        forwarded_allow_ips="*" if config.behind_reverse_proxy else None,
    )


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
    alembic.config.main(argv=["--raiseerr", "upgrade", "head"])


__all__ = ["app"]
