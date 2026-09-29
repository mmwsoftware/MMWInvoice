import React from "react";

const stateOptions = [
  { code: "33", name: "33 - Tamil Nadu" },
  { code: "29", name: "29 - Karnataka" },
  { code: "32", name: "32 - Kerala" },
  { code: "36", name: "36 - Telangana" },
  { code: "37", name: "37 - Andhra Pradesh" },
  { code: "27", name: "27 - Maharashtra" },
  { code: "07", name: "07 - Delhi" },
  { code: "24", name: "24 - Gujarat" },
  { code: "09", name: "09 - Uttar Pradesh" },
  { code: "19", name: "19 - West Bengal" },
];

export default function CustomerDetails({
  data,
  onChange,
  onNext,
  onSaveDraft,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.customerName?.trim()) {
      alert("Please enter Customer / Participant Name");
      return;
    }
    if (!data.address?.trim()) {
      alert("Please enter Address");
      return;
    }
    if (!data.gstin?.trim()) {
      alert("Please enter GSTIN / UIN");
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
        Customer Details
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Customer Name */}
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
            Customer / Participant Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Gainwell Commosales Pvt Ltd"
            value={data.customerName || ""}
            onChange={(e) => onChange("customerName", e.target.value)}
            className="inv-input"
          />
        </div>

        {/* Address */}
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
            Address <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="No. 12, Industrial Estate, Chennai - 600 058 Tamil Nadu, India"
            value={data.address || ""}
            onChange={(e) => onChange("address", e.target.value)}
            className="inv-input"
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* State Code & GSTIN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
          className="inv-grid-2"
        >
          {/* State Code */}
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
              State Code <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={data.stateCode || "33"}
              onChange={(e) => onChange("stateCode", e.target.value)}
              className="inv-input inv-select"
            >
              {stateOptions.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* GSTIN / UIN */}
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
              GSTIN / UIN <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 33AABCG1234F1Z5"
              value={data.gstin || ""}
              onChange={(e) => onChange("gstin", e.target.value.toUpperCase())}
              className="inv-input"
              style={{ textTransform: "uppercase" }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
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
          className="inv-btn-secondary"
        >
          Save Draft
        </button>
        <button type="submit" className="inv-btn-primary">
          Next →
        </button>
      </div>
    </form>
  );
}
