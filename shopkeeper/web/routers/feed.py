from fastapi import APIRouter, Depends, Request
from fastapi_rss import GUID, Item, RSSFeed, RSSResponse  # type: ignore
from markdown import markdown
from sqlalchemy import not_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from shopkeeper.models.listing import Listing
from shopkeeper.models.listing_event import ListingEvent
from shopkeeper.web.dependencies.database import get_db

feed_router = APIRouter(tags=["Feed"], include_in_schema=False)


# TODO: Add auth
@feed_router.get("/")
async def get_feed(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> RSSResponse:
    events = (
        (
            await db.execute(
                select(ListingEvent)
                .options(joinedload(ListingEvent.listing))
                .join(Listing)
                .filter(not_(Listing.is_hidden))
            )
        )
        .scalars()
        .all()
    )
    items = [
        Item(
            guid=GUID(content=str(event.id)),
            title=event.title,
            description=markdown(event.description),
            pub_date=event.time,
        )
        for event in events
    ]

    return RSSResponse(
        RSSFeed(
            title="Shopkeeper",
            description="Listing events for Shopkeeper",
            link=str(request.base_url),
            item=items,
        )
    )


__all__ = ["feed_router"]
