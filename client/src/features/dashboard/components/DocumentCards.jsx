import { useNavigate } from "react-router-dom";

const cardsData = [
  {
    title: "Sales Quotation",
    description: "Create a professional quotation for your customer.",
    btnText: "Create Quotation",
    route: "/dashboard/quotation",
    colorClass: "blue",
    bgCircle: "rgba(219, 234, 254, 0.7)",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    btnBg: "#2563eb",
    btnShadow: "rgba(37, 99, 235, 0.25)",
    icon: (
      <svg style={{ height: "26px", width: "26px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Tax Invoice",
    description: "Generate a tax invoice with automatic calculations.",
    btnText: "Create Tax Invoice",
    route: "/dashboard/invoice",
    colorClass: "green",
    bgCircle: "rgba(209, 250, 229, 0.7)",
    iconBg: "#d1fae5",
    iconColor: "#059669",
    btnBg: "#059669",
    btnShadow: "rgba(5, 150, 105, 0.25)",
    icon: (
      <svg style={{ height: "26px", width: "26px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  // {
  //   title: "Proforma Invoice",
  //   description: "Create a proforma invoice for advance payments.",
  //   btnText: "Create Proforma",
  //   route: "/dashboard/proforma",
  //   colorClass: "purple",
  //   bgCircle: "rgba(237, 233, 254, 0.7)",
  //   iconBg: "#ede9fe",
  //   iconColor: "#7c3aed",
  //   btnBg: "#7c3aed",
  //   btnShadow: "rgba(124, 58, 237, 0.25)",
  //   icon: (
  //     <svg style={{ height: "26px", width: "26px" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  //       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  //     </svg>
  //   ),
  // },
];

export default function DocumentCards({ mounted }) {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginBottom: "40px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s ease-out 0.1s",
        }}
        className="doc-cards-grid"
      >
        {cardsData.map((card, idx) => (
          <div key={idx} className={`doc-card doc-card-${card.colorClass}`}>
            <div
              className="doc-card-bg-circle"
              style={{ backgroundColor: card.bgCircle }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    width: "48px",
                    flexShrink: 0,
                    borderRadius: "14px",
                    backgroundColor: card.iconBg,
                    color: card.iconColor,
                    transition: "all 0.3s",
                  }}
                  className="doc-card-icon"
                >
                  {card.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(card.route)}
                className="doc-card-btn"
                style={{
                  backgroundColor: card.btnBg,
                  boxShadow: `0 2px 8px ${card.btnShadow}`,
                }}
              >
                {card.btnText}
                <svg
                  style={{ height: "16px", width: "16px" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .doc-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          padding: 24px;
          transition: all 0.3s ease;
          cursor: default;
        }
        .doc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }
        .doc-card-blue:hover {
          border-color: #bfdbfe;
          box-shadow: 0 12px 40px rgba(37, 99, 235, 0.08);
        }
        .doc-card-green:hover {
          border-color: #a7f3d0;
          box-shadow: 0 12px 40px rgba(5, 150, 105, 0.08);
        }
        .doc-card-purple:hover {
          border-color: #c4b5fd;
          box-shadow: 0 12px 40px rgba(124, 58, 237, 0.08);
        }
        .doc-card-bg-circle {
          position: absolute;
          right: -32px;
          top: -32px;
          height: 120px;
          width: 120px;
          border-radius: 50%;
          transition: transform 0.5s ease;
        }
        .doc-card:hover .doc-card-bg-circle {
          transform: scale(1.8);
        }
        .doc-card:hover .doc-card-icon {
          transform: scale(1.08);
        }
        .doc-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .doc-card-btn:hover {
          transform: translateY(-1px);
          filter: brightness(0.92);
        }
        .doc-card-btn:active {
          transform: scale(0.98);
        }
        @media (max-width: 900px) {
          .doc-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .doc-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
