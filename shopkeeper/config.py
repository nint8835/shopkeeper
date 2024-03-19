from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="shopkeeper_", env_file=".env")

    token: str

    db_path: str = "shopkeeper.sqlite"
    db_log_queries: bool = False

    guild_id: str
    channel_id: int

    sync_commands: bool = False

    @property
    def async_db_connection_uri(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"

    @property
    def sync_db_connection_uri(self) -> str:
        return f"sqlite:///{self.db_path}"


config = Config()  # type: ignore - Pydantic and Pyright don't play nice, but Discord.py doesn't work with Mypy

__all__ = ["config"]
