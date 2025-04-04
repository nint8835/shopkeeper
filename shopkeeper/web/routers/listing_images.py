from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image
from PIL.Image import Resampling
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shopkeeper.config import config
from shopkeeper.models.listing_image import ListingImage
from shopkeeper.web.dependencies.auth import require_discord_user
from shopkeeper.web.dependencies.database import get_db
from shopkeeper.web.schemas.discord_user import DiscordUser

listing_images_router = APIRouter(
    tags=["Listing Images"], dependencies=[Depends(require_discord_user)]
)


@listing_images_router.get("/{image_id}", include_in_schema=False)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    """Retrieve a listing image."""

    image = (
        await db.execute(select(ListingImage).filter_by(id=image_id, is_hidden=False))
    ).scalar_one_or_none()

    if not image:
        raise HTTPException(404, "Image not found.")

    return FileResponse(
        config.image_path / image.path,
        headers={"Cache-Control": "private, max-age=31536000"},
    )


@listing_images_router.get("/{image_id}/thumbnail", include_in_schema=False)
async def get_image_thumbnail(image_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    """Retrieve a listing image thumbnail."""

    image = (
        await db.execute(select(ListingImage).filter_by(id=image_id, is_hidden=False))
    ).scalar_one_or_none()

    if not image:
        raise HTTPException(404, "Image not found.")

    with Image.open(config.image_path / image.path) as img:
        img.thumbnail((350, 350), Resampling.LANCZOS)
        img_bytes = BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)

    return StreamingResponse(
        img_bytes,
        media_type="image/png",
        headers={"Cache-Control": "private, max-age=31536000"},
    )


@listing_images_router.post("/{image_id}/hide", status_code=202)
async def hide_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    user: DiscordUser = Depends(require_discord_user),
) -> Any:
    """Hide a listing image. This route requires you to be the owner of the bot."""
    if user.id != str(config.owner_id):
        raise HTTPException(403, "You do not have permission to hide images.")

    image = (
        await db.execute(select(ListingImage).filter_by(id=image_id, is_hidden=False))
    ).scalar_one_or_none()

    if not image:
        raise HTTPException(404, "Image not found.")

    image.is_hidden = True
    await db.commit()

    return None


__all__ = ["listing_images_router"]
