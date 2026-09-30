import React from "react";
import { useNavigate } from "react-router-dom";
import { invoicesApi } from "../../../services/api";

export default function InvoiceGeneratedSuccess({
  invoice,
  customerData,
  invoiceData,
  grandTotal,
  onViewPDF,
}) {
  const navigate = useNavigate();

  const invoiceNo = invoice?.invoice_number || invoiceData?.invoiceNo || "MAX/2026/0001";
  const customerName = invoice?.customer?.name || customerData?.customerName || "Customer";
  const totalAmount = invoice?.total_amount
    ? Number(invoice.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : grandTotal
    ? Number(grandTotal).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "0.00";

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentTimeFormatted = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleView = async () => {
    try {
      if (invoice?.id) {
        await invoicesApi.viewPdfInNewTab(invoice.id);
      } else if (onViewPDF) {
        onViewPDF();
      }
    } catch (err) {
      alert("Failed to open PDF: " + (err.message || "Error"));
    }
  };

  const handleDownload = async () => {
    try {
      if (invoice?.id) {
        const filename = `${invoiceNo.replace(/[\/\\:]/g, "-")}_tax_invoice.pdf`;
        await invoicesApi.downloadPdf(invoice.id, filename);
      } else {
        alert(`Downloading Tax Invoice ${invoiceNo}.pdf`);
      }
    } catch (err) {
      alert("Failed to download PDF: " + (err.message || "Error"));
    }
  };

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0px auto",
        padding: "0px 32px",
        textAlign: "center",
        position: "relative",
      }}
      className="success-wrapper"
    >
      {/* Decorative Floating Confetti Elements */}
      <div className="confetti-container">
        <span className="confetti c1" />
        <span className="confetti c2" />
        <span className="confetti c3" />
        <span className="confetti c4" />
        <span className="confetti c5" />
        <span className="confetti c6" />
        <span className="confetti c7" />
        <span className="confetti c8" />
        <span className="confetti c9" />
        <span className="confetti c10" />
      </div>

      {/* Big Green Circle with Checkmark */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#10b981",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)",
          animation: "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <svg
          style={{ height: "42px", width: "42px" }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      {/* Main Title & Subtitle */}
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#0f172a",
          margin: "0 0 8px 0",
        }}
      >
        Tax Invoice Generated Successfully!
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "#64748b",
          margin: "0 0 32px 0",
        }}
      >
        Your official 2-page tax invoice has been generated, signed, and saved to document history.
      </p>

      {/* Details Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          padding: "24px 28px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Document Type</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#059669" }}>Tax Invoice</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Invoice No.</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
              {invoiceNo}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Customer</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              {customerName}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Total Amount (Incl. GST)</span>
            <span style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>
              ₹{totalAmount}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Date & Time</span>
            <span style={{ fontSize: "14px", color: "#475569", fontWeight: 500 }}>
              {currentDateFormatted}, {currentTimeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: View PDF & Download PDF */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleView}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#059669",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
          }}
          className="succ-btn-view"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          View PDF in Browser
        </button>

        <button
          onClick={handleDownload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
            backgroundColor: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
          className="succ-btn-down"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Secondary Navigation */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center" }}>
        <button
          onClick={() => navigate("/dashboard/history")}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#64748b",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
          className="succ-back-link"
        >
          ← Go to Document History
        </button>
        <span style={{ color: "#cbd5e1" }}>•</span>
        <button
          onClick={() => navigate("/dashboard/invoice", { replace: true, state: null })}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#059669",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
          className="succ-back-link"
        >
          + Create Another Tax Invoice
        </button>
      </div>

      {/* Styles for confetti animations & hover */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.6);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .succ-btn-view:hover {
          background-color: #047857 !important;
          transform: translateY(-1px);
        }

        .succ-btn-down:hover {
          background-color: #f8fafc !important;
          border-color: #94a3b8 !important;
          transform: translateY(-1px);
        }

        .succ-back-link:hover {
          text-decoration: underline;
        }

        /* Floating Confetti Styles */
        .confetti-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          border-radius: 2px;
          animation: floatConfetti 3s ease-in-out infinite alternate;
        }

        .c1 { top: 10%; left: 8%; width: 10px; height: 10px; background: #f59e0b; transform: rotate(15deg); }
        .c2 { top: 15%; right: 12%; width: 8px; height: 14px; background: #ec4899; transform: rotate(-25deg); }
        .c3 { top: 28%; left: 16%; width: 12px; height: 8px; background: #3b82f6; transform: rotate(45deg); }
        .c4 { top: 22%; right: 20%; width: 10px; height: 10px; background: #10b981; transform: rotate(-10deg); }
        .c5 { top: 45%; left: 6%; width: 14px; height: 6px; background: #8b5cf6; transform: rotate(30deg); }
        .c6 { top: 52%; right: 8%; width: 9px; height: 12px; background: #f43f5e; transform: rotate(-40deg); }
        .c7 { top: 70%; left: 12%; width: 8px; height: 8px; background: #06b6d4; transform: rotate(20deg); }
        .c8 { top: 65%; right: 14%; width: 11px; height: 7px; background: #eab308; transform: rotate(-15deg); }
        .c9 { top: 85%; left: 22%; width: 10px; height: 10px; background: #10b981; transform: rotate(50deg); }
        .c10 { top: 80%; right: 25%; width: 8px; height: 12px; background: #3b82f6; transform: rotate(-30deg); }

        @keyframes floatConfetti {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
