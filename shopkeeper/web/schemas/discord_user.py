from pydantic import BaseModel


class SessionUser(BaseModel):
    id: str
    username: str


class DiscordUser(BaseModel):
    id: str
    username: str
    is_owner: bool
