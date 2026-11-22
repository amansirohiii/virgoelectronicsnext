#!/usr/bin/env python3
"""
Builds the A4 product catalogue at public/downloads/virgo-catalogue.pdf from
scripts/.cache/catalogue.json. Nothing is typed in by hand: every name, figure
and spec comes from the site's data, and a value that is not in the data is
not printed.

Run `node scripts/export-catalogue.mjs` first. Needs reportlab and Pillow.
Usage: python scripts/build_catalogue_pdf.py

The script checks its own layout as it draws: every text line and picture is
recorded, and the build fails if anything leaves the page margins or if text
touches a picture or other text.
"""
from __future__ import annotations

import datetime
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CATALOGUE = ROOT / "scripts" / ".cache" / "catalogue.json"
IMAGE_CACHE = ROOT / "scripts" / ".cache" / "pdf-images"
OUT = PUBLIC / "downloads" / "virgo-catalogue.pdf"
MAX_BYTES = 6 * 1024 * 1024

PW, PH = A4
SIDE = 18 * mm
TOP = 18 * mm
FOOTER_BASE = 16.5 * mm  # footer baseline, measured from the bottom edge
BOTTOM = 26 * mm  # content stops this far above the bottom edge
CW = PW - 2 * SIDE
CONTENT_BOTTOM = PH - BOTTOM  # in top-down coordinates

# Colours from src/app/globals.css
INK = Color(22 / 255, 24 / 255, 27 / 255)
STEEL = Color(85 / 255, 91 / 255, 99 / 255)
LINE = Color(216 / 255, 214 / 255, 207 / 255)

# Scene keys to try for the cover and the dealer page; any scene fills in.
COVER_SCENES = ["cooler"]
DEALER_SCENES = ["pedestalFan"]


def register_fonts() -> None:
    faces = {
        "Heavy": [("/System/Library/Fonts/Avenir Next Condensed.ttc", 8), ("/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf", 0)],
        "Text": [("/System/Library/Fonts/Avenir Next.ttc", 7)],
        "TextMedium": [("/System/Library/Fonts/Avenir Next.ttc", 5)],
        "TextDemi": [("/System/Library/Fonts/Avenir Next.ttc", 2)],
    }
    for name, options in faces.items():
        for path, index in options:
            try:
                pdfmetrics.registerFont(TTFont(name, path, subfontIndex=index))
                break
            except Exception:  # noqa: BLE001 - try the next face
                continue
        else:
            sys.exit(f"No usable font for {name}")


def width(text: str, font: str, size: float) -> float:
    return pdfmetrics.stringWidth(text, font, size)


def sentence_case(text: str) -> str:
    """'Ceiling Fans' -> 'Ceiling fans'. Only for category names, never model names."""
    words = text.split(" ")
    return " ".join([words[0]] + [w.lower() for w in words[1:]])


def models(n: int) -> str:
    return f"{n} model" if n == 1 else f"{n} models"


def bare_url(url: str) -> str:
    return url.split("://", 1)[-1].rstrip("/")


# ---------- Images: downscaled once into the cache so the PDF stays small ----------


def prepared(src: str, max_side: int) -> tuple[str, int, int]:
    """JPEG copy of a public image, at most max_side pixels on its longer side, on white."""
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    source = PUBLIC / src.lstrip("/")
    out = IMAGE_CACHE / f"{src.strip('/').replace('/', '_').rsplit('.', 1)[0]}-{max_side}.jpg"
    im = Image.open(source)
    if not out.exists() or out.stat().st_mtime < source.stat().st_mtime:
        rgb = flatten(im)
        rgb.thumbnail((max_side, max_side), Image.LANCZOS)
        rgb.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    with Image.open(out) as done:
        return str(out), done.width, done.height


def flatten(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.getchannel("A"))
        return bg
    return im.convert("RGB")


def cover_crop(src: str, focus: str, box_w: float, box_h: float, max_w: int = 1800) -> str:
    """JPEG of the scene cropped to the box's proportions around its focus point."""
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    im = flatten(Image.open(PUBLIC / src.lstrip("/")))
    try:
        fx, fy = (float(p.strip().rstrip("%")) / 100 for p in focus.split())
    except ValueError:
        fx, fy = 0.5, 0.5
    ratio = box_w / box_h
    if im.width / im.height > ratio:
        cw, ch = round(im.height * ratio), im.height
    else:
        cw, ch = im.width, round(im.width / ratio)
    left = min(max(0, round(im.width * fx - cw / 2)), im.width - cw)
    top = min(max(0, round(im.height * fy - ch / 2)), im.height - ch)
    crop = im.crop((left, top, left + cw, top + ch))
    if crop.width > max_w:
        crop = crop.resize((max_w, round(max_w / ratio)), Image.LANCZOS)
    out = IMAGE_CACHE / f"{Path(src).stem}-{round(box_w)}x{round(box_h)}.jpg"
    crop.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    return str(out)


def logo_png() -> tuple[str, int, int]:
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    im = flatten(Image.open(PUBLIC / "brand" / "virgo-logo.png"))
    out = IMAGE_CACHE / "virgo-logo-on-white.png"
    im.save(out, "PNG", optimize=True)
    return str(out), im.width, im.height


# ---------- Drawing with a layout record ----------


@dataclass
class Box:
    kind: str  # "text", "image" or "footer"
    x0: float
    y0: float
    x1: float
    y1: float
    label: str = ""


@dataclass
class Doc:
    canvas: Canvas
    page: int = 1
    boxes: list[Box] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)
    text_by_page: list[list[str]] = field(default_factory=list)

    # Coordinates below are top-down: y is the distance from the top edge.

    def text(self, x: float, baseline: float, s: str, font: str, size: float, color=INK, align: str = "left") -> float:
        w = width(s, font, size)
        if align == "right":
            x -= w
        self.canvas.setFont(font, size)
        self.canvas.setFillColor(color)
        self.canvas.drawString(x, PH - baseline, s)
        self.boxes.append(Box("text", x, baseline - 0.74 * size, x + w, baseline + 0.22 * size, s))
        return w

    def para(self, x: float, top: float, s: str, font: str, size: float, w: float, leading: float, color=INK) -> float:
        """Wrapped text with its first line's capitals at top; returns the last baseline."""
        baseline = top + 0.72 * size
        for i, line in enumerate(simpleSplit(s, font, size, w)):
            self.text(x, baseline + i * leading, line, font, size, color)
        return baseline + (len(simpleSplit(s, font, size, w)) - 1) * leading

    def image(self, path: str, x: float, top: float, w: float, h: float, label: str = "") -> None:
        self.canvas.drawImage(path, x, PH - top - h, w, h)
        self.boxes.append(Box("image", x, top, x + w, top + h, label))

    def fit(self, path: str, iw: int, ih: int, x: float, top: float, bw: float, bh: float, valign: str = "middle") -> tuple[float, float]:
        """Draws the picture as large as fits the box, centred, never stretched."""
        scale = min(bw / iw, bh / ih)
        w, h = iw * scale, ih * scale
        dy = (bh - h) / 2 if valign == "middle" else 0
        self.image(path, x + (bw - w) / 2, top + dy, w, h, Path(path).stem)
        return w, h

    def rule(self, x0: float, x1: float, y: float, color=LINE, weight: float = 0.5) -> None:
        self.canvas.setStrokeColor(color)
        self.canvas.setLineWidth(weight)
        self.canvas.line(x0, PH - y, x1, PH - y)

    def link(self, x: float, baseline: float, w: float, size: float, url: str) -> None:
        self.canvas.linkURL(url, (x, PH - baseline - 0.25 * size, x + w, PH - baseline + 0.8 * size), relative=0)

    def footer(self) -> None:
        self.canvas.setFont("Text", 8.5)
        self.canvas.setFillColor(STEEL)
        self.canvas.drawString(SIDE, FOOTER_BASE, "Virgo Electronics")
        self.canvas.drawRightString(PW - SIDE, FOOTER_BASE, str(self.page))
        self.boxes.append(Box("footer", SIDE, PH - FOOTER_BASE - 7, PW - SIDE, PH - FOOTER_BASE + 2, "footer"))

    def end_page(self, footer: bool = True) -> None:
        if footer:
            self.footer()
        self.check(footer)
        self.text_by_page.append([b.label for b in self.boxes if b.kind == "text"])
        self.canvas.showPage()
        self.page += 1
        self.boxes = []

    def check(self, footer: bool) -> None:
        """Margins at least 15 mm, content above the footer, no text on pictures or text."""
        limit = 15 * mm - 0.5
        texts = [b for b in self.boxes if b.kind == "text"]
        images = [b for b in self.boxes if b.kind == "image"]
        for b in self.boxes:
            if b.x0 < limit or b.x1 > PW - limit or b.y0 < limit or b.y1 > PH - limit:
                self.problems.append(f"page {self.page}: '{b.label}' is outside the 15 mm margin")
            if footer and b.kind != "footer" and b.y1 > CONTENT_BOTTOM + 0.5:
                self.problems.append(f"page {self.page}: '{b.label}' runs into the footer")
        for t in texts:
            for i in images:
                if overlaps(t, i):
                    self.problems.append(f"page {self.page}: text '{t.label}' overlaps picture {i.label}")
        for n, a in enumerate(texts):
            for b in texts[n + 1 :]:
                if overlaps(a, b, 0.5):
                    self.problems.append(f"page {self.page}: text '{a.label}' overlaps '{b.label}'")


def overlaps(a: Box, b: Box, slack: float = 0.0) -> bool:
    return a.x0 < b.x1 - slack and b.x0 < a.x1 - slack and a.y0 < b.y1 - slack and b.y0 < a.y1 - slack


# ---------- Spec tables ----------

LABEL_W = 27 * mm
ROW_PAD = 3.6
TABLE_SIZE = 9
TABLE_LEADING = 12


def table_rows(rows: list[tuple[str, str]], w: float) -> list[tuple[str, list[str], float]]:
    value_w = w - LABEL_W
    out = []
    for label, value in rows:
        lines = simpleSplit(value, "Text", TABLE_SIZE, value_w - 2)
        out.append((label, lines, 2 * ROW_PAD + 0.95 * TABLE_SIZE + (len(lines) - 1) * TABLE_LEADING))
    return out


def table_height(rows: list[tuple[str, str]], w: float) -> float:
    return sum(h for _, _, h in table_rows(rows, w))


def draw_table(doc: Doc, x: float, top: float, w: float, rows: list[tuple[str, str]]) -> float:
    """Label and value columns aligned on every row, hairline between rows. Returns the bottom."""
    doc.rule(x, x + w, top, INK, 0.8)
    y = top
    for label, lines, h in table_rows(rows, w):
        base = y + ROW_PAD + 0.74 * TABLE_SIZE
        doc.text(x, base, label, "Text", TABLE_SIZE, STEEL)
        for i, line in enumerate(lines):
            doc.text(x + LABEL_W, base + i * TABLE_LEADING, line, "Text", TABLE_SIZE)
        y += h
        doc.rule(x, x + w, y)
    return y


# ---------- Product blocks ----------


def size_line(p: dict) -> str | None:
    d = p.get("dimensionsIn")
    if not d:
        return None
    return f"{d['w']} × {d['d']} × {d['h']} in (width × depth × height)"


def spec_rows(p: dict) -> list[tuple[str, str]]:
    key = p.get("keyFigure")
    # A row that only repeats the key figure printed above the table is left out.
    rows = [(s["label"], s["value"]) for s in p["specs"] if not (key and (s["label"], s["value"]) == (key["label"], key["value"]))]
    if p.get("dimensionsIn"):
        # The size line above the table already carries this row's value.
        d = p["dimensionsIn"]
        rows = [r for r in rows if r[1] != f"{d['w']} × {d['d']} × {d['h']} in"]
    return rows


@dataclass
class Layout:
    photo_w: float
    name_size: float
    key_size: float

    @property
    def text_x(self) -> float:
        return SIDE + self.photo_w + 9 * mm

    @property
    def text_w(self) -> float:
        return PW - SIDE - self.text_x


def block_height(p: dict, lay: Layout) -> float:
    return draw_block_text(None, p, lay, 0)


def draw_block_text(doc: Doc | None, p: dict, lay: Layout, top: float) -> float:
    """Name, kind, key figure, size line and spec table. Measures when doc is None."""
    x, w = lay.text_x, lay.text_w
    name_lines = simpleSplit(p["name"], "Heavy", lay.name_size, w)
    y = top + 0.72 * lay.name_size
    for i, line in enumerate(name_lines):
        if doc:
            doc.text(x, y + i * lay.name_size * 1.02, line, "Heavy", lay.name_size)
    y += (len(name_lines) - 1) * lay.name_size * 1.02
    y += 17
    if doc:
        doc.text(x, y, p["kind"], "TextMedium", 10.5, STEEL)
    key = p.get("keyFigure")
    if key:
        y += 19
        if doc:
            doc.text(x, y, key["label"], "Text", 8.5, STEEL)
        y += 6 + 0.78 * lay.key_size
        if doc:
            doc.text(x, y, key["value"], "Heavy", lay.key_size)
    line = size_line(p)
    if line:
        y += 18
        if doc:
            doc.text(x, y, f"Size {line}", "Text", 9, INK)
    y += 12
    rows = spec_rows(p)
    if doc:
        return draw_table(doc, x, y, w, rows)
    return y + table_height(rows, w) - top


def layout_for(items: list[dict]) -> tuple[Layout, int]:
    """Photo column width and models per page for a category, read from its data."""
    landscape = sum(1 for p in items if p["images"][0]["width"] > 1.3 * p["images"][0]["height"])
    sized = any(p.get("dimensionsIn") for p in items)
    if sized:  # coolers: two to a page, big
        return Layout(photo_w=0.40 * CW, name_size=34, key_size=24), 2
    photo_w = 0.46 * CW if landscape * 2 > len(items) else 0.38 * CW
    return Layout(photo_w=photo_w, name_size=26, key_size=18), 3


PRODUCT_TOP = TOP + 12 * mm
SLOT_GAP = 8 * mm
SLOT_PAD = 6 * mm  # space inside a slot above and below its photograph and text


SLOT_MAX = 115 * mm  # a lone model does not stretch down the whole page


def slot_height(avail: float, k: int) -> float:
    return min(SLOT_MAX, (avail - (k - 1) * SLOT_GAP) / k)


def fits(items: list[dict], lay: Layout, avail: float) -> bool:
    slot = slot_height(avail, len(items))
    return all(block_height(p, lay) <= slot - SLOT_PAD for p in items)


def pack(items: list[dict], lay: Layout, per_page: int) -> list[list[dict]]:
    """Fills pages in order: as many as per_page, fewer when a block would not fit."""
    avail = CONTENT_BOTTOM - PRODUCT_TOP
    pages, i = [], 0
    while i < len(items):
        k = min(per_page, len(items) - i)
        while k > 1 and not fits(items[i : i + k], lay, avail):
            k -= 1
        pages.append(items[i : i + k])
        i += k
    return pages


def draw_slots(doc: Doc, group: list[dict], lay: Layout, top: float, slot: float) -> None:
    """Products stacked in equal slots: photograph left, words and spec table right."""
    for n, p in enumerate(group):
        y = top + n * (slot + SLOT_GAP) + SLOT_PAD / 2
        path, iw, ih = prepared(p["images"][0]["src"], 900)
        doc.fit(path, iw, ih, SIDE, y, lay.photo_w, slot - SLOT_PAD, valign="top")
        draw_block_text(doc, p, lay, y + 2)
        if n < len(group) - 1:
            doc.rule(SIDE, PW - SIDE, y - SLOT_PAD / 2 + slot + SLOT_GAP / 2)


def product_page(doc: Doc, cat: dict, group: list[dict], lay: Layout, per_page: int) -> None:
    doc.text(SIDE, TOP + 7, sentence_case(cat["name"]), "TextMedium", 9.5, STEEL)
    doc.text(PW - SIDE, TOP + 7, cat["line"], "Text", 9.5, STEEL, align="right")
    doc.rule(SIDE, PW - SIDE, TOP + 12)
    avail = CONTENT_BOTTOM - PRODUCT_TOP
    # Slots keep the same height on every page of the category, so rows line up.
    slot = slot_height(avail, per_page)
    if any(block_height(p, lay) > slot - SLOT_PAD for p in group):
        slot = slot_height(avail, len(group))
    draw_slots(doc, group, lay, PRODUCT_TOP, slot)
    doc.end_page()


# ---------- Category openers ----------

OPENER_PIC = 100 * mm  # picture height on a category's own title page
INLINE_PIC = 62 * mm  # picture height when the models follow on the same page
PIC_GAP = 11 * mm
INTRO_W = 0.78 * CW


def draw_picture(doc: Doc, items: list[dict], scene: dict | None, h: float) -> None:
    """The category's room scene if it has one, otherwise a row of its photographs."""
    if scene:
        doc.image(cover_crop(scene["src"], scene.get("focus", "50% 50%"), CW, h), SIDE, TOP, CW, h, scene["key"])
        return
    shown = items[:4]
    gap = 6 * mm
    cell = (CW - gap * (len(shown) - 1)) / len(shown)
    for i, p in enumerate(shown):
        path, iw, ih = prepared(p["images"][0]["src"], 900)
        doc.fit(path, iw, ih, SIDE + i * (cell + gap), TOP, cell, h)


def draw_heading(doc: Doc | None, cat: dict, top: float) -> float:
    """Category name, line and intro. Returns the last baseline; measures when doc is None."""
    name_base = top + 0.72 * 48
    line_base = name_base + 22
    if doc:
        doc.text(SIDE, name_base, sentence_case(cat["name"]), "Heavy", 48)
        doc.text(SIDE, line_base, cat["line"], "TextMedium", 13, STEEL)
    intro = " ".join(cat.get("intro") or [])
    if not intro:
        return line_base
    if doc:
        return doc.para(SIDE, line_base + 14, intro, "Text", 11.5, INTRO_W, 17)
    return line_base + 14 + 0.72 * 11.5 + (len(simpleSplit(intro, "Text", 11.5, INTRO_W)) - 1) * 17


def heading_top(scene: dict | None) -> float:
    # Without a scene the model photographs below are the page's pictures.
    return TOP + INLINE_PIC + PIC_GAP if scene else TOP


def inline_top(cat: dict, scene: dict | None) -> float:
    """Where the model slots start when they share the category's title page."""
    return draw_heading(None, cat, heading_top(scene)) + 9 * mm


def fits_inline(cat: dict, items: list[dict], lay: Layout, per_page: int, scene: dict | None) -> bool:
    return len(items) <= per_page and fits(items, lay, CONTENT_BOTTOM - inline_top(cat, scene))


def inline_opener(doc: Doc, cat: dict, items: list[dict], lay: Layout, scene: dict | None) -> None:
    if scene:
        draw_picture(doc, items, scene, INLINE_PIC)
    draw_heading(doc, cat, heading_top(scene))
    top = inline_top(cat, scene)
    doc.rule(SIDE, PW - SIDE, top - 2 * mm, INK, 0.8)
    draw_slots(doc, items, lay, top, slot_height(CONTENT_BOTTOM - top, len(items)))
    doc.end_page()


def opener(doc: Doc, cat: dict, items: list[dict], pages: dict[str, int], scene: dict | None) -> None:
    """A title page for a bigger category: picture, words and a model list with page numbers."""
    row_h = 20
    list_h = 24 + 8 + len(items) * row_h
    words_h = draw_heading(None, cat, 0) + list_h
    pic_h = min(OPENER_PIC, CONTENT_BOTTOM - TOP - PIC_GAP - words_h)
    if pic_h < 45 * mm:
        pic_h = 0
    if pic_h:
        draw_picture(doc, items, scene, pic_h)
    y = draw_heading(doc, cat, TOP + (pic_h + PIC_GAP if pic_h else 0))
    y += 24
    summary = models(len(items)) + (f", {cat['range']}" if cat.get("range") else "")
    doc.text(SIDE, y, summary, "TextDemi", 10)
    y += 8
    doc.rule(SIDE, PW - SIDE, y, INK, 0.8)
    cols = (SIDE, SIDE + 0.34 * CW, SIDE + 0.74 * CW)
    for p in items:
        base = y + 14
        doc.text(cols[0], base, p["name"], "TextDemi", 10.5)
        doc.text(cols[1], base, p["kind"], "Text", 10, STEEL)
        if p.get("keyFigure"):
            doc.text(cols[2], base, p["keyFigure"]["value"], "Text", 10)
        doc.text(PW - SIDE, base, str(pages[p["path"]]), "Text", 10, STEEL, align="right")
        y += row_h
        doc.rule(SIDE, PW - SIDE, y)
    doc.end_page()


# ---------- Pages ----------


def scene_for(scenes: list[dict], cat: dict) -> dict | None:
    return next((s for s in scenes if s.get("category") == cat["slug"]), None)


def pick_scene(scenes: list[dict], keys: list[str], avoid: set[str]) -> dict | None:
    """A scene not in avoid if there is one, else the preferred key, else any scene."""
    fresh = [s for s in scenes if s["key"] not in avoid]
    for pool in (fresh, scenes):
        for key in keys:
            match = next((s for s in pool if s["key"] == key), None)
            if match:
                return match
        if pool:
            return pool[0]
    return None


def cover(doc: Doc, site: dict, scene: dict | None, logo: tuple[str, int, int]) -> None:
    path, lw, lh = logo
    logo_w = 62 * mm
    doc.image(path, SIDE, TOP, logo_w, logo_w * lh / lw, "logo")
    title_base = TOP + logo_w * lh / lw + 26 * mm
    doc.text(SIDE, title_base, "Product catalogue", "Heavy", 58)
    line = f"Coolers, fans, heaters, irons and madhani, made in {site['city']}"
    doc.text(SIDE, title_base + 26, line, "TextMedium", 14, STEEL)
    year_base = CONTENT_BOTTOM + 4 * mm
    pic_top = title_base + 48
    pic_h = year_base - 34 - 12 * mm - pic_top
    if scene:
        doc.image(cover_crop(scene["src"], scene.get("focus", "50% 50%"), CW, pic_h), SIDE, pic_top, CW, pic_h, scene["key"])
    doc.rule(SIDE, PW - SIDE, year_base - 30, INK, 1.2)
    doc.text(SIDE, year_base, str(datetime.date.today().year), "Heavy", 30)
    doc.text(PW - SIDE, year_base, bare_url(site["url"]), "TextMedium", 11, STEEL, align="right")
    doc.end_page(footer=False)


def contents(doc: Doc, rows: list[tuple[str, str, str, int]]) -> None:
    doc.text(SIDE, TOP + 32, "Contents", "Heavy", 44)
    y = TOP + 52
    doc.rule(SIDE, PW - SIDE, y, INK, 1.2)
    for name, line, count, page in rows:
        doc.text(SIDE, y + 30, name, "Heavy", 22)
        if line:
            doc.text(SIDE, y + 47, line, "Text", 10, STEEL)
        if count:
            doc.text(SIDE + 0.62 * CW, y + 30, count, "Text", 10.5)
        doc.text(PW - SIDE, y + 30, str(page), "TextDemi", 10.5, align="right")
        y += 62
        doc.rule(SIDE, PW - SIDE, y)
    doc.end_page()


def dealer_page(doc: Doc, site: dict, scene: dict | None) -> None:
    y = TOP
    if scene:
        h = 92 * mm
        doc.image(cover_crop(scene["src"], scene.get("focus", "50% 50%"), CW, h), SIDE, y, CW, h, scene["key"])
        y += h + 12 * mm
    base = y + 0.72 * 40
    doc.text(SIDE, base, "For dealers and distributors", "Heavy", 40)
    y = doc.para(
        SIDE,
        base + 16,
        "Shops that want to sell Virgo products, and firms that supply shops, can send us an enquiry "
        "on our website. Tell us about your shop or firm and we call you.",
        "Text",
        11.5,
        0.8 * CW,
        17,
    )
    url = site["url"].rstrip("/")
    contact = site.get("contact", {})
    rows: list[tuple[str, str, str | None]] = [
        ("Dealer enquiry", bare_url(f"{url}/partners/become-a-dealer"), f"{url}/partners/become-a-dealer"),
        ("Distributor enquiry", bare_url(f"{url}/partners/become-a-distributor"), f"{url}/partners/become-a-distributor"),
    ]
    if contact.get("replyWithin"):
        rows.append(("Reply", f"We reply within {contact['replyWithin']}.", None))
    if site.get("statements", {}).get("noApplicationFee") is True:
        rows.append(("Fee", "There is no fee to apply.", None))
    if contact.get("phone"):
        rows.append(("Phone", contact["phone"], None))
    if contact.get("whatsapp"):
        rows.append(("WhatsApp", f"+{contact['whatsapp']}", f"https://wa.me/{contact['whatsapp']}"))
    if contact.get("email"):
        rows.append(("Email", contact["email"], f"mailto:{contact['email']}"))
    if contact.get("address"):
        rows.append(("Address", ", ".join(contact["address"]), None))
    if contact.get("hours"):
        rows.append(("Hours", contact["hours"], None))

    y += 26
    doc.rule(SIDE, PW - SIDE, y, INK, 0.8)
    label_w = 42 * mm
    for label, value, href in rows:
        lines = simpleSplit(value, "TextMedium", 11, CW - label_w)
        base = y + 8 + 0.74 * 11
        doc.text(SIDE, base, label, "Text", 10.5, STEEL)
        for i, line in enumerate(lines):
            w = doc.text(SIDE + label_w, base + i * 15, line, "TextMedium", 11)
            if href:
                doc.link(SIDE + label_w, base + i * 15, w, 11, href)
        y += 16 + 0.95 * 11 + (len(lines) - 1) * 15
        doc.rule(SIDE, PW - SIDE, y)
    doc.end_page()


def back_cover(doc: Doc, site: dict, logo: tuple[str, int, int]) -> None:
    path, lw, lh = logo
    logo_w = 80 * mm
    logo_h = logo_w * lh / lw
    top = PH / 2 - logo_h - 10 * mm
    doc.image(path, (PW - logo_w) / 2, top, logo_w, logo_h, "logo")
    y = top + logo_h + 16 * mm
    url_text = bare_url(site["url"])
    w = width(url_text, "TextDemi", 14)
    doc.text((PW - w) / 2, y, url_text, "TextDemi", 14)
    doc.link((PW - w) / 2, y, w, 14, site["url"])
    location = ", ".join(v for v in [site.get("plantArea"), site.get("state")] if v)
    if location:
        lw2 = width(location, "Text", 11)
        doc.text((PW - lw2) / 2, y + 20, location, "Text", 11, STEEL)
    doc.end_page(footer=False)


# ---------- Build ----------


def main() -> None:
    if not CATALOGUE.exists():
        sys.exit("Run `node scripts/export-catalogue.mjs` first.")
    data = json.loads(CATALOGUE.read_text())
    site, categories, products = data["site"], data["categories"], data["products"]
    scenes = [s for s in data["scenes"] if (PUBLIC / s["src"].lstrip("/")).exists()]
    register_fonts()

    # Plan every page first so the contents and model lists can give page numbers.
    plan = []
    page = 3  # 1 is the cover, 2 the contents
    starts: dict[str, int] = {}
    product_pages: dict[str, int] = {}
    for cat in categories:
        items = [p for p in products if p["category"] == cat["slug"]]
        if not items:
            continue
        lay, per_page = layout_for(items)
        starts[cat["slug"]] = page
        if fits_inline(cat, items, lay, per_page, scene_for(scenes, cat)):
            # A small category: its models share the title page.
            groups = []
            product_pages.update({p["path"]: page for p in items})
        else:
            groups = pack(items, lay, per_page)
            for n, group in enumerate(groups, start=1):
                product_pages.update({p["path"]: page + n for p in group})
        page += 1 + len(groups)
        plan.append((cat, items, lay, per_page, groups))
    dealer_at = page

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(OUT), pagesize=A4, pageCompression=1)
    canvas.setTitle("Virgo product catalogue")
    canvas.setAuthor(site["name"])
    canvas.setSubject(f"Coolers, fans, heaters, irons and madhani, made in {site['city']}")
    doc = Doc(canvas)
    logo = logo_png()

    # Scenes no category page uses go to the cover and dealer page first.
    opener_keys = {s["key"] for s in (scene_for(scenes, c) for c, *_ in plan) if s}
    cover_scene = pick_scene(scenes, COVER_SCENES, opener_keys)
    dealer_scene = pick_scene(scenes, DEALER_SCENES, opener_keys | ({cover_scene["key"]} if cover_scene else set()))
    cover(doc, site, cover_scene, logo)
    rows = [(sentence_case(c["name"]), c["line"], models(len(items)), starts[c["slug"]]) for c, items, *_ in plan]
    rows.append(("For dealers and distributors", "How to enquire", "", dealer_at))
    contents(doc, rows)

    for cat, items, lay, per_page, groups in plan:
        scene = scene_for(scenes, cat)
        if not groups:
            inline_opener(doc, cat, items, lay, scene)
            continue
        opener(doc, cat, items, product_pages, scene)
        for group in groups:
            product_page(doc, cat, group, lay, per_page)

    dealer_page(doc, site, dealer_scene)
    back_cover(doc, site, logo)
    canvas.save()

    size = OUT.stat().st_size
    print(f"Wrote {OUT.relative_to(ROOT)}: {doc.page - 1} pages, {size / 1024 / 1024:.2f} MB")
    failed = False
    if size > MAX_BYTES:
        print("  Over 6 MB: lower the image sizes in prepared() and cover_crop().", file=sys.stderr)
        failed = True
    for problem in doc.problems:
        print(f"  Layout: {problem}", file=sys.stderr)
        failed = True
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
