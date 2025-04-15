from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="shopkeeper_", env_file=".env")

    behind_reverse_proxy: bool = False
    bind_host: str = "0.0.0.0"
    bind_port: int = 8000
    channel_id: int
    client_id: str | None = None
    client_secret: str | None = None
    db_log_queries: bool = False
    db_path: str = "shopkeeper.sqlite"
    events_channel_id: int | None = None
    guild_id: int
    image_path: Path = Path("images")
    init_on_startup: bool = True
    owner_id: int
    session_secret: str = "replace-me"
    token: str
    reminder_interval: int = 60 * 60 * 24 * 14  # 14 days

    @property
    def async_db_connection_uri(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"

    @property
    def sync_db_connection_uri(self) -> str:
        return f"sqlite:///{self.db_path}"


config = Config()  # type: ignore - Pydantic and Pyright don't play nice, but Discord.py doesn't work with Mypy

__all__ = ["config"]
