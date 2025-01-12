from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shopkeeper.db import Base

if TYPE_CHECKING:
    from .listing import Listing


class EventType(Enum):
    ListingCreated = "listing_created"
    TitleChanged = "title_changed"
    DescriptionChanged = "description_changed"
    PriceChanged = "price_changed"
    StatusChanged = "status_changed"


class ListingEvent(Base):
    __tablename__ = "listing_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[EventType]
    from_value: Mapped[Optional[str]]
    to_value: Mapped[Optional[str]]

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    listing: Mapped["Listing"] = relationship(back_populates="events")


__all__ = ["ListingEvent"]
