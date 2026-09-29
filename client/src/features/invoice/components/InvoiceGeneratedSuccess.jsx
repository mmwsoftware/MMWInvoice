import React from "react";
import { useNavigate } from "react-router-dom";

export default function InvoiceGeneratedSuccess({
  customerData,
  invoiceData,
  grandTotal,
  onViewPDF,
}) {
  const navigate = useNavigate();

  const handleDownload = () => {
    alert(`Downloading Tax Invoice ${invoiceData.invoiceNo}.pdf`);
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentTimeFormatted = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
        Document Generated Successfully!
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "#64748b",
          margin: "0 0 32px 0",
        }}
      >
        Your tax invoice has been created and saved.
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
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Tax Invoice</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Document No.</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
              {invoiceData.invoiceNo}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Customer</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              {customerData.customerName}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Total Amount</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
              ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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
          onClick={onViewPDF}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#2563eb",
            backgroundColor: "#ffffff",
            border: "1.5px solid #bfdbfe",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
          }}
          className="succ-btn-view"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          View PDF
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
            color: "#2563eb",
            backgroundColor: "#ffffff",
            border: "1.5px solid #bfdbfe",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
          }}
          className="succ-btn-down"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Back to Dashboard Link */}
      <button
        onClick={() => navigate("/dashboard/home")}
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "color 0.2s",
        }}
        className="succ-back-link"
      >
        Back to Dashboard →
      </button>

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

        .succ-btn-view:hover, .succ-btn-down:hover {
          background-color: #eff6ff !important;
          border-color: #3b82f6 !important;
          transform: translateY(-1px);
        }

        .succ-back-link:hover {
          color: #1d4ed8 !important;
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
