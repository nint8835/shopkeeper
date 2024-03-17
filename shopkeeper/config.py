from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="shopkeeper_", env_file=".env")

    token: str
    guild_id: str


config = Config()

__all__ = ["config"]
