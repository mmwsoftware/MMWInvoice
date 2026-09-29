import React from "react";

export default function InvoiceDetails({
  data,
  onChange,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.invoiceNo?.trim()) {
      alert("Please enter Tax Invoice No.");
      return;
    }
    if (!data.invoiceDate) {
      alert("Please select Invoice Date");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "24px",
        }}
      >
        Invoice Details
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Row 1: Invoice No & Date */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
          className="inv-grid-2"
        >
          {/* Tax Invoice No */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Tax Invoice No. <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MAX/2026/0074"
              value={data.invoiceNo || ""}
              onChange={(e) => onChange("invoiceNo", e.target.value)}
              className="inv-input"
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Invoice Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              required
              value={data.invoiceDate || ""}
              onChange={(e) => onChange("invoiceDate", e.target.value)}
              className="inv-input"
            />
          </div>
        </div>

        {/* Row 2: PO / WO No & PO Date */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
          className="inv-grid-2"
        >
          {/* PO / WO No */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Your PO / WO No.
            </label>
            <input
              type="text"
              placeholder="e.g. PO-88492"
              value={data.poNo || ""}
              onChange={(e) => onChange("poNo", e.target.value)}
              className="inv-input"
            />
          </div>

          {/* PO Date */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              PO Date
            </label>
            <input
              type="date"
              value={data.poDate || ""}
              onChange={(e) => onChange("poDate", e.target.value)}
              className="inv-input"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          className="inv-btn-back"
        >
          ← Back
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inv-btn-secondary"
          >
            Save Draft
          </button>
          <button type="submit" className="inv-btn-primary">
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
