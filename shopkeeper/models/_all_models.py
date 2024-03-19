# ruff: noqa: F401

# Utility file to ensure all models are imported for Alembic auto-generation.
# Should not be imported outside of shopkeeper.migrations.env

from .listing import Listing  # type: ignore
