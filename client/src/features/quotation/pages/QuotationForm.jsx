import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LetterDetails from "../components/LetterDetails";
import QuotationDetails from "../components/QuotationDetails";
import QuotationProductTable from "../components/QuotationProductTable";
import QuotationPreview from "./QuotationPreview";

const STEPS = [
  { id: 1, name: "Details", label: "Letter Details" },
  { id: 2, name: "Quotation", label: "Quotation Details" },
  { id: 3, name: "Products", label: "Product Details" },
  { id: 4, name: "Preview", label: "Review & Preview" },
];

export default function QuotationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Form State
  const [letterData, setLetterData] = useState({
    companyName: "ABC Industries Pvt Ltd",
    address: "Plot No. 45, Industrial Area,\nCoimbatore - 641 021\nTamil Nadu, India",
    date: new Date().toISOString().split("T")[0],
    subject: "Quotation for Supply of DG Set",
  });

  const [quotationData, setQuotationData] = useState({
    quoteNo: "MAX/2026/Q001",
    quoteDate: new Date().toISOString().split("T")[0],
    companyName: "ABC Industries Pvt Ltd",
    address: "Plot No. 45, Industrial Area,\nCoimbatore - 641 021\nTamil Nadu, India",
    gstin: "33AABCR1234F1Z8",
  });

  const [products, setProducts] = useState([
    {
      description: "RECD 125KVA DG set with acoustic enclosure",
      hsn: "84041000",
      uom: "Nos",
      quantity: 1,
      rate: 800000,
    },
  ]);

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
      { description: "", hsn: "", uom: "Nos", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveProduct = (index) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
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
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "28px 24px",
      }}
    >
      {/* Toast Alert */}
      {showToast && (
        <div className="quot-toast">
          <span>✓</span> Draft saved successfully!
        </div>
      )}

      {/* Top Header: Title & Horizontal Progress Stepper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "20px",
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
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "4px 0 0 0",
            }}
          >
            Create Sales Quotation
          </h1>
        </div>

        {/* Center/Right: Horizontal Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="quot-stepper"
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
              onNext={() => setCurrentStep(4)}
              onPrev={() => setCurrentStep(2)}
              onSaveDraft={handleSaveDraft}
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
        @media (max-width: 840px) {
          .quot-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .quot-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .quot-stepper-line {
            width: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
