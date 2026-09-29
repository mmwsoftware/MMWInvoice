import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { numberToIndianWords } from "../utils/numberToWords";

export default function InvoiceReview({
  customerData,
  invoiceData,
  products,
  onPrev,
  onSaveDraft,
}) {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const subTotal = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const isInterState = customerData.stateCode !== "33";
  const taxRate = 0.18;
  const totalTax = subTotal * taxRate;
  const grandTotal = Math.round(subTotal + totalTax);
  const amountInWords = numberToIndianWords(grandTotal);

  const handleGenerate = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate("/dashboard/history");
    }, 1800);
  };

  return (
    <div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "24px",
        }}
      >
        Review Tax Invoice
      </h3>

      {/* 2-Column Summary: Customer & Invoice Details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
        className="inv-grid-2"
      >
        {/* Customer Box */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "18px 20px",
            backgroundColor: "#f8fafc",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              marginBottom: "8px",
            }}
          >
            Bill To (Customer)
          </p>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 6px 0",
            }}
          >
            {customerData.customerName || "—"}
          </h4>
          <p
            style={{
              fontSize: "13px",
              color: "#475569",
              margin: "0 0 6px 0",
              whiteSpace: "pre-line",
            }}
          >
            {customerData.address || "—"}
          </p>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
            <span>State: <strong>{customerData.stateCode}</strong></span>
            <span style={{ margin: "0 8px" }}>•</span>
            <span>GSTIN: <strong>{customerData.gstin || "—"}</strong></span>
          </div>
        </div>

        {/* Invoice Info Box */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "18px 20px",
            backgroundColor: "#f8fafc",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              marginBottom: "8px",
            }}
          >
            Invoice Information
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#64748b" }}>Invoice No:</span>
              <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>
                {invoiceData.invoiceNo || "—"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#64748b" }}>Date:</span>
              <strong style={{ color: "#0f172a" }}>
                {invoiceData.invoiceDate || "—"}
              </strong>
            </div>
            {invoiceData.poNo && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>PO / WO No:</span>
                <strong style={{ color: "#0f172a" }}>{invoiceData.poNo}</strong>
              </div>
            )}
            {invoiceData.poDate && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>PO Date:</span>
                <strong style={{ color: "#0f172a" }}>{invoiceData.poDate}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table Summary */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th className="rev-th" style={{ width: "50px", textAlign: "center" }}>S.No</th>
              <th className="rev-th">Description</th>
              <th className="rev-th">HSN</th>
              <th className="rev-th" style={{ textAlign: "center" }}>Qty</th>
              <th className="rev-th" style={{ textAlign: "right" }}>Rate (₹)</th>
              <th className="rev-th" style={{ textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, idx) => {
              const qty = parseFloat(item.quantity) || 0;
              const rate = parseFloat(item.rate) || 0;
              const itemTotal = qty * rate;

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < products.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td className="rev-td" style={{ textAlign: "center", color: "#64748b" }}>
                    {idx + 1}
                  </td>
                  <td className="rev-td" style={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.description}
                  </td>
                  <td className="rev-td font-mono" style={{ color: "#64748b" }}>
                    {item.hsn || "—"}
                  </td>
                  <td className="rev-td" style={{ textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td className="rev-td" style={{ textAlign: "right" }}>
                    {rate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="rev-td" style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                    {itemTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Box */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <div style={{ width: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "14px", color: "#64748b" }}>
            <span>Sub Total:</span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>
              ₹{subTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          {isInterState ? (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "14px", color: "#64748b" }}>
              <span>IGST (18%):</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>
                ₹{totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "14px", color: "#64748b" }}>
                <span>CGST (9%):</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  ₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "14px", color: "#64748b" }}>
                <span>SGST (9%):</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  ₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid #e2e8f0",
              paddingTop: "8px",
              marginTop: "4px",
              fontSize: "17px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <span>Total:</span>
            <span>₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div
        style={{
          padding: "14px 20px",
          borderRadius: "12px",
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          marginBottom: "28px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1d4ed8", marginRight: "10px" }}>
          Amount in Words:
        </span>
        <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
          {amountInWords}
        </span>
      </div>

      {/* Success Notification */}
      {success && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 20px",
            borderRadius: "12px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 600,
            fontSize: "14px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <span>✓</span> Tax Invoice generated successfully! Redirecting to History...
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          className="inv-btn-back"
        >
          ← Edit Details
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inv-btn-secondary"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={success}
            className="inv-btn-generate"
          >
            {success ? "Generating..." : "Generate Invoice ✓"}
          </button>
        </div>
      </div>

      <style>{`
        .rev-th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }
        .rev-td {
          padding: 12px 16px;
          font-size: 13px;
        }
        .inv-btn-generate {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #059669, #047857);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }
        .inv-btn-generate:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
        }
      `}</style>
    </div>
  );
}
