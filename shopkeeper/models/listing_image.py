from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shopkeeper.db import Base

if TYPE_CHECKING:
    from .listing import Listing


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str]

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    listing: Mapped["Listing"] = relationship(back_populates="images")
