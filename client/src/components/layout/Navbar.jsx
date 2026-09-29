import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/dashboard/home", label: "Home" },
    { to: "/dashboard/history", label: "History" },
  ];

  return (
    <nav
      className="navbar-animate"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        className="navbar-container"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="MMW"
            style={{ height: "36px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Nav Links - Center */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {({ isActive }) => (
                <span style={{ position: "relative", display: "inline-block" }}>
                  {link.label}
                  {isActive && <span className="nav-active-bar" />}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Side - User Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* User Dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderRadius: "12px",
                padding: "6px 12px 6px 6px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="user-btn"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "32px",
                  width: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                V
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#334155",
                }}
              >
                Vicky
              </span>
              <svg
                style={{
                  height: "14px",
                  width: "14px",
                  color: "#94a3b8",
                  transition: "transform 0.2s",
                  transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showDropdown && (
              <div
                className="dropdown-animate"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "48px",
                  width: "200px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  padding: "6px 0",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                    Vicky
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Admin</p>
                </div>
                <div style={{ padding: "4px 0" }}>
                  <button
                    className="dropdown-item dropdown-item-danger"
                    onClick={handleLogout}
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
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .navbar-animate {
          animation: navSlideDown 0.4s ease-out;
        }

        .nav-link {
          display: inline-block;
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: #1e293b;
          background-color: #f8fafc;
        }

        .nav-link-active {
          color: #1d4ed8 !important;
          background-color: transparent !important;
        }

        .nav-active-bar {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          height: 2.5px;
          width: 24px;
          border-radius: 10px;
          background-color: #1d4ed8;
          animation: indicatorIn 0.3s ease-out;
        }

        .user-btn:hover {
          background-color: #f8fafc !important;
        }

        .dropdown-animate {
          animation: dropdownIn 0.2s ease-out;
        }

        .dropdown-item {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          font-size: 14px;
          color: #475569;
          border: none;
          background: none;
          cursor: pointer;
          transition: background 0.15s;
        }

        .dropdown-item:hover {
          background-color: #f8fafc;
        }

        .dropdown-item-danger {
          color: #ef4444;
        }

        .dropdown-item-danger:hover {
          background-color: #fef2f2;
        }

        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes indicatorIn {
          from { width: 0; opacity: 0; }
          to { width: 24px; opacity: 1; }
        }

        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .nav-link {
            padding: 6px 10px !important;
            font-size: 13px !important;
          }
          .navbar-container {
            padding: 0 12px !important;
          }
        }
      `}</style>
    </nav>
  );
}
