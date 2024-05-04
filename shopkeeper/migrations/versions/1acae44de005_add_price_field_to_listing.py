"""Add price field to listing

Revision ID: 1acae44de005
Revises: d280c2602978
Create Date: 2024-05-04 10:57:44.245704

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1acae44de005"
down_revision: Union[str, None] = "d280c2602978"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("listings", sa.Column("price", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("listings", "price")
