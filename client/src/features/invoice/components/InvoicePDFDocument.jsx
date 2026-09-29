import React from "react";
import { numberToIndianWords } from "../utils/numberToWords";

export default function InvoicePDFDocument({
  customerData,
  invoiceData,
  products,
  page = 1,
}) {
  const subTotal = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const isInterState = customerData.stateCode !== "33";
  const taxRate = 0.18;
  const totalTax = subTotal * taxRate;
  const grandTotal = Math.round(subTotal + totalTax);
  const amountInWords = numberToIndianWords(grandTotal);

  if (page === 2) {
    return (
      <div className="pdf-paper">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1d4ed8", margin: 0, letterSpacing: "0.05em" }}>
              MAXMOC MOTOR WORKS
            </h2>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
              India Private Limited • Terms & Conditions (Page 2 of 2)
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "11px", color: "#64748b" }}>
            Invoice Ref: <strong>{invoiceData.invoiceNo}</strong>
          </div>
        </div>

        {/* Terms & Warranty Details */}
        <div style={{ fontSize: "11px", color: "#334155", lineHeight: "1.7" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            General Terms of Sale & Service
          </h4>
          <ol style={{ paddingLeft: "16px", margin: 0 }}>
            <li><strong>Payment Terms:</strong> Payment should be made within 30 days from the invoice date. Delayed payments will attract 18% p.a. interest.</li>
            <li><strong>Warranty:</strong> Equipment supplied is covered under warranty for 12 months from the date of commissioning or 18 months from supply, whichever is earlier.</li>
            <li><strong>Inspection:</strong> Inspection of goods must be carried out upon receipt. Any transit damages must be reported within 48 hours.</li>
            <li><strong>Jurisdiction:</strong> All disputes are subject to Chennai jurisdiction only.</li>
            <li><strong>Title & Risk:</strong> Title to the goods remains with the seller until full payment is realized.</li>
          </ol>

          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "24px", marginBottom: "8px" }}>
            Bank & Remittance Details
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <p style={{ margin: "2px 0" }}><strong>Bank Name:</strong> HDFC Bank Ltd</p>
              <p style={{ margin: "2px 0" }}><strong>Account Name:</strong> Maxmoc Motor Works India Pvt Ltd</p>
              <p style={{ margin: "2px 0" }}><strong>Account Number:</strong> 50200034829103</p>
            </div>
            <div>
              <p style={{ margin: "2px 0" }}><strong>IFSC Code:</strong> HDFC0001244</p>
              <p style={{ margin: "2px 0" }}><strong>Branch:</strong> Ambattur Industrial Estate, Chennai</p>
              <p style={{ margin: "2px 0" }}><strong>Account Type:</strong> Current Account</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px", paddingTop: "20px" }}>
            <div style={{ textAlign: "center", width: "180px" }}>
              <div style={{ height: "45px" }} />
              <div style={{ borderTop: "1px dashed #94a3b8", paddingTop: "6px", fontSize: "10px", color: "#64748b" }}>
                Customer's Acceptance Signature
              </div>
            </div>
            <div style={{ textAlign: "center", width: "200px" }}>
              <div style={{ height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", fontStyle: "italic" }}>Maxmoc Auth Sign</span>
              </div>
              <div style={{ borderTop: "1px solid #0f172a", paddingTop: "6px", fontSize: "11px", fontWeight: 600, color: "#0f172a" }}>
                For MAXMOC MOTOR WORKS INDIA PVT LTD
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page 1
  return (
    <div className="pdf-paper">
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", letterSpacing: "0.05em" }}>
              MAXMOC
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              MOTOR WORKS
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "#475569", margin: "1px 0" }}>
            <strong>Maxmoc Motor Works India Private Limited</strong>
          </p>
          <p style={{ fontSize: "9.5px", color: "#64748b", margin: "1px 0", maxWidth: "340px" }}>
            Plot No. 45, Ambattur Industrial Estate, Chennai - 600058, Tamil Nadu
          </p>
          <p style={{ fontSize: "9.5px", color: "#64748b", margin: "1px 0" }}>
            GSTIN: <strong>33AAAAA0000A1Z5</strong> • CIN: U29100TN2020PTC123456
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "0.04em" }}>
            TAX INVOICE
          </h1>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "4px", border: "1px solid #bfdbfe" }}>
            ORIGINAL FOR RECIPIENT
          </span>
          <p style={{ fontSize: "10px", color: "#64748b", margin: "6px 0 0 0" }}>
            Page <strong>1 of 2</strong>
          </p>
        </div>
      </div>

      {/* Two Column Bill To & Invoice Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden", marginBottom: "12px", fontSize: "10.5px" }}>
        {/* Bill To */}
        <div style={{ padding: "10px 12px", borderRight: "1px solid #cbd5e1", backgroundColor: "#fafbfc" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>
            Details of Receiver (Billed To):
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "3px" }}>
            {customerData.customerName || "Customer Name"}
          </div>
          <div style={{ color: "#334155", whiteSpace: "pre-line", marginBottom: "4px", lineHeight: "1.4" }}>
            {customerData.address || "Customer Address"}
          </div>
          <div style={{ color: "#475569" }}>
            <span>State: <strong>{customerData.stateCode}</strong></span>
            <span style={{ margin: "0 6px" }}>|</span>
            <span>GSTIN/UIN: <strong style={{ fontFamily: "monospace" }}>{customerData.gstin || "—"}</strong></span>
          </div>
        </div>

        {/* Invoice Meta */}
        <div style={{ padding: "10px 12px", backgroundColor: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
            <tbody>
              <tr>
                <td style={{ color: "#64748b", padding: "2px 0" }}>Invoice No:</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{invoiceData.invoiceNo}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b", padding: "2px 0" }}>Invoice Date:</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>{invoiceData.invoiceDate}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b", padding: "2px 0" }}>Buyer's PO/WO No:</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>{invoiceData.poNo || "—"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b", padding: "2px 0" }}>PO Date:</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>{invoiceData.poDate || "—"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b", padding: "2px 0" }}>Place of Supply:</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>{customerData.stateCode}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cbd5e1", marginBottom: "12px", fontSize: "10.5px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
            <th style={{ padding: "6px 8px", width: "35px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>S.No</th>
            <th style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Description of Goods / Services</th>
            <th style={{ padding: "6px 8px", width: "75px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>HSN/SAC</th>
            <th style={{ padding: "6px 8px", width: "45px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Qty</th>
            <th style={{ padding: "6px 8px", width: "85px", textAlign: "right", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Rate (₹)</th>
            <th style={{ padding: "6px 8px", width: "95px", textAlign: "right", fontWeight: 700 }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, idx) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const amount = qty * rate;

            return (
              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", textAlign: "center", borderRight: "1px solid #cbd5e1", color: "#64748b" }}>{idx + 1}</td>
                <td style={{ padding: "8px", textAlign: "left", borderRight: "1px solid #cbd5e1", fontWeight: 600, color: "#0f172a" }}>
                  {item.description}
                </td>
                <td style={{ padding: "8px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontFamily: "monospace", color: "#475569" }}>
                  {item.hsn || "—"}
                </td>
                <td style={{ padding: "8px", textAlign: "center", borderRight: "1px solid #cbd5e1", color: "#334155" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "8px", textAlign: "right", borderRight: "1px solid #cbd5e1", color: "#334155" }}>
                  {rate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                  {amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Tax Calculation & Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px", fontSize: "10.5px" }}>
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            Amount in Words:
          </div>
          <div style={{ color: "#334155", fontStyle: "italic", lineHeight: "1.4", padding: "6px 8px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
            {amountInWords}
          </div>

          <div style={{ marginTop: "10px", fontSize: "9.5px", color: "#64748b" }}>
            <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </div>
        </div>

        <div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
            <tbody>
              <tr>
                <td style={{ color: "#475569", padding: "3px 0" }}>Sub Total:</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                  ₹{subTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </td>
              </tr>
              {isInterState ? (
                <tr>
                  <td style={{ color: "#475569", padding: "3px 0" }}>IGST @ 18%:</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                    ₹{totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td style={{ color: "#475569", padding: "3px 0" }}>CGST @ 9%:</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                      ₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#475569", padding: "3px 0" }}>SGST @ 9%:</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "#0f172a" }}>
                      ₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </>
              )}
              <tr style={{ borderTop: "1.5px solid #0f172a" }}>
                <td style={{ fontWeight: 800, color: "#0f172a", paddingTop: "6px", fontSize: "12px" }}>
                  Total Invoice Value:
                </td>
                <td style={{ textAlign: "right", fontWeight: 800, color: "#0f172a", paddingTop: "6px", fontSize: "13px" }}>
                  ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Signatory Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "16px", paddingTop: "10px", fontSize: "10px" }}>
        <div style={{ color: "#64748b" }}>
          Electronic document generated on {new Date().toLocaleDateString("en-IN")}
        </div>
        <div style={{ textAlign: "center", width: "220px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#0f172a", marginBottom: "35px" }}>
            For MAXMOC MOTOR WORKS INDIA PVT LTD
          </div>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "4px", fontSize: "10px", color: "#64748b" }}>
            Authorized Signatory
          </div>
        </div>
      </div>

      <style>{`
        .pdf-paper {
          background-color: #ffffff;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 32px 36px;
          border-radius: 4px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 860px;
          box-sizing: border-box;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}
