"""Create the cleaned quotation template from the untouched original.

Run from the backend directory after ensuring the original template is at
`templates/original_quotation.pdf`.
"""
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "templates" / "original_quotation.pdf"
OUT = ROOT / "templates" / "quotation_template.pdf"
FONT = ROOT / "fonts" / "Poppins-Regular.ttf"

page_index = 10  # PDF page 11

doc = fitz.open(SRC)
page = doc[page_index]
for rect in (
    fitz.Rect(226, 641, 510, 670),  # address + old PIN
    fitz.Rect(222, 742, 512, 801),  # overlapping Axis/HDFC bank block
):
    page.add_redact_annot(rect, fill=False)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)

color = (19 / 255, 20 / 255, 21 / 255)
size = 8.845399856567383
lines = [
    ("3/94, N.Panjampatti, Alamarathupatti,", (229.18272399902344, 651.9042358398438)),
    ("Dindigul-624303", (229.18272399902344, 663.4032592773438)),
    ("Bank Name : HDFC Bank Limited", (225.83030700683594, 754.3959350585938)),
    ("Bank Account Name : Maxmoc Motor Works India Private Limited", (225.83030700683594, 767.398681640625)),
    ("Bank Account No : 50200074826031", (225.83030700683594, 780.4013671875)),
    ("Bank IFSC code: HDFC0001850", (225.83030700683594, 793.4041137695312)),
]
for text, origin in lines:
    page.insert_text(origin, text, fontfile=str(FONT), fontsize=size, color=color, fontname="PoppinsRegular")

doc.set_metadata({
    "title": "MMW Quotation Template",
    "author": "Maxmoc Motor Works India Pvt Ltd",
    "subject": "",
    "keywords": "",
    "creator": "Maxmoc Quotation System",
    "producer": "Maxmoc Quotation System",
})
doc.del_xml_metadata()
OUT.write_bytes(doc.tobytes(garbage=4, deflate=True))
print(f"Wrote {OUT}")
