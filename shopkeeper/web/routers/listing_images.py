from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shopkeeper.config import config
from shopkeeper.models.listing_image import ListingImage
from shopkeeper.web.dependencies.auth import require_discord_user
from shopkeeper.web.dependencies.database import get_db

listing_images_router = APIRouter(
    tags=["Listing Images"], dependencies=[Depends(require_discord_user)]
)


@listing_images_router.get("/{image_id}", include_in_schema=False)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    """Retrieve a listing image."""

    image = (
        await db.execute(select(ListingImage).filter_by(id=image_id))
    ).scalar_one_or_none()

    if not image:
        raise HTTPException(404, "Image not found.")

    return FileResponse(config.image_path / image.path)


__all__ = ["listing_images_router"]
