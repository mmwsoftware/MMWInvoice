import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuotationPDFViewer from "../components/QuotationPDFViewer";
import QuotationGeneratedSuccess from "../components/QuotationGeneratedSuccess";
import { quotationsApi, customersApi } from "../../../services/api";

export default function QuotationPreview({
  letterData: propLetter,
  quotationData: propQuote,
  products: propProducts,
  onEdit,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const draftId = location.state?.draftId || null;
  const customerId = location.state?.customerId || null;

  const letterData =
    propLetter ||
    location.state?.letterData || {
      companyName: "",
      address: "",
      date: new Date().toISOString().split("T")[0],
      subject: "",
    };

  const quotationData =
    propQuote ||
    location.state?.quotationData || {
      quoteNo: "Auto-assigned on issue",
      quoteDate: new Date().toISOString().split("T")[0],
      companyName: "",
      address: "",
      gstin: "",
    };

  const products =
    propProducts ||
    location.state?.products || [
      {
        description: "",
        hsn: "",
        uom: "Nos",
        quantity: 1,
        rate: 0,
      },
    ];

  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuotation, setGeneratedQuotation] = useState(null);

  // Real backend preview PDF state
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState("");

  const totalAmount = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  // Fetch real backend PDF preview
  React.useEffect(() => {
    let activeUrl = null;
    let isCancelled = false;

    async function loadBackendPdf() {
      if (!draftId) {
        setLoadingPdf(false);
        return;
      }
      try {
        setLoadingPdf(true);
        setPdfError("");
        const blob = await quotationsApi.getPreviewPdfBlob(draftId);
        if (!isCancelled) {
          const url = URL.createObjectURL(blob);
          activeUrl = url;
          setPdfBlobUrl(url);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Backend preview PDF error:", err);
          const msg =
            err.response?.data?.detail ||
            err.message ||
            "Failed to load PDF preview from backend.";
          setPdfError(msg);
        }
      } finally {
        if (!isCancelled) {
          setLoadingPdf(false);
        }
      }
    }

    loadBackendPdf();

    return () => {
      isCancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [draftId]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate("/dashboard/quotation", {
        state: {
          draftId,
          customerId,
          letterData,
          quotationData,
          products,
          step: 3,
        },
      });
    }
  };

  const handleGeneratePDF = async () => {
    let currentDraftId = draftId;
    setIsGenerating(true);

    try {
      // If no draft exists yet, save one first
      if (!currentDraftId) {
        const companyName = quotationData.companyName?.trim() || letterData.companyName?.trim();
        if (!companyName) {
          alert("Please fill in Client Company name first.");
          navigate("/dashboard/quotation");
          return;
        }

        let cId = customerId;
        if (!cId) {
          const existing = await customersApi.list(companyName);
          const match = existing.find(
            (c) => c.name.toLowerCase() === companyName.toLowerCase()
          );
          if (match) {
            cId = match.id;
          } else {
            const lines = (letterData.address || quotationData.address || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            const created = await customersApi.create({
              name: companyName,
              address_lines: lines.length ? lines : [companyName],
              gstin: quotationData.gstin || null,
            });
            cId = created.id;
          }
        }

        const validItems = products
          .filter((p) => p.description && p.description.trim())
          .map((p) => ({
            description: p.description.trim(),
            hsn: p.hsn || "",
            qty: parseFloat(p.quantity) || 1,
            uom: p.uom || "Nos",
            rate: parseFloat(p.rate) || 0,
          }));

        if (validItems.length === 0) {
          alert("Please add at least one product with description and rate.");
          setIsGenerating(false);
          return;
        }

        const saved = await quotationsApi.saveDraft({
          customer_id: cId,
          quotation_date:
            quotationData.quoteDate ||
            letterData.date ||
            new Date().toISOString().split("T")[0],
          subject: letterData.subject || "Quotation",
          items: validItems,
          quotation_number: quotationData.quoteNo?.trim() || null,
        });
        currentDraftId = saved.id;
      }

      // Issue the quotation on backend -> builds official PDF with assigned quote number
      const issued = await quotationsApi.issue(currentDraftId);
      setGeneratedQuotation(issued);
      setIsGenerated(true);
    } catch (err) {
      console.error("Quotation issue error:", err);
      alert(
        "Failed to generate quotation: " +
          (err.response?.data?.detail || err.message)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftId) {
      navigate("/dashboard/home");
      return;
    }
    const isSure = window.confirm("Are you sure you want to discard and delete this quotation draft?");
    if (!isSure) return;

    try {
      await quotationsApi.delete(draftId);
      navigate("/dashboard/home");
    } catch (err) {
      alert("Failed to delete draft: " + (err.response?.data?.detail || err.message));
    }
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
      {isGenerated && generatedQuotation ? (
        <QuotationGeneratedSuccess
          quotation={generatedQuotation}
          onBackToPreview={() => setIsGenerated(false)}
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
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      fontFamily: "monospace",
                    }}
                  >
                    {quotationData.quoteNo || (draftId ? `Draft #${draftId}` : "Auto-assigned on issue")}
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
                    {quotationData.companyName || letterData.companyName || "Client"}
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
                  className="qprev-btn-edit"
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
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "10px",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                    opacity: isGenerating ? 0.7 : 1,
                  }}
                  className="qprev-btn-gen"
                >
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </button>
              </div>

              {draftId && (
                <button
                  type="button"
                  onClick={handleDeleteDraft}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#dc2626",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  className="qprev-btn-discard"
                >
                  <svg style={{ height: "15px", width: "15px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Discard Draft
                </button>
              )}
            </div>

            {/* Right: Real Backend PDF Viewer */}
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
                {loadingPdf ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "3px solid rgba(255,255,255,0.25)",
                        borderTopColor: "#3b82f6",
                        borderRadius: "50%",
                        animation: "qspin 0.8s linear infinite",
                      }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>
                      Rendering official PDF from backend...
                    </span>
                  </div>
                ) : pdfError ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f87171",
                      padding: "24px",
                      textAlign: "center",
                      backgroundColor: "#1e293b",
                    }}
                  >
                    <p style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0" }}>
                      PDF Generation Notice
                    </p>
                    <p style={{ fontSize: "14px", color: "#e2e8f0", maxWidth: "480px", margin: 0 }}>
                      {pdfError}
                    </p>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="quot-btn-secondary"
                      style={{ marginTop: "20px" }}
                    >
                      ← Back to Edit Details
                    </button>
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`}
                    title="Official Quotation PDF Preview"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                ) : (
                  <QuotationPDFViewer
                    letterData={letterData}
                    quotationData={quotationData}
                    products={products}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes qspin {
          to { transform: rotate(360deg); }
        }
        .qprev-back-btn:hover {
          color: #2563eb !important;
        }
        .qprev-btn-edit:hover {
          background-color: #eff6ff !important;
        }
        .qprev-btn-gen:hover:not(:disabled) {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        .qprev-btn-discard:hover {
          background-color: #fee2e2 !important;
          color: #b91c1c !important;
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
