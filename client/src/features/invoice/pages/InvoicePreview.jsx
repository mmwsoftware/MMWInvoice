import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDFViewer";
import InvoiceGeneratedSuccess from "../components/InvoiceGeneratedSuccess";

export default function InvoicePreview({
  customerData: propCustomer,
  invoiceData: propInvoice,
  products: propProducts,
  onEdit,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Use props or location.state or realistic default data matching the screenshot
  const customerData =
    propCustomer ||
    location.state?.customerData || {
      customerName: "Gainwell Commosales Pvt Ltd",
      address: "No. 12, Industrial Estate,\nChennai - 600 058\nTamil Nadu, India",
      stateCode: "33",
      gstin: "33AABCG1234F1Z5",
    };

  const invoiceData =
    propInvoice ||
    location.state?.invoiceData || {
      invoiceNo: "MAX/2026/0073",
      invoiceDate: "28 Sep 2026",
      poNo: "PO-88492",
      poDate: "25 Sep 2026",
    };

  const products =
    propProducts ||
    location.state?.products || [
      {
        description: "RECD 125KVA DG set",
        hsn: "84041000",
        quantity: 1,
        rate: 168750,
      },
      {
        description: "Installation and Commissioning",
        hsn: "998729",
        quantity: 1,
        rate: 20000,
      },
    ];

  const [isGenerated, setIsGenerated] = useState(false);

  // Calculations
  const subTotal = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const taxRate = 0.18;
  const grandTotal = Math.round(subTotal + subTotal * taxRate);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate("/dashboard/invoice", {
        state: { customerData, invoiceData, products, step: 3 },
      });
    }
  };

  const handleGeneratePDF = () => {
    setIsGenerated(true);
  };

  return (
    <div
      className="prev-container"
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "24px 24px 40px 24px",
      }}
    >
      {/* If generated, show Celebratory Success Screen */}
      {isGenerated ? (
        <InvoiceGeneratedSuccess
          customerData={customerData}
          invoiceData={invoiceData}
          grandTotal={grandTotal}
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
              className="prev-back-btn"
            >
              ← Back
            </button>
          </div>

          {/* 2-Column Layout: Left Document Summary + Right PDF Viewer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "24px",
              alignItems: "start",
            }}
            className="prev-grid"
          >
            {/* Left: Document Summary Card */}
            <div
              className="prev-summary-card"
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
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    Tax Invoice
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Document No.
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                    {invoiceData.invoiceNo}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Date
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    {invoiceData.invoiceDate}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Customer
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", lineHeight: "1.4" }}>
                    {customerData.customerName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Total Amount
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                    ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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
                  className="prev-btn-edit"
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
                  className="prev-btn-gen"
                >
                  Generate PDF
                </button>
              </div>
            </div>

            {/* Right: Embedded PDF Viewer */}
            <div style={{ minWidth: 0 }}>
              <PDFViewer
                customerData={customerData}
                invoiceData={invoiceData}
                products={products}
              />
            </div>
          </div>
        </>
      )}

      <style>{`
        .prev-back-btn:hover {
          color: #2563eb !important;
        }
        .prev-btn-edit:hover {
          background-color: #eff6ff !important;
        }
        .prev-btn-gen:hover {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        @media (max-width: 900px) {
          .prev-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .prev-summary-card {
            position: static !important;
            width: 100% !important;
          }
        }
        @media (max-width: 640px) {
          .prev-container {
            padding: 16px 12px 32px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
