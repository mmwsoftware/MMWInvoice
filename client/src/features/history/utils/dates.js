// Date helpers for the History page.
//
// Documents store their date in mixed formats (invoices: "02.10.2026" or
// "2026-10-01", quotations: "2026-10-01"). Everything here works on plain
// "YYYY-MM-DD" strings, which compare correctly as text and never shift by a
// day because of time zones.

const pad = (n) => String(n).padStart(2, "0");

function validIso(y, m, d) {
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return ""; // e.g. 31.02.2026
  }
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Local calendar date as YYYY-MM-DD. (toISOString() would shift it to UTC.) */
export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Accepts DD.MM.YYYY, YYYY-MM-DD or an ISO datetime. Returns YYYY-MM-DD or "". */
export function parseDocDate(value) {
  if (!value) return "";
  const s = String(value).trim();

  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return validIso(+m[1], +m[2], +m[3]);

  m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(s);
  if (m) return validIso(+m[3], +m[2], +m[1]);

  return "";
}

/** YYYY-MM-DD -> DD.MM.YYYY (the format printed on the invoice). */
export function formatDisplayDate(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Inclusive range check. Either bound may be empty (open-ended). */
export function inDateRange(iso, from, to) {
  if (!from && !to) return true;
  if (!iso) return false;
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

/** Short text for the picker button, e.g. "01.10.2026 – 02.10.2026". */
export function describeRange(from, to) {
  if (from && to) {
    return from === to
      ? formatDisplayDate(from)
      : `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
  }
  if (from) return `From ${formatDisplayDate(from)}`;
  if (to) return `Up to ${formatDisplayDate(to)}`;
  return "";
}

/** Quick ranges shown in the picker. */
export function getPresets(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const today = toIsoDate(now);
  return [
    { label: "Today", from: today, to: today },
    { label: "Last 7 days", from: toIsoDate(new Date(y, m, d - 6)), to: today },
    {
      label: "This month",
      from: toIsoDate(new Date(y, m, 1)),
      to: toIsoDate(new Date(y, m + 1, 0)),
    },
    {
      label: "Last month",
      from: toIsoDate(new Date(y, m - 1, 1)),
      to: toIsoDate(new Date(y, m, 0)),
    },
    {
      label: "This year",
      from: toIsoDate(new Date(y, 0, 1)),
      to: toIsoDate(new Date(y, 11, 31)),
    },
  ];
}
