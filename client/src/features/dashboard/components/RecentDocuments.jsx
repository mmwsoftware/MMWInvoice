import { useNavigate } from "react-router-dom";

const recentDocs = [
  {
    type: "Sales Quotation",
    docNo: "MAX/2026/Q001",
    customer: "ABC Industries",
    date: "28 Sep 2026, 10:42 AM",
    amount: "₹8,00,000",
    status: "Generated",
  },
  {
    type: "Tax Invoice",
    docNo: "MAX/2026/0073",
    customer: "Gainwell Commosales",
    date: "28 Sep 2026, 10:31 AM",
    amount: "₹1,99,125",
    status: "Generated",
  },
  {
    type: "Sales Quotation",
    docNo: "MAX/2026/Q002",
    customer: "RMS Power",
    date: "27 Sep 2026, 04:12 PM",
    amount: "₹5,75,000",
    status: "Generated",
  },
];

function getTypeColor(type) {
  if (type === "Sales Quotation") return "#2563eb";
  if (type === "Tax Invoice") return "#059669";
  return "#7c3aed";
}

export default function RecentDocuments({ mounted }) {
  const navigate = useNavigate();

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
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <th className="rd-th">Document Type</th>
                  <th className="rd-th">Document No.</th>
                  <th className="rd-th">Customer</th>
                  <th className="rd-th">Date & Time</th>
                  <th className="rd-th">Amount</th>
                  <th className="rd-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc, idx) => (
                  <tr
                    key={idx}
                    className="rd-row"
                    style={{
                      borderBottom:
                        idx < recentDocs.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      animation: mounted
                        ? `rdRowFadeIn 0.4s ease-out ${0.3 + idx * 0.1}s both`
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
                      <span className="rd-status-badge">
                        <span
                          style={{
                            height: "6px",
                            width: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            display: "inline-block",
                          }}
                        />
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rdRowFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
          background-color: #ecfdf5;
          font-size: 13px;
          font-weight: 500;
          color: #047857;
        }
      `}</style>
    </>
  );
}
