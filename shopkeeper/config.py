from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="shopkeeper_", env_file=".env")

    token: str
    guild_id: str
    db_path: str = "shopkeeper.sqlite"

    sync_commands: bool = False

    @property
    def async_db_connection_uri(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"

    @property
    def sync_db_connection_uri(self) -> str:
        return f"sqlite:///{self.db_path}"


config = Config()

__all__ = ["config"]
