import React, { useState, useEffect } from "react";
import { quotationsApi } from "../../../services/api";

export default function QuotationDetails({
  data,
  onChange,
  onNext,
  onPrev,
}) {
  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const gstinTrimmed = (data.gstin || "").trim().toUpperCase();
  const isGstinInvalid = gstinTrimmed.length > 0 && !GSTIN_REGEX.test(gstinTrimmed);

  const [numberStatus, setNumberStatus] = useState({
    checking: false,
    available: true,
    message: "",
  });

  useEffect(() => {
    const rawNo = (data.quoteNo || "").trim();
    if (!rawNo) {
      setNumberStatus({ checking: false, available: true, message: "" });
      return;
    }

    let isCancelled = false;
    setNumberStatus((prev) => ({ ...prev, checking: true }));

    const timer = setTimeout(async () => {
      try {
        const res = await quotationsApi.checkNumber(rawNo);
        if (!isCancelled) {
          if (!res.available) {
            setNumberStatus({
              checking: false,
              available: false,
              message: `Quote number "${rawNo}" is already used. Please enter a unique number.`,
            });
          } else {
            setNumberStatus({
              checking: false,
              available: true,
              message: "Number is unique & available",
            });
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setNumberStatus({ checking: false, available: true, message: "" });
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [data.quoteNo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.quoteDate) {
      alert("Please select Quotation Date");
      return;
    }
    if (!numberStatus.available) {
      alert(numberStatus.message || "Quotation number is already in use. Please enter a unique number.");
      return;
    }
    if (isGstinInvalid) {
      alert(`GSTIN "${gstinTrimmed}" is invalid. Please enter a valid 15-character GSTIN (e.g. 33AABCT0000A1Z5), or leave it empty if the client has no GSTIN.`);
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
              Quote No.
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Auto-generated (e.g. MAX/2026/0003)"
                value={data.quoteNo || ""}
                onChange={(e) => onChange("quoteNo", e.target.value)}
                className="quot-input"
                style={{
                  borderColor: !numberStatus.available ? "#ef4444" : undefined,
                  paddingRight: numberStatus.checking ? "80px" : undefined,
                }}
              />
              {numberStatus.checking && (
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  Checking...
                </span>
              )}
            </div>
            {!numberStatus.available ? (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
                ⚠️ {numberStatus.message}
              </p>
            ) : data.quoteNo?.trim() ? (
              <p style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", margin: "4px 0 0 0" }}>
                ✓ {numberStatus.message || "Number is available"}
              </p>
            ) : (
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", margin: "4px 0 0 0" }}>
                Auto-assigned from backend. You can edit this number.
              </p>
            )}
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
                maxLength={15}
                placeholder="e.g. 33AABCT0000A1Z5 (optional, leave blank if none)"
                value={data.gstin || ""}
                onChange={(e) => onChange("gstin", e.target.value.toUpperCase().replace(/\s/g, ""))}
                className="quot-input"
                style={{
                  textTransform: "uppercase",
                  borderColor: isGstinInvalid ? "#ef4444" : undefined,
                }}
              />
              {isGstinInvalid && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
                  GSTIN must be 15 characters (e.g. 33AABCT0000A1Z5) or leave blank if unregistered.
                </p>
              )}
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
          <button type="submit" className="quot-btn-primary">
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
