function getTypeColor(type) {
  if (type === "Sales Quotation") return "#2563eb";
  if (type === "Tax Invoice") return "#059669";
  return "#7c3aed";
}

export default function HistoryTable({
  mounted,
  paginatedDocs,
  filteredCount,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <>
      <div
        style={{
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease-out 0.15s",
        }}
      >
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", minHeight: "380px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: "#f8fafc",
                  height: "45px",
                }}
              >
                <th className="ht-th" style={{ width: "17%" }}>Document Type</th>
                <th className="ht-th" style={{ width: "16%" }}>Document No.</th>
                <th className="ht-th" style={{ width: "23%" }}>Customer</th>
                <th className="ht-th" style={{ width: "18%" }}>Date & Time</th>
                <th className="ht-th" style={{ width: "12%" }}>Amount</th>
                <th className="ht-th" style={{ width: "8%" }}>Status</th>
                <th className="ht-th" style={{ width: "6%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.length > 0 ? (
                <>
                  {paginatedDocs.map((doc, idx) => (
                    <tr
                      key={idx}
                      className="ht-row ht-row-data"
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        animation: mounted
                          ? `htRowFadeIn 0.35s ease-out ${0.2 + idx * 0.06}s both`
                          : "none",
                      }}
                    >
                    <td className="ht-td">
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
                    <td className="ht-td">
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
                    <td className="ht-td">
                      <span style={{ fontSize: "14px", color: "#334155" }}>
                        {doc.customer}
                      </span>
                    </td>
                    <td className="ht-td">
                      <span style={{ fontSize: "14px", color: "#64748b" }}>
                        {doc.date}
                      </span>
                    </td>
                    <td className="ht-td">
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
                    <td className="ht-td">
                      <span className="ht-status-badge">
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
                    <td className="ht-td">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {/* View */}
                        <button className="ht-action-btn" title="View">
                          <svg
                            style={{ height: "16px", width: "16px" }}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        </button>

                        {/* Download */}
                        <button className="ht-action-btn" title="Download">
                          <svg
                            style={{ height: "16px", width: "16px" }}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                  {/* Empty placeholder rows to maintain fixed height on last page */}
                  {paginatedDocs.length < 5 &&
                    Array.from({ length: 5 - paginatedDocs.length }).map((_, i) => (
                      <tr
                        key={`empty-${i}`}
                        className="ht-row ht-row-empty"
                        style={{
                          borderBottom:
                            i < 4 - paginatedDocs.length
                              ? "1px solid #f8fafc"
                              : "none",
                        }}
                      >
                        <td colSpan={7} className="ht-td" style={{ color: "transparent" }}>
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <svg
                        style={{
                          height: "48px",
                          width: "48px",
                          color: "#cbd5e1",
                          margin: "0 auto 12px",
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        />
                      </svg>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "#64748b",
                        }}
                      >
                        No documents found
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "16px 20px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {/* Previous */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="ht-page-btn ht-page-nav"
              style={{
                opacity: currentPage === 1 ? 0.4 : 1,
                cursor: currentPage === 1 ? "default" : "pointer",
              }}
            >
              <svg
                style={{ height: "14px", width: "14px" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`ht-page-btn ${currentPage === page ? "ht-page-active" : ""}`}
                style={{
                  backgroundColor:
                    currentPage === page ? "#2563eb" : "transparent",
                  color: currentPage === page ? "#ffffff" : "#64748b",
                }}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ht-page-btn ht-page-nav"
              style={{
                opacity: currentPage === totalPages ? 0.4 : 1,
                cursor: currentPage === totalPages ? "default" : "pointer",
              }}
            >
              <svg
                style={{ height: "14px", width: "14px" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes htRowFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ht-th {
          padding: 12px 14px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .ht-td {
          padding: 12px 16px;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .ht-row {
          height: 67px;
        }
        .ht-row-data {
          transition: background-color 0.15s;
          cursor: pointer;
        }
        .ht-row-data:hover { background-color: #f8fafc; }
        .ht-row-empty {
          pointer-events: none;
          user-select: none;
        }
        .ht-status-badge {
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
        .ht-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          width: 34px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ht-action-btn:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
          color: #334155;
        }
        .ht-page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          width: 36px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .ht-page-btn:hover:not(.ht-page-active):not(:disabled) {
          background-color: #f1f5f9 !important;
        }
        .ht-page-active {
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
        }
        .ht-page-nav {
          color: #64748b;
          background-color: transparent;
        }
      `}</style>
    </>
  );
}
