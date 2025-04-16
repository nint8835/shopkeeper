from datetime import datetime, timezone
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


def stringify_diff_value(value: Optional[str]) -> str:
    if value is None or value == "":
        return "`(empty)`"

    return f"`{value}`"


class ListingEvent(Base):
    __tablename__ = "listing_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[EventType]
    from_value: Mapped[Optional[str]]
    to_value: Mapped[Optional[str]]
    time: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(tz=timezone.utc)
    )

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    listing: Mapped["Listing"] = relationship(back_populates="events")

    @property
    def title(self) -> str:
        match self.type:
            case EventType.ListingCreated:
                return f"New Listing: {self.to_value}"
            case EventType.TitleChanged:
                return f"{self.listing.title}: Title Changed"
            case EventType.DescriptionChanged:
                return f"{self.listing.title}: Description Changed"
            case EventType.PriceChanged:
                return f"{self.listing.title}: Price Changed"
            case EventType.StatusChanged:
                return f"{self.listing.title}: Status Changed"

    @property
    def description(self) -> str:
        match self.type:
            case EventType.ListingCreated:
                return "Listing created"
            case EventType.TitleChanged:
                return f"Title changed from {stringify_diff_value(self.from_value)} to {stringify_diff_value(self.to_value)}"
            case EventType.DescriptionChanged:
                return f"Description changed from {stringify_diff_value(self.from_value)} to {stringify_diff_value(self.to_value)}"
            case EventType.PriceChanged:
                return f"Price changed from {stringify_diff_value(self.from_value)} to {stringify_diff_value(self.to_value)}"
            case EventType.StatusChanged:
                return f"Status changed from {stringify_diff_value(self.from_value)} to {stringify_diff_value(self.to_value)}"


__all__ = ["ListingEvent"]
