from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, not_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from shopkeeper.config import config
from shopkeeper.models.listing import Listing, ListingStatus
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

    if filters.types is not None:
        listings_query = listings_query.filter(Listing.type.in_(filters.types))

    if filters.has_issues is not None:
        listings_query = listings_query.filter(
            Listing.get_issues_clause() == filters.has_issues
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


@listings_router.post("/{listing_id}/hide", status_code=202)
async def hide_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    user: DiscordUser = Depends(require_discord_user),
) -> None:
    """Hide a listing. This route requires you to be the owner of the bot."""
    if user.id != str(config.owner_id):
        raise HTTPException(403, "You do not have permission to hide listings.")

    listing = (
        await db.execute(select(Listing).filter_by(id=listing_id, is_hidden=False))
    ).scalar_one_or_none()

    if not listing:
        raise HTTPException(404, "Listing not found.")

    listing.is_hidden = True
    await db.commit()

    return None


@listings_router.get("/issue-count")
async def get_user_issue_count(
    db: AsyncSession = Depends(get_db),
    user: DiscordUser = Depends(require_discord_user),
) -> int:
    """Retrieve a count of the number of listings owned by the user with issues needing resolution."""
    return (
        await db.execute(
            select(func.count("*"))
            .select_from(Listing)
            .filter(
                and_(
                    Listing.status != ListingStatus.Closed,
                    not_(Listing.is_hidden),
                    Listing.owner_id == int(user.id),
                    Listing.get_issues_clause(),
                )
            )
        )
    ).scalar_one()


__all__ = ["listings_router"]
