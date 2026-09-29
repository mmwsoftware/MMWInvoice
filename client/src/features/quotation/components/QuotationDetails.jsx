import React from "react";

export default function QuotationDetails({
  data,
  onChange,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.quoteNo?.trim()) {
      alert("Please enter Quote No.");
      return;
    }
    if (!data.quoteDate) {
      alert("Please select Quotation Date");
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
        Quotation Details
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Row 1: Quote No & Date */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
          className="quot-grid-2"
        >
          {/* Quote No */}
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
              Quote No. <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MAX/2026/Q001"
              value={data.quoteNo || ""}
              onChange={(e) => onChange("quoteNo", e.target.value)}
              className="quot-input"
            />
          </div>

          {/* Quotation Date */}
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
              Quotation Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              required
              value={data.quoteDate || ""}
              onChange={(e) => onChange("quoteDate", e.target.value)}
              className="quot-input"
            />
          </div>
        </div>

        {/* Section: Client Details */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Client Details
            </h4>
            <span style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>
              Auto-filled from previous step
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Company Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Company Name
              </label>
              <input
                type="text"
                placeholder="Client Company Name"
                value={data.companyName || ""}
                onChange={(e) => onChange("companyName", e.target.value)}
                className="quot-input"
              />
            </div>

            {/* Address */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Address
              </label>
              <textarea
                rows={2}
                placeholder="Client Address"
                value={data.address || ""}
                onChange={(e) => onChange("address", e.target.value)}
                className="quot-input"
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* GSTIN */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                GSTIN / UIN
              </label>
              <input
                type="text"
                placeholder="e.g. 33AABCR1234F1Z8"
                value={data.gstin || ""}
                onChange={(e) => onChange("gstin", e.target.value.toUpperCase())}
                className="quot-input"
                style={{ textTransform: "uppercase" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="quot-form-actions"
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
          className="quot-btn-back"
        >
          ← Back
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            className="quot-btn-secondary"
          >
            Save Draft
          </button>
          <button type="submit" className="quot-btn-primary">
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
