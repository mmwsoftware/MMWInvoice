import React, { useState, useEffect } from "react";
import { invoicesApi } from "../../../services/api";

export default function InvoiceDetails({
  data,
  onChange,
  onNext,
  onPrev,
}) {
  const [numberStatus, setNumberStatus] = useState({
    checking: false,
    available: true,
    message: "",
  });

  useEffect(() => {
    const rawNo = (data.invoiceNo || "").trim();
    if (!rawNo) {
      setNumberStatus({ checking: false, available: true, message: "" });
      return;
    }

    let isCancelled = false;
    setNumberStatus((prev) => ({ ...prev, checking: true }));

    const timer = setTimeout(async () => {
      try {
        const res = await invoicesApi.checkNumber(rawNo);
        if (!isCancelled) {
          if (!res.available) {
            setNumberStatus({
              checking: false,
              available: false,
              message: `Invoice number "${rawNo}" is already in use. Please enter a unique number.`,
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
  }, [data.invoiceNo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.invoiceNo?.trim()) {
      alert("Please enter Tax Invoice No.");
      return;
    }
    if (!numberStatus.available) {
      alert(numberStatus.message || "Invoice number is already in use. Please choose a unique number.");
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
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                placeholder="Auto-generated (e.g. MAX/2026/0001)"
                value={data.invoiceNo || ""}
                onChange={(e) => onChange("invoiceNo", e.target.value)}
                className="inv-input"
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
            ) : data.invoiceNo?.trim() ? (
              <p style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", margin: "4px 0 0 0" }}>
                ✓ {numberStatus.message || "Number is available"}
              </p>
            ) : (
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", margin: "4px 0 0 0" }}>
                Auto-assigned from backend. You can edit this number.
              </p>
            )}
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
        className="inv-form-actions"
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
          <button type="submit" className="inv-btn-primary">
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
