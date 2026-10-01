"""Invoice PDF engine.

Original template PDF  ->  truly remove old dynamic text (no white boxes)  ->  draw new values at the
calibrated positions  ->  place QR on page 2  ->  save full PDF + a separate page-1-only public snapshot.
All static design (borders, logo, labels, bank details, watermark) is never redrawn: it stays the original.
"""

import io, json, hashlib, datetime
import pymupdf
from PIL import Image
from engines.invoice import config
from engines.money import D, fmt_inr, amount_in_words


QR_RECT = pymupdf.Rect(166.2, 79.4, 354.7, 267.9)          # page 2, measured from the original
TICK_RECT = pymupdf.Rect(483.1, 78.4, 490.1, 87.4)         # page 1 "copy type" tick
TICK_PITCH = 11.9                                           # Original / Duplicate / Triplicate
COPY_INDEX = {"original": 0, "duplicate": 1, "triplicate": 2}
MAX_ITEMS = 5

# Static MMW project engineer details
STATIC_ENGINEER_NAME = "Sathya Bama"
STATIC_ENGINEER_EMAIL = "sathya@maxmoc.in"
STATIC_ENGINEER_CONTACT = "99528 23148"
STATIC_COUNTRY = "India"
STATIC_COUNTRY_CODE = "91"

class FieldOverflow(Exception):
    ...


class MissingGlyph(Exception):
    ...


# ---------------------------------------------------------------- fonts
# original font name -> candidate files, best first. Later entries are SUBSTITUTES (flagged in the output record).
FONT_CANDIDATES = {
    "Poppins-Light": ["Poppins-Light.ttf"],
    "Poppins-Regular": ["Poppins-Regular.ttf"],
    "Poppins-Medium": ["Poppins-Medium.ttf"],
    "Poppins-SemiBold": ["Poppins-SemiBold.ttf"],
    "MyriadPro-Regular": [
        "MyriadPro-Regular.otf",
        "MyriadPro-Regular.ttf",
        "SourceSans3-Regular.ttf",
    ],
    "TrebuchetMS-Bold": [
        "TrebuchetMS-Bold.ttf",
        "trebucbd.ttf",
        "NotoSans-Bold.ttf",
    ],
    "Helvetica": [],  # PDF built-in Helvetica: identical metrics, no file needed
}


class FontBook:
    def __init__(self):
        self._cache, self.substitutes = {}, {}

    def get(self, orig_name):
        if orig_name in self._cache:
            return self._cache[orig_name]

        if orig_name == "Helvetica":
            r = (pymupdf.Font("helv"), None, "helv")
        else:
            for i, fn in enumerate(FONT_CANDIDATES[orig_name]):
                p = config.FONT_DIR / fn
                if p.exists():
                    r = (
                        pymupdf.Font(fontfile=str(p)),
                        str(p),
                        "F_" + fn.split(".")[0].replace("-", "_"),
                    )
                    if i > 0:
                        self.substitutes[orig_name] = fn
                    break
            else:
                raise FileNotFoundError(f"no font file for {orig_name}")

        self._cache[orig_name] = r
        return r


# ---------------------------------------------------------------- helpers
def load_map():
    return json.load(open(config.FIELD_MAP))


def _fields(m, page):
    return {f["id"]: f for f in m["fields"] if f["page"] == page}


def _draw(page, fonts, f, text, x=None, dy=0.0, max_w=None, min_scale=0.78, size_override=None):
    """Draw one value using the field's original font/size/colour/baseline. Align by the original glyph anchors."""
    if text is None or text == "":
        return

    font, path, alias = fonts.get(f["font"])
    size = size_override if size_override is not None else f["size"]

    for ch in text:
        if not font.has_glyph(ord(ch)) and ch not in " ":
            raise MissingGlyph(
                f"{f['id']}: font {f['font']} has no glyph for {ch!r}"
            )

    w = font.text_length(text, size)

    if max_w and w > max_w:
        s = max_w / w
        if s < min_scale:
            raise FieldOverflow(
                f"{f['id']}: text too long ({w:.0f}pt > {max_w:.0f}pt "
                f"even at {min_scale:.0%} size): {text!r}"
            )
        size, w = size * s, max_w

    a0, a1 = f["ax0"], f["ax1"]

    if x is None:
        x = {
            "left": a0,
            "right": a1 - w,
            "center": (a0 + a1) / 2 - w / 2,
        }[f["align"]]

    kw = dict(
        fontsize=size,
        color=tuple(f["color_cmyk"]),
        fontname=alias,
    )

    if path:
        kw["fontfile"] = path

    page.insert_text((x, f["baseline"] + dy), text, **kw)


# ---------------------------------------------------------------- template cleaning
def _redact_rects(m, page_no, copy_idx, items_n):
    fl = _fields(m, page_no)
    rects = []

    for f in fl.values():
        if f["id"] in ("copy_tick", "p2_qr") or f["id"].startswith("item_"):
            continue
        rects.append(pymupdf.Rect(*f["redact"]))

    if page_no == 1:
        a = m["table_geometry_p1"]["item_area"]
        rects.append(
            pymupdf.Rect(
                21.5,
                a[0] + 0.5,
                820.5,
                a[1] - 0.5,
            )
        )

    return rects


def _delete_images_within(page, area):
    """Remove image objects whose placed rectangle lies inside `area` (text is never touched)."""
    gone = 0

    for img in page.get_images(full=True):
        xref = img[0]
        rs = page.get_image_rects(xref)

        if rs and all(area.contains(r) for r in rs):
            page.delete_image(xref)
            gone += 1

    return gone


def clean_template(doc, m, copy_type):
    """Remove old dynamic text/images from the original pages. Returns the text-redaction rects per page for checks."""
    info = {}

    for pno in (1, 2):
        page = doc[pno - 1]
        rects = _redact_rects(
            m,
            pno,
            COPY_INDEX[copy_type],
            0,
        )

        for r in rects:
            page.add_redact_annot(r, fill=False)

        page.apply_redactions(
            images=pymupdf.PDF_REDACT_IMAGE_NONE,
            graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
        )

        if pno == 1 and copy_type != "original":
            if (
                _delete_images_within(
                    page,
                    TICK_RECT + (-1, -1, 1, 1),
                )
                != 1
            ):
                raise RuntimeError("tick image not removed")

        if pno == 2:
            if (
                _delete_images_within(
                    page,
                    QR_RECT + (-1, -1, 1, 1),
                )
                < 1
            ):
                raise RuntimeError("old QR image not removed")

        info[pno] = rects

    return info


def integrity_check(orig_doc, clean_doc, rects_by_page):
    """Every word removed must lie inside a redaction rect; every other word must survive untouched."""
    problems = []

    for pno in (1, 2):
        ow = {
            (round(w[0]), round(w[1]), w[4]): w
            for w in orig_doc[pno - 1].get_text("words")
        }

        cw = {
            (round(w[0]), round(w[1]), w[4])
            for w in clean_doc[pno - 1].get_text("words")
        }

        for k, w in ow.items():
            cx, cy = (
                (w[0] + w[2]) / 2,
                (w[1] + w[3]) / 2,
            )

            inside = any(
                r.contains(pymupdf.Point(cx, cy))
                for r in rects_by_page[pno]
            )

            if k not in cw and not inside:
                problems.append(
                    f"p{pno}: STATIC word removed: {k[2]!r} "
                    f"at {k[0]},{k[1]}"
                )

        for k in cw - set(ow):
            problems.append(
                f"p{pno}: unexpected new word {k[2]!r}"
            )

    return problems


# ---------------------------------------------------------------- tick (copy type)
def _tick_png(tpl):
    page = tpl[0]

    for img in page.get_images(full=True):
        xref, smask, w, h = (
            img[0],
            img[1],
            img[2],
            img[3],
        )

        if (w, h) == (2, 2) and smask:
            pix = pymupdf.Pixmap(tpl, smask)

            if pix.n != 1:
                pix = pymupdf.Pixmap(pymupdf.csGRAY, pix)

            mask = Image.frombytes(
                "L",
                (pix.width, pix.height),
                pix.samples,
            )

            rgba = Image.new(
                "RGBA",
                mask.size,
                (0, 0, 0, 255),
            )

            rgba.putalpha(mask)

            b = io.BytesIO()
            rgba.save(b, "PNG")

            return b.getvalue()

    raise RuntimeError("tick image not found in template")


# ---------------------------------------------------------------- business logic
def compute(data):
    items = data["items"]

    if not 1 <= len(items) <= MAX_ITEMS:
        raise ValueError(
            f"1 to {MAX_ITEMS} line items supported in this version "
            f"(got {len(items)})"
        )

    cust = data["customer"]

    # GSTIN is optional. Validate state prefix only when GSTIN is provided.
    if cust["gstin"] and cust["gstin"][:2] != cust["state_code"]:
        raise ValueError(
            f"GSTIN {cust['gstin']} starts with state "
            f"{cust['gstin'][:2]} but state code is {cust['state_code']}"
        )

    is_same_state = cust["state_code"] == config.SELLER_STATE_CODE

    rate = D(
        data.get(
            "gst_rate",
            config.DEFAULT_GST_RATE,
        )
    )

    lines = []

    for it in items:
        amt = D(
            D(it["qty"]) *
            D(it["rate"])
        )

        lines.append(
            dict(
                it,
                amount=amt,
            )
        )

    sub = sum(
        (l["amount"] for l in lines),
        D(0),
    )

    tax = D(sub * rate / 100)

    # Interstate supply is one IGST line. Same-state supply is split evenly
    # between CGST and SGST while retaining the existing total tax amount.
    if is_same_state:
        half_rate = rate / D(2)
        cgst = D(sub * half_rate / 100)
        sgst = D(tax - cgst)  # preserves the exact total after Decimal rounding
        tax_label = None
    else:
        cgst = D(0)
        sgst = D(0)
        tax_label = f"IGST @ {rate.normalize():f}%"

    total = D(sub + tax)

    return dict(
        lines=lines,
        subtotal=sub,
        tax=tax,
        cgst=cgst,
        sgst=sgst,
        total=total,
        gst_rate=rate,
        is_same_state=is_same_state,
        tax_label=tax_label,
        words=amount_in_words(total),
    )


# ---------------------------------------------------------------- main
def build_pdfs(
    data,
    *,
    qr_bytes=None,
    qr_ext="png",
    public_url=None,
    out_dir=None,
    basename=None,
):
    m = load_map()
    c = compute(data)

    tpl = pymupdf.open(
        str(config.TEMPLATE_PDF)
    )

    doc = pymupdf.open(
        str(config.TEMPLATE_PDF)
    )

    copy_type = data.get(
        "copy_type",
        "original",
    )

    rects = clean_template(
        doc,
        m,
        copy_type,
    )

    problems = integrity_check(
        tpl,
        doc,
        rects,
    )

    if problems:
        raise RuntimeError(
            "template integrity check failed:\n  "
            + "\n  ".join(problems)
        )

    fonts = FontBook()

    p1, p2 = doc[0], doc[1]
    f1, f2 = _fields(m, 1), _fields(m, 2)
    cust, eng = data["customer"], data["engineer"]

    # -- page 1: copy tick
    if copy_type != "original":
        r = pymupdf.Rect(TICK_RECT)

        r.y0 += (
            COPY_INDEX[copy_type] *
            TICK_PITCH
        )

        r.y1 += (
            COPY_INDEX[copy_type] *
            TICK_PITCH
        )

        p1.insert_image(
            r,
            stream=_tick_png(tpl),
        )

    # -- page 1: header block
    for fid, val in (
        ("invoice_no", data["invoice_no"]),
        ("invoice_date", data["invoice_date"]),
        ("po_no", data["po_no"]),
        ("po_date", data["po_date"]),
        ("engineer_name", STATIC_ENGINEER_NAME),
        ("engineer_email", STATIC_ENGINEER_EMAIL),
        ("engineer_contact", STATIC_ENGINEER_CONTACT),
        ("country", STATIC_COUNTRY),
        ("country_code", STATIC_COUNTRY_CODE),
    ):
        _draw(
            p1,
            fonts,
            f1[fid],
            val,
            max_w=225,
        )

    # -- page 1: customer block
    # max 4 address lines; the 4th uses the spare row above 'State Code'
    _draw(
        p1,
        fonts,
        f1["customer_name"],
        cust["name"],
        max_w=370,
    )

    lines = cust["address_lines"]

    if len(lines) > 4:
        raise FieldOverflow(
            "address: max 4 lines"
        )

    for i, ln in enumerate(lines):
        _draw(
            p1,
            fonts,
            f1[f"customer_addr{min(i + 1, 3)}"],
            ln,
            dy=(
                11.65 * (i - 2)
                if i == 3
                else 0.0
            ),
            max_w=370,
        )

    _draw(
        p1,
        fonts,
        f1["customer_state_code"],
        cust["state_code"],
    )

    _draw(
        p1,
        fonts,
        f1["customer_gstin"],
        cust["gstin"],
    )

    # -- page 1: line items
    # 1 item = exact original placement; 2-5 = stacked rows, my extrapolation
    n = len(c["lines"])
    base_shift0 = (
        256.5 -
        f1["item_sr"]["baseline"]
    )

    for i, l in enumerate(c["lines"]):
        dy = (
            0.0
            if n == 1
            else base_shift0 + i * 15.0
        )

        _draw(
            p1,
            fonts,
            f1["item_sr"],
            str(i + 1),
            dy=dy,
        )

        _draw(
            p1,
            fonts,
            f1["item_desc"],
            l["description"],
            dy=dy,
            max_w=320,
        )

        _draw(
            p1,
            fonts,
            f1["item_hsn"],
            l["hsn"],
            dy=dy,
            max_w=90,
        )

        qty = (
            f"{int(l['qty'])}"
            if float(l["qty"]).is_integer()
            else f"{l['qty']}"
        )

        _draw(
            p1,
            fonts,
            f1["item_qty"],
            f"{qty} {l.get('uom', 'Nos.')}",
            dy=dy,
            max_w=46,
        )

        _draw(
            p1,
            fonts,
            f1["item_rate"],
            fmt_inr(l["rate"]),
            dy=dy,
            max_w=94,
        )

        _draw(
            p1,
            fonts,
            f1["item_amount"],
            fmt_inr(l["amount"]),
            dy=dy,
            max_w=100,
        )

    # -- page 1: totals + words
    _draw(
        p1,
        fonts,
        f1["subtotal_value"],
        fmt_inr(c["subtotal"]) + " (INR)",
        max_w=108,
    )

    if c["is_same_state"]:
        # The supplied invoice template has one GST row. Preserve that geometry
        # and use two compact lines inside the row for CGST and SGST.
        tax_line_size = 7.5
        tax_line_dy = (-3.0, 3.0)
        for label, amount, dy in (
            (f"CGST @ {(c['gst_rate'] / D(2)).normalize():f}%", c["cgst"], tax_line_dy[0]),
            (f"SGST @ {(c['gst_rate'] / D(2)).normalize():f}%", c["sgst"], tax_line_dy[1]),
        ):
            _draw(
                p1,
                fonts,
                f1["tax_label"],
                label,
                dy=dy,
                max_w=90,
                size_override=tax_line_size,
            )
            _draw(
                p1,
                fonts,
                f1["tax_value"],
                fmt_inr(amount) + " (INR)",
                dy=dy,
                max_w=108,
                size_override=tax_line_size,
            )
    else:
        _draw(
            p1,
            fonts,
            f1["tax_label"],
            c["tax_label"],
            max_w=90,
        )

        _draw(
            p1,
            fonts,
            f1["tax_value"],
            fmt_inr(c["tax"]) + " (INR)",
            max_w=108,
        )

    _draw(
        p1,
        fonts,
        f1["total_value"],
        fmt_inr(c["total"]) + " (INR)",
        max_w=108,
    )

    _draw(
        p1,
        fonts,
        f1["amount_words"],
        c["words"],
        max_w=690,
    )

    # -- page 2
    # p2_invoice_no / p2_ack_no / p2_irn are HIDDEN under a white box
    # in the original design. Their old text is purged in clean_template()
    # and deliberately NOT redrawn, so page 2 looks exactly like the original.
    _draw(
        p2,
        fonts,
        f2["p2_sign_date"],
        data["invoice_date"],
    )

    if qr_bytes:
        if qr_ext == "svg":
            svg = pymupdf.open(
                stream=qr_bytes,
                filetype="svg",
            )

            pdfb = svg.convert_to_pdf()

            p2.show_pdf_page(
                QR_RECT,
                pymupdf.open("pdf", pdfb),
                0,
            )
        else:
            p2.insert_image(
                QR_RECT,
                stream=qr_bytes,
                keep_proportion=True,
            )

    # -- metadata: never inherit the old title/XMP
    title = f"Tax Invoice {data['invoice_no']}"

    meta = {
        "title": title,
        "author": "Maxmoc Motor Works India Pvt Ltd",
        "subject": "",
        "keywords": "",
        "creator": "Maxmoc Invoice System",
        "producer": "Maxmoc Invoice System",
    }

    doc.set_metadata(meta)
    doc.del_xml_metadata()

    # -- public snapshot = page 1 ONLY, built as a separate file
    snap = pymupdf.open()

    snap.insert_pdf(
        doc,
        from_page=0,
        to_page=0,
    )

    snap.set_metadata(
        {
            **meta,
            "title": title + " (page 1)",
        }
    )

    snap.del_xml_metadata()

    outputs = {}

    for label, d in (
        ("full", doc),
        ("public_page1", snap),
    ):
        d.subset_fonts()

        buf = d.tobytes(
            garbage=4,
            deflate=True,
            clean=True,
        )

        outputs[label] = buf

    if out_dir:
        out_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        for label, b in outputs.items():
            (
                out_dir /
                f"{basename}_{label}.pdf"
            ).write_bytes(b)

    return dict(
        pdfs=outputs,
        computed=c,
        font_substitutes=fonts.substitutes,
    )


def sha256(b):
    return hashlib.sha256(b).hexdigest()