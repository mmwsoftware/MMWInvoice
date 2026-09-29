import { useState, useEffect } from "react";
import HistoryFilters from "../components/HistoryFilters";
import HistoryTable from "../components/HistoryTable";

const allDocuments = [
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
  {
    type: "Tax Invoice",
    docNo: "MAX/2026/0072",
    customer: "KPR Engineering",
    date: "25 Sep 2026, 11:20 AM",
    amount: "₹2,48,000",
    status: "Generated",
  },
  {
    type: "Sales Quotation",
    docNo: "MAX/2026/Q001",
    customer: "Sri Venkateswara",
    date: "24 Sep 2026, 03:15 PM",
    amount: "₹4,20,000",
    status: "Generated",
  },
  {
    type: "Proforma Invoice",
    docNo: "MAX/2026/P001",
    customer: "Lakshmi Motors",
    date: "23 Sep 2026, 09:45 AM",
    amount: "₹3,50,000",
    status: "Generated",
  },
  {
    type: "Tax Invoice",
    docNo: "MAX/2026/0071",
    customer: "Bharat Electricals",
    date: "22 Sep 2026, 02:30 PM",
    amount: "₹6,12,000",
    status: "Generated",
  },
];

export default function History() {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  // Filter logic
  const filteredDocuments = allDocuments.filter((doc) => {
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

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
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
      />
    </div>
  );
}
