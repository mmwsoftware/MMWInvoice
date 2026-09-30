import React, { useState, useEffect } from "react";
import HistoryFilters from "../components/HistoryFilters";
import HistoryTable from "../components/HistoryTable";
import { quotationsApi, invoicesApi } from "../../../services/api";

export default function History() {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch quotations (and invoices if needed)
      const quotData = await quotationsApi.list();
      let combined = [];

      if (Array.isArray(quotData)) {
        combined = quotData.map((q) => ({
          id: q.id,
          type: "Sales Quotation",
          docNo: q.quotation_number || `Draft #${q.id}`,
          customer: q.customer?.name || `Customer #${q.customer_id}`,
          date: q.quotation_date || (q.created_at ? new Date(q.created_at).toLocaleDateString("en-IN") : "-"),
          amount: q.total_amount
            ? `₹${Number(q.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : "₹0.00",
          status: q.status === "issued" ? "Generated" : "Draft",
          rawStatus: q.status,
        }));
      }

      // Try fetching invoices as well if endpoint available
      try {
        const invData = await invoicesApi.list();
        if (Array.isArray(invData)) {
          const formattedInv = invData.map((inv) => ({
            id: inv.id,
            type: "Tax Invoice",
            docNo: inv.invoice_number || `Draft #${inv.id}`,
            customer: inv.customer?.name || `Customer #${inv.customer_id}`,
            date: inv.invoice_date || (inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "-"),
            amount: inv.total_amount
              ? `₹${Number(inv.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
              : "₹0.00",
            status: inv.status === "issued" ? "Generated" : "Draft",
            rawStatus: inv.status,
          }));
          combined = [...combined, ...formattedInv];
        }
      } catch {
        // Invoice list error ignored for now
      }

      // Sort by id descending
      combined.sort((a, b) => b.id - a.id);
      setDocuments(combined);
    } catch (err) {
      console.error("Failed to fetch documents for history:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Sales Quotations" && doc.type === "Sales Quotation") ||
      (activeFilter === "Tax Invoices" && doc.type === "Tax Invoice") ||
      (activeFilter === "Proforma Invoices" && doc.type === "Proforma Invoice");

    const matchesSearch =
      searchQuery === "" ||
      doc.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const paginatedDocs = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleDelete = async (doc) => {
    const isSure = window.confirm(
      `Are you sure you want to delete ${doc.type} "${doc.docNo}"?\nThis will permanently remove the record and its PDF.`
    );
    if (!isSure) return;

    try {
      if (doc.type === "Sales Quotation") {
        await quotationsApi.delete(doc.id);
      } else {
        await invoicesApi.delete(doc.id);
      }
      setToastMessage(`${doc.type} "${doc.docNo}" deleted successfully.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      await fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.detail || err.message || "Failed to delete document.");
    }
  };

  return (
    <div
      className="history-container"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      {/* Toast Alert */}
      {showToast && (
        <div className="hist-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          marginBottom: "28px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease-out",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}
        >
          Document History
        </h1>
        <p
          style={{
            marginTop: "6px",
            fontSize: "15px",
            color: "#64748b",
          }}
        >
          View and manage your generated quotations and invoices.
        </p>
      </div>

      {/* Filters & Search */}
      <HistoryFilters
        mounted={mounted}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
      />

      {/* Table */}
      <HistoryTable
        mounted={mounted}
        paginatedDocs={paginatedDocs}
        filteredCount={filteredDocuments.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        loading={loading}
        onDelete={handleDelete}
      />

      <style>{`
        .hist-toast {
          position: fixed;
          top: 80px;
          right: 28px;
          z-index: 100;
          background-color: #1e293b;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          animation: histSlideIn 0.3s ease-out;
        }
        @keyframes histSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .history-container {
            padding: 20px 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
