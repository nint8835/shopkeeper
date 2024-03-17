from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import config


class Base(AsyncAttrs, DeclarativeBase):
    pass


engine = create_async_engine(config.async_db_connection_uri, echo=True)

async_session = async_sessionmaker(engine, expire_on_commit=False)
