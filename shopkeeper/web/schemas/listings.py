from pydantic import BaseModel, ConfigDict

from shopkeeper.models.listing import ListingStatus, ListingType


class ListingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    price: str | None
    type: ListingType
    status: ListingStatus
