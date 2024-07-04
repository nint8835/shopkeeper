from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="shopkeeper_", env_file=".env")

    token: str

    db_path: str = "shopkeeper.sqlite"
    db_log_queries: bool = False

    image_path: Path = Path("images")

    guild_id: int
    channel_id: int
    owner_id: int
    events_channel_id: int | None = None

    bind_host: str = "0.0.0.0"
    bind_port: int = 8000

    client_id: str | None = None
    client_secret: str | None = None
    session_secret: str = "replace-me"

    behind_reverse_proxy: bool = False

    @property
    def async_db_connection_uri(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"

    @property
    def sync_db_connection_uri(self) -> str:
        return f"sqlite:///{self.db_path}"


config = Config()  # type: ignore - Pydantic and Pyright don't play nice, but Discord.py doesn't work with Mypy

__all__ = ["config"]
