from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from shopkeeper.models.listing import Listing
from shopkeeper.web.dependencies.auth import require_discord_user
from shopkeeper.web.dependencies.database import get_db
from shopkeeper.web.schemas.discord_user import DiscordUser
from shopkeeper.web.schemas.listings import (
    CreateListingSchema,
    EditListingSchema,
    FullListingSchema,
    ListingSchema,
    SearchListingsSchema,
)

listings_router = APIRouter(
    tags=["Listings"], dependencies=[Depends(require_discord_user)]
)


@listings_router.post("/search", response_model=list[FullListingSchema])
async def get_listings(
    filters: SearchListingsSchema,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve a list of listings."""
    listings_query = (
        select(Listing).options(joinedload(Listing.images)).filter_by(is_hidden=False)
    )

    if filters.statuses is not None:
        listings_query = listings_query.filter(Listing.status.in_(filters.statuses))

    if filters.owners is not None:
        listings_query = listings_query.filter(
            Listing.owner_id.in_([int(owner) for owner in filters.owners])
        )

    return (await db.execute(listings_query)).unique().scalars().all()


@listings_router.post("/", response_model=ListingSchema)
async def create_listing(
    listing: CreateListingSchema,
    db: AsyncSession = Depends(get_db),
    user: DiscordUser = Depends(require_discord_user),
) -> Listing:
    """Create a new listing."""
    new_listing = await Listing.create(
        type=listing.type,
        title=listing.title,
        description=listing.description,
        price=listing.price,
        owner_id=int(user.id),
        session=db,
    )

    return new_listing


@listings_router.patch("/{listing_id}", response_model=ListingSchema)
async def edit_listing(
    listing_id: int,
    listing: EditListingSchema,
    db: AsyncSession = Depends(get_db),
    user: DiscordUser = Depends(require_discord_user),
) -> Listing:
    """Edit an existing listing."""
    return await Listing.edit(
        listing=listing_id,
        user_id=int(user.id),
        title=listing.title,
        description=listing.description,
        price=listing.price,
        status=listing.status,
        session=db,
    )


__all__ = ["listings_router"]
