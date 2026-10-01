import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerDetails from "../components/CustomerDetails";
import InvoiceDetails from "../components/InvoiceDetails";
import ProductTable from "../components/ProductTable";
import InvoiceReview from "../components/InvoiceReview";
import InvoicePreview from "./InvoicePreview";
import { invoicesApi } from "../../../services/api";
import { validateInvoiceInput } from "../../../services/documentHelpers";

const STEPS = [
  { id: 1, name: "Customer", label: "Customer Details" },
  { id: 2, name: "Invoice Details", label: "Invoice Details" },
  { id: 3, name: "Products", label: "Products" },
  { id: 4, name: "Review", label: "Review & Preview" },
];

export default function InvoiceForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(location.state?.step || 1);

  // Form State - blank defaults without mock data
  const [customerData, setCustomerData] = useState(() => ({
    customerName: location.state?.customerData?.customerName || "",
    address: location.state?.customerData?.address || "",
    stateCode: location.state?.customerData?.stateCode || "33",
    gstin: location.state?.customerData?.gstin || "",
  }));

  const [invoiceData, setInvoiceData] = useState(() => ({
    invoiceNo: location.state?.invoiceData?.invoiceNo || "",
    invoiceDate: location.state?.invoiceData?.invoiceDate || new Date().toISOString().split("T")[0],
    poNo: location.state?.invoiceData?.poNo || "",
    poDate: location.state?.invoiceData?.poDate || "",
  }));

  const [products, setProducts] = useState(() => {
    return (
      location.state?.products || [
        {
          description: "",
          hsn: "",
          quantity: 1,
          rate: "",
        },
      ]
    );
  });

  // Auto-fetch next invoice number from backend if empty
  useEffect(() => {
    if (!invoiceData.invoiceNo) {
      invoicesApi
        .getNextNumber()
        .then((res) => {
          if (res?.next_number) {
            setInvoiceData((prev) => ({
              ...prev,
              invoiceNo: prev.invoiceNo || res.next_number,
            }));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch next invoice number:", err);
        });
    }
  }, []);

  // Handlers
  const handleCustomerChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInvoiceChange = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddProduct = () => {
    if (products.length >= 5) {
      alert("Tax Invoice format supports a maximum of 5 items.");
      return;
    }
    setProducts((prev) => [
      ...prev,
      { description: "", hsn: "", quantity: 1, rate: "" },
    ]);
  };

  const handleRemoveProduct = (index) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceedToPreview = () => {
    const error = validateInvoiceInput(customerData, products);
    if (error) {
      alert(error);
      return;
    }
    setCurrentStep(4);
  };

  if (currentStep === 4) {
    return (
      <InvoicePreview
        customerData={customerData}
        invoiceData={invoiceData}
        products={products}
        onEdit={() => setCurrentStep(3)}
      />
    );
  }

  return (
    <div
      className="inv-form-container"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "28px 24px",
      }}
    >
      {/* Top Header */}
      <div
        className="inv-top-header"
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
            className="inv-back-header-btn"
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
              Create Tax Invoice
            </h1>
            <span className="inv-mobile-badge">
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
          className="inv-stepper-desktop"
        >
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle & Label */}
                <div
                  onClick={() => {
                    // Allow navigating to visited steps
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
                    className="inv-stepper-line"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Animated Progress Bar */}
      <div className="inv-mobile-prog-bar">
        <div
          className="inv-mobile-prog-fill"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Main Content Area: Left Step Navigation Sidebar + Right Form Card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "28px",
          alignItems: "start",
        }}
        className="inv-layout-grid"
      >
        {/* Left Step Pills */}
        <div
          className="inv-step-sidebar"
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
                className={`inv-step-item ${isActive ? "inv-step-active" : ""}`}
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
          className="inv-card"
        >
          {currentStep === 1 && (
            <CustomerDetails
              data={customerData}
              onChange={handleCustomerChange}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <InvoiceDetails
              data={invoiceData}
              onChange={handleInvoiceChange}
              onNext={() => setCurrentStep(3)}
              onPrev={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <ProductTable
              products={products}
              stateCode={customerData.stateCode}
              onChangeProduct={handleProductChange}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onNext={handleProceedToPreview}
              onPrev={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <InvoiceReview
              customerData={customerData}
              invoiceData={invoiceData}
              products={products}
              onPrev={() => setCurrentStep(3)}
            />
          )}
        </div>
      </div>

      {/* Global Invoice Form CSS */}
      <style>{`
        .inv-input {
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
        textarea.inv-input {
          height: auto;
          padding: 10px 14px;
        }
        .inv-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .inv-select {
          cursor: pointer;
        }
        .inv-btn-primary {
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
        .inv-btn-primary:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }
        .inv-btn-secondary {
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
        .inv-btn-secondary:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .inv-btn-back {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .inv-btn-back:hover {
          color: #0f172a;
        }
        .inv-back-header-btn {
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
        .inv-back-header-btn:hover {
          color: #2563eb;
        }
        .inv-step-item:hover:not(.inv-step-active) {
          background-color: #f8fafc !important;
        }
        .inv-mobile-badge {
          display: none;
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 3px 10px;
          border-radius: 100px;
          border: 1px solid #bfdbfe;
        }
        .inv-mobile-prog-bar {
          display: none;
          height: 4px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .inv-mobile-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        @media (max-width: 840px) {
          .inv-stepper-desktop {
            display: none !important;
          }
          .inv-mobile-badge {
            display: inline-block !important;
          }
          .inv-mobile-prog-bar {
            display: block !important;
          }
          .inv-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .inv-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .inv-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .inv-step-sidebar {
            position: static !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: 4px 0 8px 0 !important;
            -webkit-overflow-scrolling: touch;
            gap: 8px !important;
          }
          .inv-step-item {
            padding: 8px 14px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            border-radius: 100px !important;
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
          }
          .inv-step-active {
            background-color: #eff6ff !important;
            border-color: #93c5fd !important;
          }
        }
        @media (max-width: 640px) {
          .inv-form-container {
            padding: 16px 12px !important;
          }
          .inv-card {
            padding: 16px 12px !important;
          }
          .inv-input {
            height: 44px !important;
            font-size: 15px !important;
          }
          .inv-btn-primary,
          .inv-btn-secondary,
          .inv-btn-back {
            min-height: 44px !important;
          }
          .inv-form-actions {
            display: flex !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .inv-form-actions button,
          .inv-form-actions div button {
            flex: 1 !important;
            justify-content: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
