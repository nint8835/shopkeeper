import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from shopkeeper.bot import client
from shopkeeper.config import config
from shopkeeper.web.routers import listings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(client.start(config.token))

    yield

    await client.close()


app = FastAPI(title="Shopkeeper", lifespan=lifespan)

app.include_router(listings_router, prefix="/api/listings")


__all__ = ["app"]
