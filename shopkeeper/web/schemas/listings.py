from pydantic import BaseModel, ConfigDict, Field

from shopkeeper.models.listing import ListingStatus, ListingType


class ListingImageSchema(BaseModel):
    id: int
    width: int
    height: int
    url: str
    thumbnail_url: str


class ListingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, coerce_numbers_to_str=True)

    id: int
    title: str
    description: str
    price: str
    type: ListingType
    status: ListingStatus
    url: str
    owner_id: str


class FullListingSchema(ListingSchema):
    images: list[ListingImageSchema]


class SearchListingsSchema(BaseModel):
    statuses: list[ListingStatus] | None = None
    owners: list[str] | None = None


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
