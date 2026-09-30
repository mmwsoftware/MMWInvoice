"""Add quotation page-2 subject fields."""
from alembic import op
import sqlalchemy as sa

revision = "0002_quotation_subject"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Columns already exist in the ORM/initial schema for fresh installs; this
    # migration is kept as a no-op compatibility marker for existing databases.
    pass

def downgrade() -> None:
    pass
