import React from "react";
import { numberToIndianWords } from "../../invoice/utils/numberToWords";

export default function QuotationProductTable({
  products,
  onChangeProduct,
  onAddProduct,
  onRemoveProduct,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  const totalAmount = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const amountInWords = numberToIndianWords(Math.round(totalAmount));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (products.length === 0) {
      alert("Please add at least one product item.");
      return;
    }
    const hasEmpty = products.some(
      (p) => !p.description?.trim() || !p.quantity || !p.rate
    );
    if (hasEmpty) {
      alert("Please fill in Description, Quantity, and Rate for all items.");
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

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <th className="qprod-th" style={{ width: "45px", textAlign: "center" }}>
                S.No.
              </th>
              <th className="qprod-th" style={{ minWidth: "220px" }}>
                Description
              </th>
              <th className="qprod-th" style={{ width: "110px" }}>
                HSN/SAC Code
              </th>
              <th className="qprod-th" style={{ width: "85px" }}>
                UOM
              </th>
              <th className="qprod-th" style={{ width: "80px", textAlign: "center" }}>
                Qty
              </th>
              <th className="qprod-th" style={{ width: "130px", textAlign: "right" }}>
                Rate Per Unit (₹)
              </th>
              <th className="qprod-th" style={{ width: "130px", textAlign: "right" }}>
                Amount (INR)
              </th>
              <th className="qprod-th" style={{ width: "45px", textAlign: "center" }}>
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
                    className="qprod-td"
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Description */}
                  <td className="qprod-td">
                    <input
                      type="text"
                      required
                      placeholder="Item description"
                      value={item.description || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "description", e.target.value)
                      }
                      className="quot-table-input"
                    />
                  </td>

                  {/* HSN/SAC */}
                  <td className="qprod-td">
                    <input
                      type="text"
                      placeholder="e.g. 84041000"
                      value={item.hsn || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "hsn", e.target.value)
                      }
                      className="quot-table-input font-mono"
                    />
                  </td>

                  {/* UOM */}
                  <td className="qprod-td">
                    <select
                      value={item.uom || "Nos"}
                      onChange={(e) =>
                        onChangeProduct(idx, "uom", e.target.value)
                      }
                      className="quot-table-input"
                      style={{ padding: "0 6px", cursor: "pointer" }}
                    >
                      <option value="Nos">Nos</option>
                      <option value="Sets">Sets</option>
                      <option value="Units">Units</option>
                      <option value="Mtrs">Mtrs</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Hrs">Hrs</option>
                      <option value="Lot">Lot</option>
                    </select>
                  </td>

                  {/* Quantity */}
                  <td className="qprod-td">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity || ""}
                      onChange={(e) =>
                        onChangeProduct(idx, "quantity", e.target.value)
                      }
                      className="quot-table-input"
                      style={{ textAlign: "center" }}
                    />
                  </td>

                  {/* Rate */}
                  <td className="qprod-td">
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
                      className="quot-table-input"
                      style={{ textAlign: "right" }}
                    />
                  </td>

                  {/* Amount */}
                  <td
                    className="qprod-td"
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
                  <td className="qprod-td" style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(idx)}
                      disabled={products.length <= 1}
                      title="Delete Item"
                      className="qprod-delete-btn"
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

      {/* Add Product Button */}
      <button
        type="button"
        onClick={onAddProduct}
        className="quot-add-product-btn"
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>+</span> Add Product
      </button>

      {/* Total Amount Summary */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          marginTop: "16px",
        }}
      >
        <div style={{ width: "260px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              borderTop: "2px solid #e2e8f0",
              paddingTop: "10px",
            }}
          >
            <span>Total Amount</span>
            <span style={{ color: "#2563eb", fontSize: "19px" }}>
              ₹
              {totalAmount.toLocaleString("en-IN", {
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
          className="quot-btn-back"
        >
          ← Back
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            className="quot-btn-secondary"
          >
            Save Draft
          </button>
          <button type="submit" className="quot-btn-primary">
            Preview →
          </button>
        </div>
      </div>

      <style>{`
        .qprod-th {
          padding: 12px 14px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.02em;
        }
        .qprod-td {
          padding: 8px 10px;
        }
        .quot-table-input {
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
        .quot-table-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .qprod-delete-btn {
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
        .qprod-delete-btn:hover:not(:disabled) {
          background-color: #fee2e2;
        }
        .quot-add-product-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
          background-color: #ffffff;
          border: 1.5px solid #2563eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quot-add-product-btn:hover {
          background-color: #eff6ff;
        }
      `}</style>
    </form>
  );
}
