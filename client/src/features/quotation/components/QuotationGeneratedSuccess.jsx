import React from "react";
import { useNavigate } from "react-router-dom";
import { quotationsApi } from "../../../services/api";

export default function QuotationGeneratedSuccess({
  quotation,
  onBackToPreview,
}) {
  const navigate = useNavigate();

  const quoteNo = quotation?.quotation_number || "MAX/2026/Q0001";
  const clientName = quotation?.customer?.name || "Client";
  const totalAmount = quotation?.total_amount
    ? Number(quotation.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })
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
      await quotationsApi.viewPdfInNewTab(quotation.id);
    } catch (err) {
      alert("Failed to open PDF: " + (err.message || "Error"));
    }
  };

  const handleDownload = async () => {
    try {
      const filename = `${quoteNo.replace(/[\/\\:]/g, "-")}_quotation.pdf`;
      await quotationsApi.downloadPdf(quotation.id, filename);
    } catch (err) {
      alert("Failed to download PDF: " + (err.message || "Error"));
    }
  };

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "0 24px",
        textAlign: "center",
      }}
      className="qsuccess-wrapper"
    >
      {/* Big Blue / Emerald Circle with Checkmark */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto",
          boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
        }}
      >
        <svg
          style={{ width: "42px", height: "42px" }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.6}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "8px",
        }}
      >
        Quotation Generated Successfully!
      </h1>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px 0" }}>
        Official PDF has been generated and saved to document history.
      </p>

      {/* Summary Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          padding: "24px 28px",
          textAlign: "left",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.04)",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
            paddingBottom: "18px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              Quotation Number
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
              {quoteNo}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              Date & Time
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
              {currentDateFormatted}, {currentTimeFormatted}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              Client Name
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
              {clientName}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              Total Amount
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
              ₹{totalAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={handleView}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            transition: "all 0.2s",
          }}
          className="qsuccess-btn-primary"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
            padding: "12px 24px",
            backgroundColor: "#ffffff",
            color: "#334155",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          className="qsuccess-btn-sec"
        >
          <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Secondary Navigation */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
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
          className="qsuccess-link"
        >
          ← Go to Document History
        </button>
        <span style={{ color: "#cbd5e1", alignSelf: "center" }}>•</span>
        <button
          onClick={() => navigate("/dashboard/quotation", { replace: true, state: null })}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
          className="qsuccess-link"
        >
          + Create Another Quotation
        </button>
      </div>

      <style>{`
        .qsuccess-btn-primary:hover {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
        }
        .qsuccess-btn-sec:hover {
          background-color: #f8fafc !important;
          border-color: #94a3b8 !important;
        }
        .qsuccess-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
