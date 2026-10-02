import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoicesApi, quotationsApi } from "../../../services/api";

function getTypeColor(type) {
  if (type === "Sales Quotation") return "#2563eb";
  if (type === "Tax Invoice") return "#059669";
  return "#7c3aed";
}

function getTimestamp(...values) {
  const value = values.find(Boolean);
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function RecentDocuments({ mounted }) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentDocs() {
      try {
        setLoading(true);
        const [quotationsResult, invoicesResult] = await Promise.allSettled([
          quotationsApi.list({ limit: 5 }),
          invoicesApi.list({ limit: 5 }),
        ]);

        if (quotationsResult.status === "rejected") {
          console.error(
            "Failed to load recent quotations:",
            quotationsResult.reason,
          );
        }
        if (invoicesResult.status === "rejected") {
          console.error(
            "Failed to load recent invoices:",
            invoicesResult.reason,
          );
        }

        const quotations =
          quotationsResult.status === "fulfilled" &&
          Array.isArray(quotationsResult.value)
            ? quotationsResult.value.map((doc) => ({
                id: doc.id,
                type: "Sales Quotation",
                docNo: doc.quotation_number || `Draft #${doc.id}`,
                customer: doc.customer?.name || `Customer #${doc.customer_id}`,
                date:
                  doc.quotation_date ||
                  (doc.created_at
                    ? new Date(doc.created_at).toLocaleDateString("en-IN")
                    : "-"),
                amount: doc.total_amount
                  ? `₹${Number(doc.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                  : "₹0.00",
                status: doc.status,
                timestamp: getTimestamp(
                  doc.issued_at,
                  doc.created_at,
                  doc.quotation_date,
                ),
              }))
            : [];

        const invoices =
          invoicesResult.status === "fulfilled" &&
          Array.isArray(invoicesResult.value)
            ? invoicesResult.value.map((doc) => ({
                id: doc.id,
                type: "Tax Invoice",
                docNo: doc.invoice_number || `Draft #${doc.id}`,
                customer: doc.customer?.name || `Customer #${doc.customer_id}`,
                date:
                  doc.invoice_date ||
                  (doc.created_at
                    ? new Date(doc.created_at).toLocaleDateString("en-IN")
                    : "-"),
                amount: doc.total_amount
                  ? `₹${Number(doc.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                  : "₹0.00",
                status: doc.status,
                timestamp: getTimestamp(
                  doc.issued_at,
                  doc.created_at,
                  doc.invoice_date,
                ),
              }))
            : [];

        setDocuments(
          [...quotations, ...invoices]
            .sort((left, right) => right.timestamp - left.timestamp)
            .slice(0, 5),
        );
      } catch (err) {
        console.error("Failed to load recent documents:", err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    loadRecentDocs();
  }, []);

  const handleRowClick = async (doc) => {
    if (doc.status === "issued") {
      try {
        const documentsApi =
          doc.type === "Tax Invoice" ? invoicesApi : quotationsApi;
        await documentsApi.viewPdfInNewTab(doc.id);
      } catch (err) {
        console.error("Failed to view PDF:", err);
      }
    } else {
      navigate(
        doc.type === "Tax Invoice"
          ? "/dashboard/invoice"
          : "/dashboard/quotation",
      );
    }
  };

  return (
    <>
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s ease-out 0.2s",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Recent Documents
          </h2>
          <button
            onClick={() => navigate("/dashboard/history")}
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#2563eb",
              border: "none",
              background: "none",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            className="rd-view-history-btn"
          >
            View History →
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            overflow: "hidden",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "750px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <th className="rd-th" style={{ width: "18%" }}>
                    Document Type
                  </th>
                  <th className="rd-th" style={{ width: "18%" }}>
                    Document No.
                  </th>
                  <th className="rd-th" style={{ width: "26%" }}>
                    Customer
                  </th>
                  <th className="rd-th" style={{ width: "20%" }}>
                    Date
                  </th>
                  <th className="rd-th" style={{ width: "10%" }}>
                    Amount
                  </th>
                  <th className="rd-th" style={{ width: "8%" }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "36px 20px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length > 0 ? (
                  documents.map((doc, idx) => {
                    const isIssued = doc.status === "issued";

                    return (
                      <tr
                        key={doc.id || idx}
                        className="rd-row"
                        onClick={() => handleRowClick(doc)}
                        style={{
                          borderBottom:
                            idx < documents.length - 1
                              ? "1px solid #f1f5f9"
                              : "none",
                        }}
                      >
                        <td className="rd-td">
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: getTypeColor(doc.type),
                            }}
                          >
                            {doc.type}
                          </span>
                        </td>
                        <td className="rd-td">
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#475569",
                              fontFamily:
                                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                            }}
                          >
                            {doc.docNo}
                          </span>
                        </td>
                        <td className="rd-td">
                          <span style={{ fontSize: "14px", color: "#334155" }}>
                            {doc.customer}
                          </span>
                        </td>
                        <td className="rd-td">
                          <span style={{ fontSize: "14px", color: "#64748b" }}>
                            {doc.date}
                          </span>
                        </td>
                        <td className="rd-td">
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1e293b",
                            }}
                          >
                            {doc.amount}
                          </span>
                        </td>
                        <td className="rd-td">
                          <span
                            className="rd-status-badge"
                            style={{
                              backgroundColor: isIssued ? "#ecfdf5" : "#fef3c7",
                              color: isIssued ? "#047857" : "#b45309",
                            }}
                          >
                            <span
                              style={{
                                height: "6px",
                                width: "6px",
                                borderRadius: "50%",
                                backgroundColor: isIssued
                                  ? "#10b981"
                                  : "#f59e0b",
                                display: "inline-block",
                              }}
                            />
                            {isIssued ? "Generated" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "48px 20px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <p
                        style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}
                      >
                        No documents generated yet
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        Create a tax invoice or quotation to see it here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .rd-view-history-btn:hover { color: #1d4ed8; }
        .rd-th {
          padding: 14px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .rd-td { padding: 16px 20px; }
        .rd-row {
          transition: background-color 0.15s;
          cursor: pointer;
        }
        .rd-row:hover { background-color: #f8fafc; }
        .rd-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
