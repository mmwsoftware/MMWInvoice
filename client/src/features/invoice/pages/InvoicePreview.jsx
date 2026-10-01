import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PdfPreviewFrame from "../../../components/PdfPreviewFrame";
import InvoiceGeneratedSuccess from "../components/InvoiceGeneratedSuccess";
import { generateInvoice, previewInvoice } from "../../../services/documentHelpers";

export default function InvoicePreview({
  customerData: propCustomer,
  invoiceData: propInvoice,
  products: propProducts,
  onEdit,
}) {
  const location = useLocation();
  const navigate = useNavigate();


  const customerData =
    propCustomer ||
    location.state?.customerData || {
      customerName: "",
      address: "",
      stateCode: "33",
      gstin: "",
    };

  const invoiceData =
    propInvoice ||
    location.state?.invoiceData || {
      invoiceNo: "Auto-assigned on issue",
      invoiceDate: new Date().toISOString().split("T")[0],
      poNo: "",
      poDate: "",
    };

  const products =
    propProducts ||
    location.state?.products || [
      {
        description: "",
        hsn: "",
        quantity: 1,
        rate: 0,
      },
    ];

  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);


  // Subtotal & Tax Calculations
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
        state: {
          customerData,
          invoiceData,
          products,
          step: 3,
        },
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // One call: validates, creates the customer if needed, numbers and issues the invoice.
      const issued = await generateInvoice({ customerData, invoiceData, products });
      setGeneratedInvoice(issued);
      setIsGenerated(true);
    } catch (err) {
      console.error("Invoice generation error:", err);
      alert(
        "Failed to generate invoice: " +
          (err.response?.data?.detail || err.message)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="iprev-container"
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "24px 24px 40px 24px",
      }}
    >
      {isGenerated && generatedInvoice ? (
        <InvoiceGeneratedSuccess
          invoice={generatedInvoice}
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
              className="iprev-back-btn"
            >
              ← Back to Edit
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
            className="iprev-grid"
          >
            {/* Left: Sticky Document Summary Card */}
            <div
              className="iprev-summary-card"
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
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#059669" }}>
                    Tax Invoice
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Invoice No.
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      fontFamily: "monospace",
                    }}
                  >
                    {invoiceData.invoiceNo || "Auto-assigned on issue"}
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

                {invoiceData.poNo && (
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                      PO Number
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                      {invoiceData.poNo}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Customer
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", lineHeight: "1.4" }}>
                    {customerData.customerName || "Customer"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                    Total Amount (Incl. GST)
                  </div>
                  <div style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>
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
                  disabled={isGenerating}
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
                  className="iprev-btn-edit"
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#059669",
                    border: "none",
                    borderRadius: "10px",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
                    opacity: isGenerating ? 0.7 : 1,
                  }}
                  className="iprev-btn-gen"
                >
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </button>
              </div>
            </div>

            {/* Right: real PDF rendered by the backend (nothing is saved) */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#525659",
                  height: "820px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  position: "relative",
                }}
              >
                <PdfPreviewFrame
                  load={() => previewInvoice({ customerData, invoiceData, products })}
                  onEdit={handleEdit}
                  title="Tax Invoice PDF preview"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .iprev-back-btn:hover {
          color: #059669 !important;
        }
        .iprev-btn-edit:hover {
          background-color: #eff6ff !important;
        }
        .iprev-btn-gen:hover:not(:disabled) {
          background-color: #047857 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35) !important;
        }
        @media (max-width: 900px) {
          .iprev-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .iprev-summary-card {
            position: static !important;
            width: 100% !important;
          }
        }
        @media (max-width: 640px) {
          .iprev-container {
            padding: 16px 12px 32px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
