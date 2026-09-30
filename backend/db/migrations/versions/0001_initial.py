"""Initial MMW document system schema."""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address_lines", sa.JSON(), nullable=False),
        sa.Column("page9_address_lines", sa.JSON(), nullable=True),
        sa.Column("state_code", sa.String(2), nullable=True),
        sa.Column("gstin", sa.String(15), nullable=True),
        sa.Column("contact_person", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "number_counters",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("doc_type", sa.String(20), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("last_number", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("doc_type", "year", name="uq_number_counter_type_year"),
    )
    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("invoice_number", sa.String(20), nullable=True, unique=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("invoice_date", sa.String(20), nullable=False),
        sa.Column("po_number", sa.String(100)),
        sa.Column("po_date", sa.String(20)),
        sa.Column("engineer_name", sa.String(255)),
        sa.Column("engineer_email", sa.String(255)),
        sa.Column("engineer_contact", sa.String(50)),
        sa.Column("copy_type", sa.String(20), nullable=False, server_default="original"),
        sa.Column("gst_rate", sa.Float(), nullable=False, server_default="18"),
        sa.Column("subtotal", sa.Numeric(12,2)),
        sa.Column("tax_amount", sa.Numeric(12,2)),
        sa.Column("total_amount", sa.Numeric(12,2)),
        sa.Column("amount_words", sa.String(500)),
        sa.Column("public_token", sa.String(64), unique=True),
        sa.Column("private_pdf_path", sa.String(500)),
        sa.Column("public_pdf_path", sa.String(500)),
        sa.Column("private_pdf_sha256", sa.String(64)),
        sa.Column("public_pdf_sha256", sa.String(64)),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("issued_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "invoice_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("serial_number", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("hsn", sa.String(20)),
        sa.Column("qty", sa.Float(), nullable=False),
        sa.Column("uom", sa.String(20), nullable=False, server_default="Nos."),
        sa.Column("rate", sa.Numeric(12,2), nullable=False),
        sa.Column("amount", sa.Numeric(12,2), nullable=False),
    )
    op.create_table(
        "quotations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quotation_number", sa.String(20), nullable=True, unique=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("quotation_date", sa.Date(), nullable=False),
        sa.Column("subject_dg_kva", sa.String(20)),
        sa.Column("subject_dg_qty", sa.Integer()),
        sa.Column("subtotal", sa.Numeric(12,2)),
        sa.Column("total_amount", sa.Numeric(12,2)),
        sa.Column("amount_words", sa.String(500)),
        sa.Column("pdf_path", sa.String(500)),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("issued_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "quotation_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quotation_id", sa.Integer(), sa.ForeignKey("quotations.id"), nullable=False),
        sa.Column("serial_number", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("hsn", sa.String(20)),
        sa.Column("qty", sa.Float(), nullable=False),
        sa.Column("uom", sa.String(20), nullable=False, server_default="Nos"),
        sa.Column("rate", sa.Numeric(12,2), nullable=False),
        sa.Column("amount", sa.Numeric(12,2), nullable=False),
    )
    op.create_table(
        "public_links",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("access_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_accessed_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_public_links_token", "public_links", ["token"], unique=True)
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("details", sa.JSON()),
        sa.Column("performed_by", sa.String(100)),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_index("ix_public_links_token", table_name="public_links")
    op.drop_table("public_links")
    op.drop_table("quotation_items")
    op.drop_table("quotations")
    op.drop_table("invoice_items")
    op.drop_table("invoices")
    op.drop_table("number_counters")
    op.drop_table("customers")
