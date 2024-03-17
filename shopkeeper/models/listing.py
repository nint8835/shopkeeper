from sqlalchemy.orm import Mapped, mapped_column

from shopkeeper.db import Base


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
