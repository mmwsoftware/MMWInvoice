import HistoryDateRange from "./HistoryDateRange";

const filters = ["All", "Sales Quotations", "Tax Invoices", "Proforma Invoices"];

export default function HistoryFilters({
  mounted,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  setCurrentPage,
}) {
  return (
    <>
      <div
        style={{
          position: "relative",
          zIndex: 100,
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
            maxWidth: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          className="hf-tabs-scroll"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
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
        <div
          style={{
            position: "relative",
            flex: "1",
            minWidth: "240px",
          }}
        >
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
        <HistoryDateRange
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
        />
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
      `}</style>
    </>
  );
}