"""Create listing model

Revision ID: 218dc344cc2d
Revises:
Create Date: 2024-03-17 19:13:01.423027

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "218dc344cc2d"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "listings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "type",
            sa.Enum("BUY", "SELL", name="listingtype", native_enum=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "OPEN", "PENDING", "CLOSED", name="listingstatus", native_enum=False
            ),
            nullable=False,
        ),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("message_id", sa.String(), nullable=False),
        sa.Column("thread_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("listings")
