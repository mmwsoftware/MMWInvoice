"""Add authentication sessions for server-side logout."""
from alembic import op
import sqlalchemy as sa

revision = "0004_auth_sessions"
down_revision = "0003_full_quotation_subject"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("session_id", sa.String(length=64), nullable=False, unique=True),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_auth_sessions_session_id",
        "auth_sessions",
        ["session_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_auth_sessions_session_id",
        table_name="auth_sessions",
    )
    op.drop_table("auth_sessions")