"""Add full quotation subject text field."""
from alembic import op
import sqlalchemy as sa

revision = "0003_full_quotation_subject"
down_revision = "0002_quotation_subject"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("quotations", sa.Column("subject", sa.String(length=500), nullable=True))

def downgrade() -> None:
    op.drop_column("quotations", "subject")
