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
}) {
  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const gstinTrimmed = (data.gstin || "").trim().toUpperCase();
  const isGstinInvalid = gstinTrimmed.length > 0 && !GSTIN_REGEX.test(gstinTrimmed);

  const handleGstinChange = (val) => {
    const clean = val.toUpperCase().replace(/\s/g, "");
    onChange("gstin", clean);
    // If user enters a 15-char GSTIN, auto-select state code if available
    if (clean.length >= 2) {
      const code = clean.substring(0, 2);
      if (stateOptions.some((s) => s.code === code)) {
        onChange("stateCode", code);
      }
    }
  };

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
    if (isGstinInvalid) {
      alert(`GSTIN "${gstinTrimmed}" is invalid. Please enter a valid 15-character GSTIN (e.g. 33AABCG1234F1Z5) or leave blank if unregistered.`);
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
              GSTIN / UIN
            </label>
            <input
              type="text"
              maxLength={15}
              placeholder="e.g. 33AABCG1234F1Z5"
              value={data.gstin || ""}
              onChange={(e) => handleGstinChange(e.target.value)}
              className="inv-input"
              style={{
                textTransform: "uppercase",
                borderColor: isGstinInvalid ? "#ef4444" : undefined,
              }}
            />
            {isGstinInvalid && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
                GSTIN must be 15 characters (e.g. 33AABCT0000A1Z5) or blank.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="inv-form-actions"
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
        <button type="submit" className="inv-btn-primary">
          Next →
        </button>
      </div>
    </form>
  );
}
