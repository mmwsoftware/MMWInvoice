import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { numberToIndianWords } from "../utils/numberToWords";

export default function InvoiceReview({
  customerData,
  invoiceData,
  products,
  onPrev,
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

      {/* Products Table Summary (Desktop >= 768px) */}
      <div
        className="rev-desktop-table"
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          marginBottom: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
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

      {/* Mobile Products Review Cards (< 768px) */}
      <div className="rev-mobile-cards">
        {products.map((item, idx) => {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const itemTotal = qty * rate;

          return (
            <div key={idx} className="rev-item-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <span className="rev-item-badge">Item #{idx + 1}</span>
                  <h5 style={{ margin: "6px 0 0 0", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {item.description}
                  </h5>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Amount</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#059669" }}>
                    ₹{itemTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                <span>HSN: <strong style={{ color: "#334155" }}>{item.hsn || "—"}</strong></span>
                <span>Qty: <strong style={{ color: "#334155" }}>{item.quantity}</strong></span>
                <span>Rate: <strong style={{ color: "#334155" }}>₹{rate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals Box */}
      <div
        className="rev-calc-container"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <div className="rev-calc-box" style={{ width: "280px" }}>
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
        className="rev-actions-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          className="inv-btn-back"
        >
          ← Edit Details
        </button>

        <div className="rev-btn-group" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/invoice/preview", {
                state: { customerData, invoiceData, products },
              })
            }
            className="inv-btn-preview-link"
          >
            <svg style={{ height: "16px", width: "16px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Preview PDF
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
        .rev-desktop-table {
          display: block;
        }
        .rev-mobile-cards {
          display: none;
        }
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
        .rev-item-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background-color: #f8fafc;
        }
        .rev-item-badge {
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
        }
        .inv-btn-preview-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          font-size: 13.5px;
          font-weight: 600;
          color: #2563eb;
          background-color: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .inv-btn-preview-link:hover {
          background-color: #dbeafe;
          border-color: #93c5fd;
        }
        .inv-btn-generate {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
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

        @media (max-width: 767px) {
          .rev-desktop-table {
            display: none !important;
          }
          .rev-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }
          .rev-calc-container {
            justify-content: stretch !important;
          }
          .rev-calc-box {
            width: 100% !important;
          }
          .rev-actions-bar {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .rev-btn-group {
            flex-direction: column !important;
            width: 100% !important;
          }
          .rev-btn-group button,
          .rev-actions-bar > button {
            width: 100% !important;
            justify-content: center !important;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
