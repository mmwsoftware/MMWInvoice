import { useEffect, useRef, useState } from "react";
import { describeRange, getPresets } from "../utils/dates";

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 10px",
  fontSize: "14px",
  color: "#334155",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
};

/**
 * "Select date range" button with a small popover:
 * quick ranges plus custom From / To dates.
 *
 * value: { from: "YYYY-MM-DD" | "", to: "YYYY-MM-DD" | "" }
 */
export default function HistoryDateRange({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const wrapRef = useRef(null);

  const isActive = Boolean(value.from || value.to);
  const label =
    describeRange(value.from, value.to) || "Select date range";

  const invalid = Boolean(
    draftFrom && draftTo && draftFrom > draftTo
  );

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;

    const onMouseDown = (e) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setDraftFrom(value.from);
      setDraftTo(value.to);
    }

    setOpen((o) => !o);
  };

  const apply = (from, to) => {
    onChange({ from, to });
    setOpen(false);
  };

  const presets = getPresets();

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {/* Date Range Button */}
      <button
        type="button"
        className="hdr-btn"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "40px",
          padding: "0 16px",
          fontSize: "14px",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "#1d4ed8" : "#64748b",
          border: `1px solid ${
            isActive ? "#93c5fd" : "#e2e8f0"
          }`,
          borderRadius: "10px",
          backgroundColor: isActive ? "#eff6ff" : "#ffffff",
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        <svg
          style={{
            height: "16px",
            width: "16px",
          }}
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

        {label}
      </button>

      {/* Clear Button */}
      {isActive && (
        <button
          type="button"
          onClick={() => onChange({ from: "", to: "" })}
          aria-label="Clear date range"
          title="Clear date range"
          className="hdr-clear"
          style={{
            height: "40px",
            width: "40px",
            fontSize: "18px",
            lineHeight: 1,
            color: "#64748b",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}

      {/* Date Range Popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Select date range"
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            zIndex: 10000,
            width: "320px",
            maxWidth: "calc(100vw - 32px)",
            padding: "16px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow:
              "0 12px 32px rgba(15, 23, 42, 0.14)",
          }}
        >
          {/* Presets */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "14px",
            }}
          >
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className="hdr-chip"
                onClick={() => apply(p.from, p.to)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#334155",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  borderRadius: "100px",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Dates */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label htmlFor="hdr-from" style={labelStyle}>
                From
              </label>

              <input
                id="hdr-from"
                type="date"
                value={draftFrom}
                max={draftTo || undefined}
                onChange={(e) => setDraftFrom(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="hdr-to" style={labelStyle}>
                To
              </label>

              <input
                id="hdr-to"
                type="date"
                value={draftTo}
                min={draftFrom || undefined}
                onChange={(e) => setDraftTo(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Invalid Date Message */}
          {invalid && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              The From date must be on or before the To date.
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            {/* Clear */}
            <button
              type="button"
              onClick={() => apply("", "")}
              style={{
                padding: "8px 4px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear
            </button>

            {/* Apply */}
            <button
              type="button"
              disabled={
                invalid ||
                (!draftFrom && !draftTo)
              }
              onClick={() => apply(draftFrom, draftTo)}
              style={{
                padding: "9px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor:
                  invalid ||
                  (!draftFrom && !draftTo)
                    ? "#93c5fd"
                    : "#2563eb",
                border: "none",
                borderRadius: "8px",
                cursor:
                  invalid ||
                  (!draftFrom && !draftTo)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hdr-btn:hover {
          border-color: #cbd5e1 !important;
        }

        .hdr-clear:hover {
          background-color: #f8fafc !important;
        }

        .hdr-chip:hover {
          background-color: #e2e8f0 !important;
        }

        .hdr-btn:focus-visible,
        .hdr-clear:focus-visible,
        .hdr-chip:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}