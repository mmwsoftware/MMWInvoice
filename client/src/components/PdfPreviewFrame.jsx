import { useEffect, useState } from "react";
import { getErrorMessage } from "../services/documentHelpers";

const buttonStyle = {
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 600,
  borderRadius: "10px",
  cursor: "pointer",
};

/**
 * Shows the real PDF rendered by the backend from the form data.
 * Nothing is saved and no document number is used while previewing.
 *
 * `load` must return a Promise<Blob> (the PDF).
 */
export default function PdfPreviewFrame({ load, onEdit, title = "PDF preview" }) {
  const [state, setState] = useState({ url: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    load()
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, loading: false, error: "" });
      })
      .catch(async (err) => {
        const message = await getErrorMessage(err);
        if (!cancelled) setState({ url: null, loading: false, error: message });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // `load` is built from data that is fixed while this preview is mounted;
    // only a manual retry should reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => {
    setState({ url: null, loading: true, error: "" });
    setAttempt((n) => n + 1);
  };

  if (state.loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(255,255,255,0.25)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "pdfpreview-spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: "14px", fontWeight: 500 }}>Rendering PDF...</span>
        <style>{`@keyframes pdfpreview-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state.error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          backgroundColor: "#1e293b",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0", color: "#f87171" }}>
          Could not render the preview
        </p>
        <p style={{ fontSize: "14px", color: "#e2e8f0", maxWidth: "480px", margin: 0 }}>
          {state.error}
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            type="button"
            onClick={onEdit}
            style={{ ...buttonStyle, color: "#0f172a", backgroundColor: "#ffffff", border: "none" }}
          >
            ← Back to Edit Details
          </button>
          <button
            type="button"
            onClick={retry}
            style={{
              ...buttonStyle,
              color: "#e2e8f0",
              backgroundColor: "transparent",
              border: "1px solid #64748b",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`${state.url}#toolbar=1&navpanes=0&view=FitH`}
      title={title}
      style={{ width: "100%", height: "100%", border: "none" }}
    />
  );
}
