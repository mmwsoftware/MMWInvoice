const ADDRESS_LINE_COUNT = 4;

export default function AddressFields({ value, onChange, className, label }) {
  const lines = (value || "").split(/\r?\n/);

  const handleChange = (index, nextValue) => {
    const updatedLines = lines.slice(0, ADDRESS_LINE_COUNT);
    updatedLines[index] = nextValue;
    onChange(updatedLines.join("\n"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: ADDRESS_LINE_COUNT }, (_, index) => {
        const required = index < 2;
        const fieldLabel = `${label} ${index + 1}`;

        return (
          <div key={fieldLabel}>
            <label
              htmlFor={`address-line-${index + 1}`}
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              {fieldLabel}{" "}
              {required ? (
                <span style={{ color: "#ef4444" }}>*</span>
              ) : (
                "(optional)"
              )}
            </label>
            <input
              id={`address-line-${index + 1}`}
              type="text"
              required={required}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              value={lines[index] || ""}
              onChange={(event) => handleChange(index, event.target.value)}
              className={className}
            />
          </div>
        );
      })}
    </div>
  );
}
