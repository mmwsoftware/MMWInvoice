import React, { useState } from "react";
import InvoicePDFDocument from "./InvoicePDFDocument";

export default function PDFViewer({
  customerData,
  invoiceData,
  products,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showThumbnails, setShowThumbnails] = useState(true);

  const handleZoomIn = () => setZoom((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 10));
  const handleZoomReset = () => setZoom(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Downloading Tax Invoice ${invoiceData.invoiceNo}.pdf`);
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #1e293b",
        backgroundColor: "#525659",
        display: "flex",
        flexDirection: "column",
        height: "760px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      }}
    >
      {/* Top PDF Dark Toolbar */}
      <div
        style={{
          height: "46px",
          backgroundColor: "#323639",
          borderBottom: "1px solid #202224",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          color: "#ffffff",
          userSelect: "none",
          zIndex: 10,
        }}
      >
        {/* Left: Thumbnail toggle & Page Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="Toggle Thumbnails"
            className="pdf-tool-btn"
            style={{ color: showThumbnails ? "#60a5fa" : "#cbd5e1" }}
          >
            <svg style={{ height: "18px", width: "18px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pdf-tool-btn"
              style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
            >
              ‹
            </button>
            <span style={{ fontSize: "12px", fontWeight: 600, padding: "2px 6px", backgroundColor: "#202224", borderRadius: "4px" }}>
              {currentPage} / 2
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
              disabled={currentPage === 2}
              className="pdf-tool-btn"
              style={{ opacity: currentPage === 2 ? 0.3 : 1 }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleZoomOut} className="pdf-tool-btn" title="Zoom Out">
            −
          </button>
          <span
            onClick={handleZoomReset}
            style={{ fontSize: "12px", minWidth: "46px", textAlign: "center", cursor: "pointer" }}
            title="Reset Zoom"
          >
            {zoom}%
          </span>
          <button onClick={handleZoomIn} className="pdf-tool-btn" title="Zoom In">
            +
          </button>
          <div style={{ height: "16px", width: "1px", backgroundColor: "#4b5563", margin: "0 4px" }} />
          <button onClick={handleZoomReset} className="pdf-tool-btn" title="Fit to width">
            <svg style={{ height: "16px", width: "16px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleDownload} className="pdf-tool-btn" title="Download">
            <svg style={{ height: "17px", width: "17px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button onClick={handlePrint} className="pdf-tool-btn" title="Print">
            <svg style={{ height: "17px", width: "17px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Body: Thumbnails + Document Viewport */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Left Thumbnails Pane */}
        {showThumbnails && (
          <div
            style={{
              width: "120px",
              backgroundColor: "#202224",
              borderRight: "1px solid #18191a",
              overflowY: "auto",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {/* Page 1 Thumbnail */}
            <div
              onClick={() => setCurrentPage(1)}
              style={{
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "82px",
                  height: "105px",
                  backgroundColor: "#ffffff",
                  borderRadius: "3px",
                  border: currentPage === 1 ? "2.5px solid #3b82f6" : "1px solid #4b5563",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                  padding: "4px",
                  fontSize: "4px",
                  color: "#0f172a",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "5px" }}>MAXMOC</div>
                <div style={{ height: "2px", backgroundColor: "#e2e8f0", margin: "2px 0" }} />
                <div style={{ fontSize: "3.5px", color: "#64748b" }}>TAX INVOICE</div>
                <div style={{ height: "25px", backgroundColor: "#f8fafc", margin: "3px 0", border: "0.5px solid #e2e8f0" }} />
                <div style={{ height: "15px", backgroundColor: "#eff6ff", margin: "3px 0" }} />
              </div>
              <span style={{ fontSize: "11px", color: currentPage === 1 ? "#60a5fa" : "#94a3b8", marginTop: "4px", display: "inline-block" }}>
                1
              </span>
            </div>

            {/* Page 2 Thumbnail */}
            <div
              onClick={() => setCurrentPage(2)}
              style={{
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "82px",
                  height: "105px",
                  backgroundColor: "#ffffff",
                  borderRadius: "3px",
                  border: currentPage === 2 ? "2.5px solid #3b82f6" : "1px solid #4b5563",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                  padding: "4px",
                  fontSize: "4px",
                  color: "#0f172a",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "5px" }}>TERMS</div>
                <div style={{ height: "2px", backgroundColor: "#e2e8f0", margin: "2px 0" }} />
                <div style={{ height: "35px", backgroundColor: "#f8fafc", margin: "3px 0", border: "0.5px solid #e2e8f0" }} />
                <div style={{ height: "10px", backgroundColor: "#f1f5f9", margin: "3px 0" }} />
              </div>
              <span style={{ fontSize: "11px", color: currentPage === 2 ? "#60a5fa" : "#94a3b8", marginTop: "4px", display: "inline-block" }}>
                2
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Document Viewport */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            padding: "24px 20px 48px 20px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#525659",
          }}
        >
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
            }}
          >
            <InvoicePDFDocument
              customerData={customerData}
              invoiceData={invoiceData}
              products={products}
              page={currentPage}
            />
          </div>
        </div>
      </div>

      <style>{`
        .pdf-tool-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          min-width: 30px;
          padding: 0 6px;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: #e2e8f0;
          cursor: pointer;
          font-size: 15px;
          transition: background 0.15s;
        }
        .pdf-tool-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
}
