import React, { useState } from "react";
import QuotationPDFDocument from "./QuotationPDFDocument";

export default function QuotationPDFViewer({
  letterData,
  quotationData,
  products,
}) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 10));
  const handleZoomReset = () => setZoom(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Downloading Sales Quotation ${quotationData.quoteNo}.pdf`);
  };

  return (
    <div
      className="qpdf-viewer-container"
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
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          gap: "16px",
        }}
      >
        {/* Left: Document Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", flexShrink: 0 }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#93c5fd" }}>
            SALES QUOTATION
          </span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#e2e8f0" }}>
            {quotationData.quoteNo}
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button onClick={handleZoomOut} className="qpdf-tool-btn" title="Zoom Out">
            −
          </button>
          <span
            onClick={handleZoomReset}
            style={{ fontSize: "12px", minWidth: "46px", textAlign: "center", cursor: "pointer" }}
            title="Reset Zoom"
          >
            {zoom}%
          </span>
          <button onClick={handleZoomIn} className="qpdf-tool-btn" title="Zoom In">
            +
          </button>
          <div style={{ height: "16px", width: "1px", backgroundColor: "#4b5563", margin: "0 4px" }} />
          <button onClick={handleZoomReset} className="qpdf-tool-btn" title="Fit to width">
            <svg style={{ height: "16px", width: "16px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button onClick={handleDownload} className="qpdf-tool-btn" title="Download">
            <svg style={{ height: "17px", width: "17px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button onClick={handlePrint} className="qpdf-tool-btn" title="Print">
            <svg style={{ height: "17px", width: "17px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
          padding: "24px 20px 48px 20px",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#525659",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
          }}
        >
          <QuotationPDFDocument
            letterData={letterData}
            quotationData={quotationData}
            products={products}
          />
        </div>
      </div>

      <style>{`
        .qpdf-tool-btn {
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
        .qpdf-tool-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.12);
        }
        @media (max-width: 640px) {
          .qpdf-viewer-container {
            height: 560px !important;
          }
        }
      `}</style>
    </div>
  );
}
