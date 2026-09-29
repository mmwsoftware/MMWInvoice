import React from "react";

export default function LetterDetails({
  data,
  onChange,
  onNext,
  onSaveDraft,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.companyName?.trim()) {
      alert("Please enter Client / Company Name");
      return;
    }
    if (!data.address?.trim()) {
      alert("Please enter Client Address");
      return;
    }
    if (!data.subject?.trim()) {
      alert("Please enter Subject");
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
        Letter Details
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
        className="quot-grid-2"
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Client / Company Name */}
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
              Client / Company Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ABC Industries Pvt Ltd"
              value={data.companyName || ""}
              onChange={(e) => onChange("companyName", e.target.value)}
              className="quot-input"
            />
          </div>

          {/* Date */}
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
              Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              required
              value={data.date || ""}
              onChange={(e) => onChange("date", e.target.value)}
              className="quot-input"
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Client Address */}
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
              Client Address <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Plot No. 45, Industrial Area, Coimbatore - 641 021, Tamil Nadu, India"
              value={data.address || ""}
              onChange={(e) => onChange("address", e.target.value)}
              className="quot-input"
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Subject */}
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
              Subject <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quotation for Supply of DG Set"
              value={data.subject || ""}
              onChange={(e) => onChange("subject", e.target.value)}
              className="quot-input"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="quot-form-actions"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
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
    </form>
  );
}
