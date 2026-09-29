import React from "react";
import { numberToIndianWords } from "../utils/numberToWords";

export default function ProductTable({
  products,
  stateCode,
  onChangeProduct,
  onAddProduct,
  onRemoveProduct,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  // Calculations
  const subTotal = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  // If stateCode is 33 (Tamil Nadu), domestic GST applies (CGST 9% + SGST 9%)
  // If other state, inter-state IGST 18% applies
  const isInterState = stateCode !== "33";
  const taxRate = 0.18;
  const totalTax = subTotal * taxRate;
  const grandTotal = Math.round(subTotal + totalTax);

  const amountInWords = numberToIndianWords(grandTotal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (products.length === 0) {
      alert("Please add at least one product.");
      return;
    }
    const hasEmpty = products.some(
      (p) => !p.description?.trim() || !p.quantity || !p.rate
    );
    if (hasEmpty) {
      alert("Please fill in Description, Quantity, and Rate for all products.");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "24px",
        }}
      >
        Product Details
      </h3>

      {/* Desktop Products Table (>= 768px) */}
      <div
        className="prod-desktop-table"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                height: "44px",
              }}
            >
              <th className="prod-th" style={{ width: "48px", textAlign: "center" }}>
                S.No.
              </th>
              <th className="prod-th" style={{ width: "35%" }}>
                Product Description
              </th>
              <th className="prod-th" style={{ width: "15%" }}>
                HSN Code
              </th>
              <th className="prod-th" style={{ width: "11%", textAlign: "center" }}>
                Quantity
              </th>
              <th className="prod-th" style={{ width: "18%", textAlign: "right" }}>
                Rate Per Unit (₹)
              </th>
              <th className="prod-th" style={{ width: "16%", textAlign: "right" }}>
                Amount (₹)
              </th>
              <th className="prod-th" style={{ width: "44px", textAlign: "center" }}>
                {" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, idx) => {
              const qty = parseFloat(item.quantity) || 0;
              const rate = parseFloat(item.rate) || 0;
              const itemTotal = qty * rate;

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom:
                      idx < products.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  {/* S.No */}
                  <td
                    className="prod-td"
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Product Description */}
                  <td className="prod-td">
                    <input
                      type="text"
                      required
                      placeholder="Enter description"
                      value={item.description || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "description", e.target.value)
                      }
                      className="inv-table-input"
                    />
                  </td>

                  {/* HSN Code */}
                  <td className="prod-td">
                    <input
                      type="text"
                      placeholder="e.g. 84041000"
                      value={item.hsn || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "hsn", e.target.value)
                      }
                      className="inv-table-input font-mono"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="prod-td">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "quantity", e.target.value)
                      }
                      className="inv-table-input"
                      style={{ textAlign: "center" }}
                    />
                  </td>

                  {/* Rate */}
                  <td className="prod-td">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="0.00"
                      value={item.rate || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "rate", e.target.value)
                      }
                      className="inv-table-input"
                      style={{ textAlign: "right" }}
                    />
                  </td>

                  {/* Amount */}
                  <td
                    className="prod-td"
                    style={{
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    {itemTotal > 0
                      ? itemTotal.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </td>

                  {/* Delete Button */}
                  <td className="prod-td" style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(idx)}
                      disabled={products.length <= 1}
                      title="Delete Product"
                      className="prod-delete-btn"
                      style={{
                        opacity: products.length <= 1 ? 0.3 : 1,
                        cursor: products.length <= 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      <svg
                        style={{ height: "18px", width: "18px" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.6}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Product Cards (< 768px) */}
      <div className="prod-mobile-cards">
        {products.map((item, idx) => {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const itemTotal = qty * rate;

          return (
            <div key={idx} className="prod-item-card">
              {/* Card Header: Item badge & Delete */}
              <div className="prod-item-card-header">
                <span className="prod-item-badge">
                  Item #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveProduct(idx)}
                  disabled={products.length <= 1}
                  className="prod-card-delete-btn"
                  title="Remove Item"
                  style={{
                    opacity: products.length <= 1 ? 0.3 : 1,
                    cursor: products.length <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <svg
                    style={{ height: "15px", width: "15px" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "12px" }}>
                <label className="prod-card-label">Product Description <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RECD 125KVA DG set"
                  value={item.description || ""}
                  onChange={(e) =>
                    onChangeProduct(idx, "description", e.target.value)
                  }
                  className="inv-card-input"
                />
              </div>

              {/* 2-col: HSN and Quantity */}
              <div className="prod-card-grid-2" style={{ marginBottom: "12px" }}>
                <div>
                  <label className="prod-card-label">HSN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 84041000"
                    value={item.hsn || ""}
                    onChange={(e) =>
                      onChangeProduct(idx, "hsn", e.target.value)
                    }
                    className="inv-card-input font-mono"
                  />
                </div>
                <div>
                  <label className="prod-card-label">Quantity <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity || ""}
                    onChange={(e) =>
                      onChangeProduct(idx, "quantity", e.target.value)
                    }
                    className="inv-card-input"
                    style={{ textAlign: "center" }}
                  />
                </div>
              </div>

              {/* 2-col: Rate and Amount */}
              <div className="prod-card-grid-2">
                <div>
                  <label className="prod-card-label">Rate Per Unit (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={item.rate || ""}
                    onChange={(e) =>
                      onChangeProduct(idx, "rate", e.target.value)
                    }
                    className="inv-card-input"
                  />
                </div>
                <div>
                  <label className="prod-card-label">Amount (₹)</label>
                  <div className="prod-card-amount-box">
                    ₹{itemTotal > 0
                      ? itemTotal.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Button */}
      <button
        type="button"
        onClick={onAddProduct}
        className="inv-add-product-btn"
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>+</span> Add Product
      </button>

      {/* Calculations Summary */}
      <div
        className="inv-calc-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          marginTop: "16px",
          gap: "8px",
        }}
      >
        <div className="inv-calc-box" style={{ width: "280px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              color: "#64748b",
              padding: "4px 0",
            }}
          >
            <span>Sub Total</span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>
              {subTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          {isInterState ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#64748b",
                padding: "4px 0",
              }}
            >
              <span>IGST @ 18%</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>
                {totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px 0",
                }}
              >
                <span>CGST @ 9%</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {(totalTax / 2).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px 0",
                }}
              >
                <span>SGST @ 9%</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {(totalTax / 2).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "8px",
              marginTop: "4px",
            }}
          >
            <span>Total Amount</span>
            <span style={{ color: "#0f172a", fontSize: "18px" }}>
              ₹
              {grandTotal.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Amount in Words Banner */}
      <div
        style={{
          marginTop: "24px",
          padding: "14px 20px",
          borderRadius: "12px",
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#1d4ed8",
            letterSpacing: "0.02em",
          }}
        >
          Amount in Words
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "#334155",
            fontWeight: 500,
          }}
        >
          {amountInWords}
        </span>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          className="inv-btn-back"
        >
          ← Back
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inv-btn-secondary"
          >
            Save Draft
          </button>
          <button type="submit" className="inv-btn-primary">
            Preview →
          </button>
        </div>
      </div>

      <style>{`
        .prod-desktop-table {
          display: block;
        }
        .prod-mobile-cards {
          display: none;
        }
        .prod-th {
          padding: 12px 8px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.02em;
        }
        .prod-td {
          padding: 8px 6px;
        }
        .inv-table-input {
          box-sizing: border-box;
          width: 100%;
          height: 38px;
          padding: 0 10px;
          font-size: 13px;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inv-table-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .prod-delete-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          width: 34px;
          border: none;
          background: transparent;
          color: #ef4444;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .prod-delete-btn:hover:not(:disabled) {
          background-color: #fee2e2;
        }
        .inv-add-product-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
          background-color: #eff6ff;
          border: 1.5px dashed #93c5fd;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          max-width: 200px;
        }
        .inv-add-product-btn:hover {
          background-color: #dbeafe;
          border-color: #60a5fa;
        }

        /* Mobile Product Card Styles */
        .prod-item-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          background-color: #f8fafc;
        }
        .prod-item-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .prod-item-badge {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
        }
        .prod-card-delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #ef4444;
          background-color: #fee2e2;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .prod-card-delete-btn:hover:not(:disabled) {
          background-color: #fecaca;
        }
        .prod-card-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 4px;
        }
        .inv-card-input {
          box-sizing: border-box;
          width: 100%;
          height: 42px;
          padding: 0 12px;
          font-size: 15px;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #ffffff;
          outline: none;
        }
        .inv-card-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }
        .prod-card-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .prod-card-amount-box {
          height: 42px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        @media (max-width: 767px) {
          .prod-desktop-table {
            display: none !important;
          }
          .prod-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 14px;
            margin-bottom: 16px;
          }
          .inv-add-product-btn {
            max-width: 100% !important;
            height: 44px;
          }
          .inv-calc-container {
            align-items: stretch !important;
          }
          .inv-calc-box {
            width: 100% !important;
          }
        }
      `}</style>
    </form>
  );
}
