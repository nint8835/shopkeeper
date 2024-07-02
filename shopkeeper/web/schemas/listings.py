from pydantic import BaseModel, ConfigDict, Field

from shopkeeper.models.listing import ListingStatus, ListingType


class ListingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, coerce_numbers_to_str=True)

    id: int
    title: str
    description: str | None
    price: str | None
    type: ListingType
    status: ListingStatus
    url: str
    owner_id: str


class CreateListingSchema(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=0)
    price: str = Field(min_length=0)
    type: ListingType


class EditListingSchema(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=0)
    price: str = Field(min_length=0)
    status: ListingStatus
