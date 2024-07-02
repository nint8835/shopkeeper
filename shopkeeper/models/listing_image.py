import uuid
from pathlib import Path
from typing import TYPE_CHECKING

import discord
from sqlalchemy import ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shopkeeper.config import config
from shopkeeper.db import Base

if TYPE_CHECKING:
    from .listing import Listing

PERMITTED_FILE_TYPES = [".png", ".jpg", ".jpeg"]


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str]

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    listing: Mapped["Listing"] = relationship(back_populates="images")

    @property
    def url(self) -> str:
        # TODO: See if I can make this less fragile
        return f"/images/{self.id}"

    @classmethod
    async def from_attachment(
        cls, *, listing_id: int, attachment: discord.Attachment, session: AsyncSession
    ) -> "ListingImage | None":
        attachment_extension = Path(attachment.filename).suffix

        if attachment_extension not in PERMITTED_FILE_TYPES:
            return None

        listing_image_prefix = config.image_path / str(listing_id)
        listing_image_prefix.mkdir(parents=True, exist_ok=True)

        image_path = Path(str(listing_id)) / (str(uuid.uuid4()) + attachment_extension)
        file_path = config.image_path / image_path

        with open(file_path, "wb") as f:
            await attachment.save(f)

        instance = ListingImage(listing_id=listing_id, path=str(image_path))
        session.add(instance)

        return instance
