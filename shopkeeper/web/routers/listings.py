from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shopkeeper.models.listing import Listing
from shopkeeper.web.dependencies.auth import require_discord_user
from shopkeeper.web.dependencies.database import get_db
from shopkeeper.web.schemas.listings import ListingSchema

listings_router = APIRouter(
    tags=["Listings"], dependencies=[Depends(require_discord_user)]
)


@listings_router.get("/", response_model=list[ListingSchema])
async def get_listings(db: AsyncSession = Depends(get_db)) -> Any:
    return (await db.execute(select(Listing))).scalars().all()


__all__ = ["listings_router"]
