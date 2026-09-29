import React from "react";
import { numberToIndianWords } from "../../invoice/utils/numberToWords";

export default function QuotationPDFDocument({
  letterData,
  quotationData,
  products,
}) {
  const totalAmount = products.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const amountInWords = numberToIndianWords(Math.round(totalAmount));

  return (
    <div className="quot-pdf-paper">
      {/* Top Letterhead */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "16px" }}>
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
            Email: sales@maxmoc.com • Phone: +91 44 2625 1100
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "0.04em" }}>
            SALES QUOTATION
          </h1>
          <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0" }}>
            Quote Ref: <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>{quotationData.quoteNo}</strong>
          </p>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0" }}>
            Date: <strong>{quotationData.quoteDate || letterData.date}</strong>
          </p>
        </div>
      </div>

      {/* Recipient Details & Subject */}
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "12px 14px", backgroundColor: "#fafbfc", marginBottom: "16px", fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>
              Quotation Prepared For:
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "3px" }}>
              {quotationData.companyName || letterData.companyName}
            </div>
            <div style={{ color: "#334155", whiteSpace: "pre-line", lineHeight: "1.4", marginBottom: "4px" }}>
              {quotationData.address || letterData.address}
            </div>
            {quotationData.gstin && (
              <div style={{ color: "#64748b" }}>
                GSTIN: <strong style={{ fontFamily: "monospace" }}>{quotationData.gstin}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
          <span style={{ fontWeight: 700, color: "#0f172a" }}>Subject: </span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{letterData.subject}</span>
        </div>
      </div>

      {/* Quotation Greeting & Intro */}
      <div style={{ fontSize: "11px", color: "#334155", marginBottom: "14px", lineHeight: "1.5" }}>
        <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>Dear Sir / Madam,</p>
        <p style={{ margin: 0 }}>
          With reference to your inquiry, we are pleased to submit our most competitive quotation for the supply of equipment/services as detailed below:
        </p>
      </div>

      {/* Products Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cbd5e1", marginBottom: "14px", fontSize: "10.5px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
            <th style={{ padding: "6px 8px", width: "35px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>S.No</th>
            <th style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Description</th>
            <th style={{ padding: "6px 8px", width: "80px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>HSN/SAC</th>
            <th style={{ padding: "6px 8px", width: "50px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>UOM</th>
            <th style={{ padding: "6px 8px", width: "45px", textAlign: "center", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Qty</th>
            <th style={{ padding: "6px 8px", width: "90px", textAlign: "right", borderRight: "1px solid #cbd5e1", fontWeight: 700 }}>Rate (₹)</th>
            <th style={{ padding: "6px 8px", width: "100px", textAlign: "right", fontWeight: 700 }}>Amount (INR)</th>
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
                <td style={{ padding: "8px", textAlign: "center", borderRight: "1px solid #cbd5e1", color: "#475569" }}>
                  {item.uom || "Nos"}
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

      {/* Total Amount & Amount in Words */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px", fontSize: "10.5px" }}>
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            Amount in Words:
          </div>
          <div style={{ color: "#334155", fontStyle: "italic", lineHeight: "1.4", padding: "6px 8px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
            {amountInWords}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <span style={{ fontWeight: 800, fontSize: "13px", color: "#0f172a" }}>Total Amount:</span>
            <span style={{ fontWeight: 900, fontSize: "16px", color: "#2563eb" }}>
              ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div style={{ fontSize: "10px", color: "#475569", lineHeight: "1.6", marginBottom: "24px" }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Commercial Terms & Conditions:</div>
        <ol style={{ paddingLeft: "16px", margin: 0 }}>
          <li><strong>Validity:</strong> This quotation is valid for 30 days from the date of issue.</li>
          <li><strong>Delivery:</strong> 2 to 3 weeks from the date of confirmed Purchase Order.</li>
          <li><strong>Payment Terms:</strong> 30% advance along with order, balance against delivery.</li>
        </ol>
      </div>

      {/* Footer Signatory Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", paddingTop: "10px", fontSize: "10px" }}>
        <div style={{ color: "#64748b" }}>
          Thanking you and assuring you of our best services at all times.
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
        .quot-pdf-paper {
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
