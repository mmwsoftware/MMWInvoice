const filters = ["All", "Sales Quotations", "Tax Invoices", "Proforma Invoices"];

export default function HistoryFilters({
  mounted,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease-out 0.1s",
        }}
      >
        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setCurrentPage(1);
              }}
              className="hf-filter-tab"
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor:
                  activeFilter === filter ? "#ffffff" : "transparent",
                color: activeFilter === filter ? "#1d4ed8" : "#64748b",
                boxShadow:
                  activeFilter === filter
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", flex: "1", minWidth: "240px" }}>
          <svg
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              height: "16px",
              width: "16px",
              color: "#94a3b8",
            }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by customer, document number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="hf-search-input"
            style={{
              width: "100%",
              height: "40px",
              paddingLeft: "40px",
              paddingRight: "16px",
              fontSize: "14px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              color: "#334155",
              outline: "none",
              transition: "all 0.2s",
            }}
          />
        </div>

        {/* Date Range Picker */}
        <button
          className="hf-date-range-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 16px",
            fontSize: "14px",
            color: "#64748b",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          Select date range
        </button>
      </div>

      <style>{`
        .hf-filter-tab:hover {
          color: #334155 !important;
        }
        .hf-search-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .hf-search-input::placeholder {
          color: #94a3b8;
        }
        .hf-date-range-btn:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc !important;
        }
      `}</style>
    </>
  );
}
