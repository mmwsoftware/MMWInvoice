import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LetterDetails from "../components/LetterDetails";
import QuotationDetails from "../components/QuotationDetails";
import QuotationProductTable from "../components/QuotationProductTable";
import QuotationPreview from "./QuotationPreview";
import { customersApi, quotationsApi } from "../../../services/api";

const STEPS = [
  { id: 1, name: "Details", label: "Letter Details" },
  { id: 2, name: "Quotation", label: "Quotation Details" },
  { id: 3, name: "Products", label: "Product Details" },
  { id: 4, name: "Preview", label: "Review & Preview" },
];

export default function QuotationForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [draftId, setDraftId] = useState(location.state?.draftId || null);
  const [customerId, setCustomerId] = useState(location.state?.customerId || null);

  // Form State - blank defaults without mock data
  const [letterData, setLetterData] = useState(() => ({
    companyName: location.state?.letterData?.companyName || "",
    address: location.state?.letterData?.address || "",
    date: location.state?.letterData?.date || new Date().toISOString().split("T")[0],
    subject: location.state?.letterData?.subject || "",
  }));

  const [quotationData, setQuotationData] = useState(() => ({
    quoteNo: location.state?.quotationData?.quoteNo || "",
    quoteDate: location.state?.quotationData?.quoteDate || new Date().toISOString().split("T")[0],
    companyName: location.state?.quotationData?.companyName || location.state?.letterData?.companyName || "",
    address: location.state?.quotationData?.address || location.state?.letterData?.address || "",
    gstin: location.state?.quotationData?.gstin || "",
  }));

  const [products, setProducts] = useState(() => {
    return (
      location.state?.products || [
        {
          description: "",
          hsn: "",
          uom: "Nos",
          quantity: 1,
          rate: "",
        },
      ]
    );
  });

  // Fetch next quotation number from backend if empty
  useEffect(() => {
    if (!quotationData.quoteNo) {
      quotationsApi
        .getNextNumber()
        .then((res) => {
          if (res?.next_number) {
            setQuotationData((prev) => ({
              ...prev,
              quoteNo: prev.quoteNo || res.next_number,
            }));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch next quotation number:", err);
        });
    }
  }, []);

  // Handlers
  const handleLetterChange = (field, value) => {
    setLetterData((prev) => ({ ...prev, [field]: value }));

    // Automatically sync companyName & address into quotationData as requested
    if (field === "companyName" || field === "address") {
      setQuotationData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleQuotationChange = (field, value) => {
    setQuotationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      { description: "", hsn: "", uom: "Nos", quantity: 1, rate: "" },
    ]);
  };

  const handleRemoveProduct = (index) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // Real backend saving logic
  const saveQuotationToBackend = async () => {
    const companyName = letterData.companyName?.trim() || quotationData.companyName?.trim();
    if (!companyName) {
      throw new Error("Client / Company Name is required.");
    }
    const subject = letterData.subject?.trim() || "Quotation";

    // 1. Get, create, or update customer
    let cId = customerId;
    const cleanGstin = quotationData.gstin?.trim().toUpperCase() || null;
    const addressLines = (letterData.address || quotationData.address || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const customerPayload = {
      name: companyName,
      address_lines: addressLines.length ? addressLines : [companyName],
      gstin: cleanGstin,
    };

    try {
      if (cId) {
        await customersApi.update(cId, customerPayload);
      } else {
        const found = await customersApi.list(companyName);
        const match = found.find(
          (c) => c.name.toLowerCase() === companyName.toLowerCase()
        );
        if (match) {
          cId = match.id;
          await customersApi.update(cId, customerPayload);
        } else {
          const created = await customersApi.create(customerPayload);
          cId = created.id;
        }
        setCustomerId(cId);
      }
    } catch (err) {
      console.error("Customer error:", err);
      throw new Error(err.response?.data?.detail || "Failed to process customer.");
    }

    // 2. Prepare items
    const validItems = products
      .filter((p) => p.description && p.description.trim())
      .map((p) => ({
        description: p.description.trim(),
        hsn: p.hsn?.trim() || "",
        qty: parseFloat(p.quantity) || 1,
        uom: p.uom?.trim() || "Nos",
        rate: parseFloat(p.rate) || 0,
      }));

    if (validItems.length === 0) {
      throw new Error("Please add at least one product with a description and rate.");
    }

    const payload = {
      customer_id: cId,
      quotation_date: quotationData.quoteDate || letterData.date || new Date().toISOString().split("T")[0],
      subject,
      items: validItems,
      quotation_number: quotationData.quoteNo?.trim() || null,
    };

    let result;
    if (draftId) {
      result = await quotationsApi.updateDraft(draftId, payload);
    } else {
      result = await quotationsApi.saveDraft(payload);
      setDraftId(result.id);
    }
    return result;
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const saved = await saveQuotationToBackend();
      setToastMessage(`Draft #${saved.id} saved successfully!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedToPreview = async () => {
    try {
      setIsSaving(true);
      const saved = await saveQuotationToBackend();
      const quoteNoFinal = saved.quotation_number || quotationData.quoteNo?.trim() || `Draft #${saved.id}`;
      navigate("/dashboard/quotation/preview", {
        state: {
          draftId: saved.id,
          customerId: saved.customer_id,
          letterData,
          quotationData: {
            ...quotationData,
            quoteNo: quoteNoFinal,
          },
          products,
        },
      });
    } catch (err) {
      alert("Error: " + (err.message || "Failed to proceed to preview"));
    } finally {
      setIsSaving(false);
    }
  };

  if (currentStep === 4) {
    return (
      <QuotationPreview
        letterData={letterData}
        quotationData={quotationData}
        products={products}
        onEdit={() => setCurrentStep(3)}
      />
    );
  }

  return (
    <div
      className="quot-form-container"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "28px 24px",
      }}
    >
      {/* Toast Alert */}
      {showToast && (
        <div className="quot-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div
        className="quot-top-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Left: Back & Title */}
        <div>
          <button
            onClick={() => navigate("/dashboard/home")}
            className="quot-back-header-btn"
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Create Sales Quotation
            </h1>
            <span className="quot-mobile-badge">
              Step {currentStep}/4
            </span>
          </div>
        </div>

        {/* Desktop Horizontal Stepper (hidden on mobile) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="quot-stepper-desktop"
        >
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle & Label */}
                <div
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: step.id <= currentStep ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      height: "36px",
                      width: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      backgroundColor: isActive
                        ? "#2563eb"
                        : isCompleted
                        ? "#dbeafe"
                        : "#f1f5f9",
                      color: isActive
                        ? "#ffffff"
                        : isCompleted
                        ? "#1d4ed8"
                        : "#94a3b8",
                      border: isActive
                        ? "2px solid #2563eb"
                        : isCompleted
                        ? "2px solid #93c5fd"
                        : "2px solid transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isCompleted ? "✓" : step.id}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? "#1d4ed8"
                        : isCompleted
                        ? "#334155"
                        : "#94a3b8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.name}
                  </span>
                </div>

                {/* Connecting Line */}
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      width: "48px",
                      height: "2px",
                      backgroundColor:
                        currentStep > step.id ? "#3b82f6" : "#e2e8f0",
                      marginBottom: "20px",
                      transition: "background-color 0.3s ease",
                    }}
                    className="quot-stepper-line"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Animated Progress Bar */}
      <div className="quot-mobile-prog-bar">
        <div
          className="quot-mobile-prog-fill"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Main Content Area: Sticky Left Step Navigation + Right Form Card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "28px",
          alignItems: "start",
        }}
        className="quot-layout-grid"
      >
        {/* Left Sticky Step Pills */}
        <div
          className="quot-step-sidebar"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            position: "sticky",
            top: "84px",
          }}
        >
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id <= currentStep) setCurrentStep(step.id);
                }}
                className={`quot-step-item ${isActive ? "quot-step-active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  color: isActive
                    ? "#1d4ed8"
                    : isCompleted
                    ? "#334155"
                    : "#64748b",
                  cursor: step.id <= currentStep ? "pointer" : "default",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Circle Icon */}
                <div
                  style={{
                    height: "24px",
                    width: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    backgroundColor: isActive
                      ? "#2563eb"
                      : isCompleted
                      ? "#3b82f6"
                      : "transparent",
                    color: isActive || isCompleted ? "#ffffff" : "#94a3b8",
                    border:
                      isActive || isCompleted
                        ? "none"
                        : "1.5px solid #cbd5e1",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted || isActive ? "✓" : step.id}
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          }}
          className="quot-card"
        >
          {currentStep === 1 && (
            <LetterDetails
              data={letterData}
              onChange={handleLetterChange}
              onNext={() => setCurrentStep(2)}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentStep === 2 && (
            <QuotationDetails
              data={quotationData}
              draftId={draftId}
              onChange={handleQuotationChange}
              onNext={() => setCurrentStep(3)}
              onPrev={() => setCurrentStep(1)}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentStep === 3 && (
            <QuotationProductTable
              products={products}
              onChangeProduct={handleProductChange}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onNext={handleProceedToPreview}
              onPrev={() => setCurrentStep(2)}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentStep === 4 && (
            <QuotationPreview
              letterData={letterData}
              quotationData={quotationData}
              products={products}
              onEdit={() => setCurrentStep(3)}
            />
          )}
        </div>
      </div>

      {/* Quotation Styles */}
      <style>{`
        .quot-input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          font-size: 14px;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea.quot-input {
          height: auto;
          padding: 10px 14px;
        }
        .quot-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .quot-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background-color: #2563eb;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .quot-btn-primary:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }
        .quot-btn-secondary {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quot-btn-secondary:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .quot-btn-back {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .quot-btn-back:hover {
          color: #0f172a;
        }
        .quot-back-header-btn {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          margin-bottom: 2px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }
        .quot-back-header-btn:hover {
          color: #2563eb;
        }
        .quot-step-item:hover:not(.quot-step-active) {
          background-color: #f8fafc !important;
        }
        .quot-toast {
          position: fixed;
          top: 80px;
          right: 28px;
          z-index: 100;
          background-color: #1e293b;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }
        .quot-mobile-badge {
          display: none;
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 3px 10px;
          border-radius: 100px;
          border: 1px solid #bfdbfe;
        }
        .quot-mobile-prog-bar {
          display: none;
          height: 4px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .quot-mobile-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        @media (max-width: 840px) {
          .quot-stepper-desktop {
            display: none !important;
          }
          .quot-mobile-badge {
            display: inline-block !important;
          }
          .quot-mobile-prog-bar {
            display: block !important;
          }
          .quot-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .quot-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .quot-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .quot-step-sidebar {
            position: static !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: 4px 0 8px 0 !important;
            -webkit-overflow-scrolling: touch;
            gap: 8px !important;
          }
          .quot-step-item {
            padding: 8px 14px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            border-radius: 100px !important;
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
          }
          .quot-step-active {
            background-color: #eff6ff !important;
            border-color: #93c5fd !important;
          }
        }
        @media (max-width: 640px) {
          .quot-form-container {
            padding: 16px 12px !important;
          }
          .quot-card {
            padding: 16px 12px !important;
          }
          .quot-input {
            height: 44px !important;
            font-size: 15px !important;
          }
          .quot-btn-primary,
          .quot-btn-secondary,
          .quot-btn-back {
            min-height: 44px !important;
          }
          .quot-form-actions {
            display: flex !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .quot-form-actions button,
          .quot-form-actions div button {
            flex: 1 !important;
            justify-content: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
