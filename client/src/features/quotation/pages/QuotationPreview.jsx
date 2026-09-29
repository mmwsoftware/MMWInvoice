import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuotationPDFViewer from "../components/QuotationPDFViewer";
import InvoiceGeneratedSuccess from "../../invoice/components/InvoiceGeneratedSuccess";

export default function QuotationPreview({
  letterData: propLetter,
  quotationData: propQuote,
  products: propProducts,
  onEdit,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const letterData =
    propLetter ||
    location.state?.letterData || {
      companyName: "ABC Industries Pvt Ltd",
      address: "Plot No. 45, Industrial Area,\nCoimbatore - 641 021\nTamil Nadu, India",
      date: new Date().toISOString().split("T")[0],
      subject: "Quotation for Supply of DG Set",
    };

  const quotationData =
    propQuote ||
    location.state?.quotationData || {
      quoteNo: "MAX/2026/Q001",
      quoteDate: new Date().toISOString().split("T")[0],
      companyName: "ABC Industries Pvt Ltd",
      address: "Plot No. 45, Industrial Area,\nCoimbatore - 641 021\nTamil Nadu, India",
      gstin: "33AABCR1234F1Z8",
    };

  const products =
    propProducts ||
    location.state?.products || [
      {
        description: "RECD 125KVA DG set with acoustic enclosure",
        hsn: "84041000",
        uom: "Nos",
        quantity: 1,
        rate: 800000,
      },
    ];

  const [isGenerated, setIsGenerated] = useState(false);

  const totalAmount = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate("/dashboard/quotation");
    }
  };

  const handleGeneratePDF = () => {
    setIsGenerated(true);
  };

  return (
    <div
      className="qprev-container"
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "24px 24px 40px 24px",
      }}
    >
      {isGenerated ? (
        <InvoiceGeneratedSuccess
          customerData={{ customerName: quotationData.companyName || letterData.companyName }}
          invoiceData={{ invoiceNo: quotationData.quoteNo }}
          grandTotal={Math.round(totalAmount)}
          onViewPDF={() => setIsGenerated(false)}
        />
      ) : (
        <>
          {/* Top Back Link */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleEdit}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                background: "transparent",
                color: "#475569",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 0.2s",
              }}
              className="qprev-back-btn"
            >
              ← Back
            </button>
          </div>

          {/* 2-Column Layout: Left Sticky Document Summary + Right PDF Viewer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "24px",
              alignItems: "start",
            }}
            className="qprev-grid"
          >
            {/* Left: Sticky Document Summary Card */}
            <div
              className="qprev-summary-card"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                position: "sticky",
                top: "84px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 20px 0",
                }}
              >
                Document Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Document Type
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#2563eb" }}>
                    Sales Quotation
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Quote No.
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                    {quotationData.quoteNo}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Date
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    {quotationData.quoteDate || letterData.date}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Client
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", lineHeight: "1.4" }}>
                    {quotationData.companyName || letterData.companyName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Total Amount
                  </div>
                  <div style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>
                    ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    Status
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    <span
                      style={{
                        height: "6px",
                        width: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                      }}
                    />
                    Ready to Generate
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit Details & Generate PDF */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  onClick={handleEdit}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2563eb",
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #2563eb",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="qprev-btn-edit"
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  }}
                  className="qprev-btn-gen"
                >
                  Generate PDF
                </button>
              </div>
            </div>

            {/* Right: Embedded PDF Viewer */}
            <div style={{ minWidth: 0 }}>
              <QuotationPDFViewer
                letterData={letterData}
                quotationData={quotationData}
                products={products}
              />
            </div>
          </div>
        </>
      )}

      <style>{`
        .qprev-back-btn:hover {
          color: #2563eb !important;
        }
        .qprev-btn-edit:hover {
          background-color: #eff6ff !important;
        }
        .qprev-btn-gen:hover {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        @media (max-width: 900px) {
          .qprev-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .qprev-summary-card {
            position: static !important;
            width: 100% !important;
          }
        }
        @media (max-width: 640px) {
          .qprev-container {
            padding: 16px 12px 32px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
