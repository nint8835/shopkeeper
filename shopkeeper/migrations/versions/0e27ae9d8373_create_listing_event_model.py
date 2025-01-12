"""Create listing event model

Revision ID: 0e27ae9d8373
Revises: 058dd12f0004
Create Date: 2025-01-12 17:51:18.578727

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0e27ae9d8373"
down_revision: Union[str, None] = "058dd12f0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "listing_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "type",
            sa.Enum(
                "ListingCreated",
                "TitleChanged",
                "DescriptionChanged",
                "PriceChanged",
                "StatusChanged",
                name="eventtype",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("from_value", sa.String(), nullable=True),
        sa.Column("to_value", sa.String(), nullable=True),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["listing_id"],
            ["listings.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("listing_events")
