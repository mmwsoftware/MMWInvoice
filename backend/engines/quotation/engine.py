"""Quotation PDF engine.

The ORIGINAL 15-page PDF is edited in place: only pages 2 and 9 are touched, so the other 13 pages stay byte-for-byte
identical.  On pages 2 and 9 the old dynamic text is truly removed (not covered) and new values are drawn at the
positions/fonts/sizes measured from the original.
"""
import io, json, re, datetime
import pymupdf
from fontTools import subset as ftsubset
from fontTools.ttLib import TTFont
from engines.quotation import config
from engines.money import D, fmt_inr, amount_in_words

DYNAMIC_PAGES = (2, 9)
DESC_LINE_PITCH = 11.0          # measured: description lines are 11.0pt apart
DESC_WRAP_W = 207.5             # description column text width (original lines reach 206.9pt; column right border at x=303.3)
ROW_GAP = 6.0                   # extra space between two line items
BODY_TOP, BODY_BOTTOM = 453.1, 556.6          # table body area on page 9
FIRST_BASE_MIN, LAST_BASE_MAX = 465.1, 550.6  # allowed baseline range inside the body
CENTER_BASE = 500.8                           # baseline the original centres its 5-line block on
ADDR_PITCH_P2, ADDR_PITCH_P9 = 19.45, 21.8

class FieldOverflow(Exception): ...

# ------------------------------------------------------------------ fonts
FONT_FILES = {   # original font name -> candidates (first found wins). fonts/user/ lets you drop in the real full fonts.
    "Poppins-Regular":  ["user/Poppins-Regular.ttf",  "legacy/Poppins-Regular.ttf"],
    "Poppins-Medium":   ["user/Poppins-Medium.ttf",   "legacy/Poppins-Medium.ttf"],
    "Poppins-SemiBold": ["user/Poppins-SemiBold.ttf", "legacy/Poppins-SemiBold.ttf"],
    "Calibri":          ["user/Calibri.ttf",          "legacy/Calibri.ttf"],
    "Calibri-Bold":     ["user/Calibri-Bold.ttf",     "legacy/Calibri-Bold.ttf"],
}

class FontBook:
    def __init__(self):
        self.fonts, self.paths, self.used = {}, {}, {}
    def get(self, name):
        if name not in self.fonts:
            for c in FONT_FILES[name]:
                p = config.FONT_DIR / c
                if p.exists():
                    self.fonts[name] = pymupdf.Font(fontfile=str(p)); self.paths[name] = p; break
            else: raise FileNotFoundError(f"font {name}: run  python -m app.build_fonts")
        return self.fonts[name]
    def width(self, name, text, size): return self.get(name).text_length(text, size)
    def note(self, name, text): self.used.setdefault(name, set()).update(text)
    def subset_bytes(self, name):
        """Embed only the characters actually used (keeps the PDF small)."""
        self.get(name)
        opts = ftsubset.Options(); opts.layout_features = []; opts.notdef_outline = True; opts.glyph_names = False; opts.hinting = False
        f = TTFont(str(self.paths[name])); sub = ftsubset.Subsetter(opts)
        sub.populate(text="".join(sorted(self.used.get(name, set()) | {" "}))); sub.subset(f)
        b = io.BytesIO(); f.save(b); return b.getvalue()

# ------------------------------------------------------------------ text helpers
def wrap_text(text, fonts, fname, size, max_w):
    """Greedy word wrap; explicit '\n' forces a break. Raises if one word is wider than the column."""
    out = []
    for para in str(text).split("\n"):
        cur = ""
        for word in para.split():
            trial = (cur + " " + word) if cur else word
            if fonts.width(fname, trial, size) <= max_w: cur = trial
            elif not cur: raise FieldOverflow(f"word {word!r} is wider than the column ({max_w:.0f}pt)")
            else: out.append(cur); cur = word
        out.append(cur)
    return out

class Canvas:
    """Collects draw operations, then writes them to a page with subset fonts (one embed per font per page)."""
    def __init__(self, fonts): self.fonts, self.ops = fonts, []
    def text(self, page_no, f, text, *, x=None, dy=0.0, max_w=None, min_scale=0.85, base=None, align=None):
        if text is None or text == "": return
        fname, size = f["font"], f["size"]
        w = self.fonts.width(fname, text, size)
        if max_w and w > max_w:
            s = max_w / w
            if s < min_scale: raise FieldOverflow(f"{f['id']}: too long ({w:.0f}pt > {max_w:.0f}pt even at {min_scale:.0%}): {text!r}")
            size, w = size * s, max_w
        a0, a1, al = f["ax0"], f["ax1"], align or f["align"]
        if x is None: x = {"left": a0, "right": a1 - w, "center": (a0 + a1) / 2 - w / 2}[al]
        y = (f["baseline"] if base is None else base) + dy
        self.fonts.note(fname, text)
        self.ops.append((page_no, fname, text, x, y, size, tuple(f["color"])))
    def flush(self, doc):
        alias = {}; done = set()
        for pno, fname, text, x, y, size, color in self.ops:
            page = doc[pno - 1]
            if (pno, fname) not in done:
                alias[(pno, fname)] = "S" + re.sub(r"\W", "", fname)
                page.insert_font(fontname=alias[(pno, fname)], fontbuffer=self.fonts.subset_bytes(fname)); done.add((pno, fname))
            page.insert_text((x, y), text, fontname=alias[(pno, fname)], fontsize=size, color=color)

# ------------------------------------------------------------------ template cleaning
def load_map():
    m = json.load(open(config.FIELD_MAP)); m["by_id"] = {f["id"]: f for f in m["fields"]}; return m

def redaction_rects(m, page_no, move_gstin_row):
    rects = []
    for f in m["fields"]:
        if f["page"] != page_no: continue
        if f["kind"] == "movable" and not move_gstin_row: continue
        rects.append(pymupdf.Rect(*f["redact"]))
    return rects

def clean_pages(doc, m, move_gstin_row):
    info = {}
    for pno in DYNAMIC_PAGES:
        page = doc[pno - 1]; rects = redaction_rects(m, pno, move_gstin_row)
        for r in rects: page.add_redact_annot(r, fill=False)
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        info[pno] = rects
    return info

def integrity_check(orig, clean, rects_by_page):
    """Every removed word must lie inside a redaction box; nothing else may change."""
    problems = []
    for pno in DYNAMIC_PAGES:
        ow = {(round(w[0]), round(w[1]), w[4]): w for w in orig[pno - 1].get_text("words")}
        cw = {(round(w[0]), round(w[1]), w[4]) for w in clean[pno - 1].get_text("words")}
        for k, w in ow.items():
            c = pymupdf.Point((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)
            if k not in cw and not any(r.contains(c) for r in rects_by_page[pno]):
                problems.append(f"p{pno}: STATIC word removed: {k[2]!r} at {k[0]},{k[1]}")
        for k in cw - set(ow): problems.append(f"p{pno}: unexpected new word {k[2]!r}")
    return problems

def scrub_page(doc, pno):
    """Drop the page thumbnail and Illustrator private data: both hold a picture/copy of the ORIGINAL page content."""
    x = doc[pno - 1].xref
    for key in ("Thumb", "PieceInfo", "LastModified"): doc.xref_set_key(x, key, "null")

# ------------------------------------------------------------------ validation + formats
GST_STATES = {"01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
 "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland",
 "14": "Manipur", "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
 "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "26": "Dadra and Nagar Haveli and Daman and Diu", "27": "Maharashtra",
 "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman and Nicobar Islands",
 "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"}
GSTIN_RE = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")

def validate(data):
    """Hard errors raise; soft problems (they do not block the quote) are returned as warnings."""
    warns, c = [], data["customer"]
    if not c["name"].strip(): raise ValueError("customer name is required")
    if not 1 <= len(c["address_lines"]) <= 5: raise ValueError("1 to 5 address lines supported")
    if not data["items"]: raise ValueError("at least one line item is required")
    if not str(data.get("subject", "")).strip(): raise ValueError("subject is required")
    g = c.get("gstin", "").strip().upper()
    if g:
        if not GSTIN_RE.match(g): raise ValueError(f"GSTIN {g!r} is not a valid 15-character GSTIN")
        st = GST_STATES.get(g[:2])
        if not st: raise ValueError(f"GSTIN state code {g[:2]} does not exist")
        addr = " ".join(c["address_lines"]).lower()
        named = [n for n in GST_STATES.values() if n.lower() in addr]
        if named and st not in named:
            warns.append(f"GSTIN {g} belongs to {st}, but the address mentions {', '.join(named)}")
        if re.search(r"\b(private|pvt|limited|ltd|llp)\b", c["name"].lower()) and g[5] not in "CFHLJ":
            warns.append(f"GSTIN {g} has PAN type '{g[5]}' (individual/other) but the name looks like a company")
    return warns

def fmt_short(d): return d.strftime("%d/%m/%y")            # 29/01/26
def fmt_long(d):  return f"{d.day} {d.strftime('%B %Y')}"   # 29 January 2026


def _clean(l): return l.strip().rstrip(",.").strip()

def p2_lines(c):
    """Letter style: 'Name,' then comma-terminated lines, last line ends with a full stop (as in the original)."""
    a = [_clean(x) for x in c["address_lines"]]
    return [_clean(c["name"]) + ","] + [x + "," for x in a[:-1]] + [a[-1] + "."]

def p9_lines(c, fonts, max_w=360.0):
    """Table style: everything before the last line merged into one row, last line (state + PIN) on its own row."""
    if c.get("page9_address_lines"): return list(c["page9_address_lines"])          # explicit override
    a = [_clean(x) for x in c["address_lines"]]
    if len(a) == 1: return wrap_text(a[0], fonts, "Poppins-Regular", 10.3, max_w)
    head = wrap_text(", ".join(a[:-1]) + ",", fonts, "Poppins-Regular", 10.3, max_w)
    return head + [a[-1]]

# ------------------------------------------------------------------ table layout (page 9)
def layout_rows(items, fonts):
    rows = []
    for it in items:
        lines = wrap_text(it["description"], fonts, "Calibri", 9.7, DESC_WRAP_W)
        rows.append((it, lines))
    total_h = sum(len(l) * DESC_LINE_PITCH for _, l in rows) + ROW_GAP * (len(rows) - 1)
    first = CENTER_BASE - (total_h - DESC_LINE_PITCH) / 2          # centred like the original ...
    first = max(first, FIRST_BASE_MIN)                              # ... but never above the top padding
    last = first + total_h - DESC_LINE_PITCH
    if last > LAST_BASE_MAX:
        raise FieldOverflow(f"price table is full: needs {sum(len(l) for _, l in rows)} description lines in {len(rows)} rows "
                            f"(room for about 8). A continuation page is not built yet.")
    out, y = [], first
    for it, lines in rows:
        out.append((it, lines, y)); y += len(lines) * DESC_LINE_PITCH + ROW_GAP
    return out

# ------------------------------------------------------------------ main build
def build(data, template=None):
    template = template or config.TEMPLATE_PDF
    m = load_map(); F = m["by_id"]; warns = validate(data)
    date = datetime.date.fromisoformat(data["date"])
    c = data["customer"]; gstin = c.get("gstin", "").strip().upper()
    fonts = FontBook(); cv = Canvas(fonts)
    lines9 = p9_lines(c, fonts); n9 = len(lines9)
    if n9 > 3: raise FieldOverflow(f"page 9 address needs {n9} lines (max 3)")
    move_gstin_row = (n9 >= 3) or (not gstin)

    orig = pymupdf.open(str(template)); doc = pymupdf.open(str(template))
    rects = clean_pages(doc, m, move_gstin_row)
    problems = integrity_check(orig, doc, rects)
    if problems: raise RuntimeError("template integrity check failed:\n  " + "\n  ".join(problems))

    # ---------------- page 2: letter
    cv.text(2, F["p2_date"], f"Date: {fmt_short(date)}")
    subject = str(data["subject"]).strip()
    if not subject.lower().startswith("subject :"):
        subject = f"Subject : {subject}"
    cv.text(2, F["p2_subject"], subject, max_w=477.0)
    lines2 = p2_lines(c)
    p2_keys = ["p2_name", "p2_addr1", "p2_addr2", "p2_addr3", "p2_addr4"]
    for k, ln in enumerate(lines2):
        f = F[p2_keys[min(k, 4)]]; dy = ADDR_PITCH_P2 * (k - 4) if k > 4 else 0.0
        cv.text(2, f, ln, dy=dy, max_w=479.0)
    # ---------------- page 9: header block + client
    cv.text(9, F["p9_date"], fmt_long(date), max_w=110)
    cv.text(9, F["p9_quote_no"], data["quote_no"], max_w=100)
    cv.text(9, F["p9_client_name"], _clean(c["name"]), max_w=360)
    for k, ln in enumerate(lines9):
        cv.text(9, F["p9_addr1"], ln, dy=ADDR_PITCH_P9 * k, max_w=360)
    gdy = ADDR_PITCH_P9 * max(0, n9 - 2)
    if gstin:
        if move_gstin_row:
            cv.text(9, F["p9_gstin_label"], "GSTIN", dy=gdy); cv.text(9, F["p9_gstin_colon"], ":", dy=gdy)
        cv.text(9, F["p9_client_gstin"], gstin, dy=gdy)
    # ---------------- page 9: price table
    total = D(0)
    for idx, (it, lines, y) in enumerate(layout_rows(data["items"], fonts), 1):
        amt = D(D(it["qty"]) * D(it["rate"])); total += amt
        for i, ln in enumerate(lines): cv.text(9, F["p9_desc_l1"], ln, base=y + i * DESC_LINE_PITCH)
        qty = f"{int(it['qty'])}" if float(it["qty"]).is_integer() else f"{it['qty']}"
        cv.text(9, F["p9_item_sr"], str(idx), base=y + 2.1)
        cv.text(9, F["p9_item_hsn"], it["hsn"], base=y + 3.8, max_w=58)
        cv.text(9, F["p9_item_uom"], it.get("uom", "Nos"), base=y + 3.8, max_w=28)
        cv.text(9, F["p9_item_qty"], qty, base=y + 3.8, max_w=22)
        cv.text(9, F["p9_item_rate"], fmt_inr(it["rate"]), base=y + 3.8, max_w=54)
        cv.text(9, F["p9_item_amount"], fmt_inr(amt), base=y + 3.8, max_w=58)
    cv.text(9, F["p9_total_value"], fmt_inr(total), max_w=58)
    words = amount_in_words(total)
    for i, ln in enumerate(wrap_text(words, fonts, "Poppins-SemiBold", 10.0, 544.3 - F["p9_words"]["ax0"])[:3]):
        cv.text(9, F["p9_words"], ln, dy=14.0 * i)
    cv.flush(doc)

    # ---------------- privacy: nothing of the original client may survive anywhere
    for pno in DYNAMIC_PAGES: scrub_page(doc, pno)
    title = f"Quotation {data['quote_no']}"
    doc.set_metadata({"title": title, "author": "Maxmoc Motor Works India Pvt Ltd", "subject": "", "keywords": "",
                      "creator": "Maxmoc Quotation System", "producer": "Maxmoc Quotation System"})
    doc.del_xml_metadata()
    pdf = doc.tobytes(garbage=3, deflate=True)          # NOT clean=True: leaves the 13 static pages untouched
    return dict(pdf=pdf, total=total, words=words, warnings=warns, fonts_used={k: str(v.name) for k, v in fonts.paths.items()})
