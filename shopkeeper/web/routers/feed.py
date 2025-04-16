from fastapi import APIRouter, Depends, Request
from fastapi_rss import Item, RSSFeed, RSSResponse  # type: ignore
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shopkeeper.models.listing_event import ListingEvent
from shopkeeper.web.dependencies.database import get_db

feed_router = APIRouter(tags=["Feed"], include_in_schema=False)


@feed_router.get("/")
async def get_feed(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> RSSResponse:
    events = (await db.execute(select(ListingEvent))).scalars().all()
    items = [Item(title=f"{event.from_value} -> {event.to_value}") for event in events]

    return RSSResponse(
        RSSFeed(
            title="Shopkeeper", description="", link=str(request.base_url), item=items
        )
    )


__all__ = ["feed_router"]
