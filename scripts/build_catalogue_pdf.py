#!/usr/bin/env python3
"""
Builds the A4 product catalogue at public/downloads/virgo-catalogue.pdf from
scripts/.cache/catalogue.json. Nothing is typed in by hand: every name, figure
and spec comes from the site's data, and a value that is not in the data is
not printed.

The look follows the website: paper-coloured pages, white cells for the
photographs, one red, condensed headings. Pictures carry the pages and the
figures sit in one table per range instead of being repeated under every model.

Run `node scripts/export-catalogue.mjs` first. Needs reportlab and Pillow.
Usage: python scripts/build_catalogue_pdf.py

The script checks its own layout as it draws: every text line and picture is
recorded, and the build fails if text leaves the page margins, runs into the
footer or touches other text.
"""
from __future__ import annotations

import datetime
import io
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
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
LOGO = PUBLIC / "brand" / "virgo-logo.png"
MAX_BYTES = 6 * 1024 * 1024
YEAR = datetime.date.today().year

PW, PH = A4
SIDE = 16 * mm
CW = PW - 2 * SIDE
GAP = 5 * mm
HEADER_TOP = 10 * mm
HEADER_LOGO_W = 21 * mm
FOOTER_BASE = PH - 11 * mm  # footer baseline, top-down
CONTENT_BOTTOM = PH - 20 * mm
MARGIN = 12 * mm  # no text closer to the edge than this
SECTION_GAP = 9 * mm
BANNER_MAX = 105 * mm
BANNER_MIN = 80 * mm
BANNER_GAP = 8 * mm

# Colours from src/app/globals.css
INK = Color(22 / 255, 24 / 255, 27 / 255)
STEEL = Color(85 / 255, 91 / 255, 99 / 255)
LINE = Color(216 / 255, 214 / 255, 207 / 255)
PAPER = Color(243 / 255, 242 / 255, 238 / 255)
RED = Color(214 / 255, 20 / 255, 29 / 255)
WHITE = Color(1, 1, 1)
ON_INK = Color(0.86, 0.85, 0.82)  # body text on the dark panels

DEALER_SCENES = ["pedestalFan"]
COVER_SCENES = ["cooler"]


def register_fonts() -> None:
    condensed = "/System/Library/Fonts/Avenir Next Condensed.ttc"
    regular = "/System/Library/Fonts/Avenir Next.ttc"
    faces = {
        "Display": [(condensed, 2), ("/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf", 0)],
        "Text": [(regular, 7)],
        "TextMedium": [(regular, 5)],
        "TextDemi": [(regular, 2)],
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


def listed(names: list[str]) -> str:
    return names[0] if len(names) == 1 else f"{', '.join(names[:-1])} and {names[-1]}"


# ---------- Images: downscaled once into the cache so the PDF stays small ----------


def flatten(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.getchannel("A"))
        return bg
    return im.convert("RGB")


def prepared(src: str, max_side: int = 900) -> tuple[str, int, int]:
    """JPEG copy of a public image, at most max_side pixels on its longer side, on white."""
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    source = PUBLIC / src.lstrip("/")
    out = IMAGE_CACHE / f"{src.strip('/').replace('/', '_').rsplit('.', 1)[0]}-{max_side}.jpg"
    if not out.exists() or out.stat().st_mtime < source.stat().st_mtime:
        rgb = flatten(Image.open(source))
        rgb.thumbnail((max_side, max_side), Image.LANCZOS)
        rgb.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    with Image.open(out) as done:
        return str(out), done.width, done.height


def scene_crop(scene: dict, box_w: float, box_h: float, shade: bool, max_w: int = 1800) -> str:
    """
    JPEG of a room scene cropped to the box's proportions around its focus point.
    With shade, the lower part is darkened so white words can sit on it.
    """
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    im = flatten(Image.open(PUBLIC / scene["src"].lstrip("/")))
    try:
        fx, fy = (float(p.strip().rstrip("%")) / 100 for p in scene.get("focus", "50% 50%").split())
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
    if shade:
        # Clear down to 45% of the height, then darkening to 78% black at the bottom edge.
        ramp = Image.new("L", (1, crop.height))
        start = 0.45 * crop.height
        for y in range(crop.height):
            t = max(0.0, (y - start) / (crop.height - start))
            ramp.putpixel((0, y), round(255 * 0.78 * t**1.3))
        crop = Image.composite(Image.new("RGB", crop.size, (16, 17, 19)), crop, ramp.resize(crop.size))
    out = IMAGE_CACHE / f"{Path(scene['src']).stem}-{round(box_w)}x{round(box_h)}{'-shade' if shade else ''}.jpg"
    crop.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    return str(out)


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
    """
    A page being drawn. Coordinates are top-down: y is the distance from the top edge.
    With canvas=None nothing is drawn, so the same code measures a block before placing it.
    """

    canvas: Canvas | None
    page: int = 1
    boxes: list[Box] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)

    @property
    def dry(self) -> bool:
        return self.canvas is None

    def fill(self, x: float, top: float, w: float, h: float, color=WHITE) -> None:
        if self.dry:
            return
        self.canvas.setFillColor(color)
        self.canvas.rect(x, PH - top - h, w, h, stroke=0, fill=1)

    def text(self, x: float, baseline: float, s: str, font: str, size: float, color=INK, align: str = "left") -> float:
        w = width(s, font, size)
        if self.dry:
            return w
        if align == "right":
            x -= w
        elif align == "center":
            x -= w / 2
        self.canvas.setFont(font, size)
        self.canvas.setFillColor(color)
        self.canvas.drawString(x, PH - baseline, s)
        self.boxes.append(Box("text", x, baseline - 0.74 * size, x + w, baseline + 0.22 * size, s))
        return w

    def para(self, x: float, top: float, s: str, font: str, size: float, w: float, leading: float, color=INK) -> float:
        """Wrapped text with its first line's capitals at top; returns the bottom of the last line."""
        lines = simpleSplit(s, font, size, w)
        baseline = top + 0.74 * size
        for i, line in enumerate(lines):
            self.text(x, baseline + i * leading, line, font, size, color)
        return baseline + (len(lines) - 1) * leading + 0.26 * size

    def image(self, path: str, x: float, top: float, w: float, h: float, label: str = "", mask=None) -> None:
        if self.dry:
            return
        self.canvas.drawImage(path, x, PH - top - h, w, h, mask=mask)
        self.boxes.append(Box("image", x, top, x + w, top + h, label))

    def fit(self, path: str, iw: int, ih: int, x: float, top: float, bw: float, bh: float) -> None:
        """Draws the picture as large as fits the box, centred, never stretched."""
        scale = min(bw / iw, bh / ih)
        w, h = iw * scale, ih * scale
        self.image(path, x + (bw - w) / 2, top + (bh - h) / 2, w, h, Path(path).stem)

    def photo(self, p: dict, x: float, top: float, w: float, h: float, pad: float = 3.5 * mm) -> None:
        """A product photograph in a white cell."""
        self.fill(x, top, w, h)
        if self.dry:
            return
        path, iw, ih = prepared(p["images"][0]["src"])
        self.fit(path, iw, ih, x + pad, top + pad, w - 2 * pad, h - 2 * pad)

    def logo(self, x: float, top: float, w: float) -> float:
        with Image.open(LOGO) as im:
            h = w * im.height / im.width
        self.image(str(LOGO), x, top, w, h, "logo", mask="auto")
        return h

    def rule(self, x0: float, x1: float, y: float, color=LINE, weight: float = 0.5) -> None:
        if self.dry:
            return
        self.canvas.setStrokeColor(color)
        self.canvas.setLineWidth(weight)
        self.canvas.line(x0, PH - y, x1, PH - y)

    def link(self, x: float, top: float, w: float, h: float, url: str) -> None:
        if not self.dry:
            self.canvas.linkURL(url, (x, PH - top - h, x + w, PH - top), relative=0)

    def jump(self, x: float, top: float, w: float, h: float, bookmark: str) -> None:
        if not self.dry:
            self.canvas.linkAbsolute("", bookmark, Rect=(x, PH - top - h, x + w, PH - top))

    def qr(self, url: str, x: float, top: float, size: float) -> None:
        if self.dry:
            return
        widget = QrCodeWidget(url, barLevel="M", barBorder=0)
        x0, y0, x1, y1 = widget.getBounds()
        drawing = Drawing(size, size, transform=[size / (x1 - x0), 0, 0, size / (y1 - y0), 0, 0])
        drawing.add(widget)
        renderPDF.draw(drawing, self.canvas, x, PH - top - size)
        self.boxes.append(Box("image", x, top, x + size, top + size, "qr"))

    # Pages

    def begin_page(self, background=PAPER) -> None:
        self.boxes = []
        self.fill(0, 0, PW, PH, background)

    def end_page(self, site: dict | None = None) -> None:
        """Pass site to print the footer."""
        if site:
            self.text(SIDE, FOOTER_BASE, site["name"], "TextMedium", 8, STEEL)
            self.text(PW / 2, FOOTER_BASE, bare_url(site["url"]), "Text", 8, STEEL, align="center")
            self.text(PW - SIDE, FOOTER_BASE, str(self.page), "TextDemi", 8.5, INK, align="right")
            for b in self.boxes[-3:]:
                b.kind = "footer"
        self.check(bool(site))
        if not self.dry:
            self.canvas.showPage()
        self.page += 1
        self.boxes = []

    def check(self, footer: bool) -> None:
        """Text keeps a 12 mm margin, stays above the footer and never touches other text."""
        texts = [b for b in self.boxes if b.kind == "text"]
        for b in texts:
            if b.x0 < MARGIN - 0.5 or b.x1 > PW - MARGIN + 0.5 or b.y0 < 6 * mm or b.y1 > PH - 6 * mm:
                self.problems.append(f"page {self.page}: '{b.label}' is outside the margin")
            if footer and b.y1 > CONTENT_BOTTOM + 0.5:
                self.problems.append(f"page {self.page}: '{b.label}' runs into the footer")
        for n, a in enumerate(texts):
            for b in texts[n + 1 :]:
                if overlaps(a, b, 0.5):
                    self.problems.append(f"page {self.page}: text '{a.label}' overlaps '{b.label}'")


def overlaps(a: Box, b: Box, slack: float = 0.0) -> bool:
    return a.x0 < b.x1 - slack and b.x0 < a.x1 - slack and a.y0 < b.y1 - slack and b.y0 < a.y1 - slack


# ---------- Page furniture ----------


def header(doc: Doc) -> float:
    """Small logo, the catalogue's name and a rule. Returns where the content starts."""
    h = doc.logo(SIDE, HEADER_TOP, HEADER_LOGO_W)
    doc.text(PW - SIDE, HEADER_TOP + h - 2, f"Product catalogue {YEAR}", "Text", 8, STEEL, align="right")
    doc.rule(SIDE, PW - SIDE, HEADER_TOP + h + 3 * mm, LINE, 0.6)
    return HEADER_TOP + h + 9 * mm


class Flow:
    """Places blocks down the page and starts a new page when one does not fit."""

    def __init__(self, doc: Doc, site: dict) -> None:
        self.doc, self.site = doc, site
        self.open = False
        self.y = 0.0

    def page(self, with_header: bool = True) -> None:
        self.close()
        self.doc.begin_page()
        self.open = True
        self.y = header(self.doc) if with_header else 0.0

    def close(self) -> None:
        if self.open:
            self.doc.end_page(self.site)
            self.open = False

    @property
    def room(self) -> float:
        return CONTENT_BOTTOM - self.y if self.open else 0.0


Block = tuple[float, Callable[[Doc, float], None]]


# ---------- Product cards ----------


def is_portrait(p: dict) -> bool:
    im = p["images"][0]
    return im["height"] > 1.2 * im["width"]


def card_key(p: dict) -> str:
    """The key figure for a card, unless the name or a spec row with the same label already says it."""
    key = p.get("keyFigure")
    if not key or key["value"].lower() in p["name"].lower():
        return ""
    return "" if any(s["label"] == key["label"] for s in p["specs"]) else key["value"]


def spec_rows(p: dict) -> list[tuple[str, str]]:
    """Specs for a card, without the rows the name line already says."""
    return [(s["label"], s["value"]) for s in p["specs"] if not (s["label"] == "Type" and s["value"].lower() == p["kind"].lower())]


def card_words(doc: Doc, p: dict, x: float, top: float, w: float, name_size: float, summary: bool) -> float:
    """Name with its key figure, kind, optional summary and the spec rows. Returns the bottom."""
    key = card_key(p)
    key_w = width(key, "TextDemi", 9.5) + 8 if key else 0
    names = simpleSplit(p["name"], "Display", name_size, w - key_w)
    base = top + 0.74 * name_size
    for i, line in enumerate(names):
        doc.text(x, base + i * name_size * 1.08, line, "Display", name_size)
    if key:
        doc.text(x + w, base, key, "TextDemi", 9.5, RED, align="right")
    y = base + (len(names) - 1) * name_size * 1.08 + 12
    doc.text(x, y, p["kind"], "Text", 8.5, STEEL)
    y += 3
    if summary and p.get("summary"):
        y = doc.para(x, y + 8, p["summary"], "Text", 9, w, 13.5)
    rows = spec_rows(p)
    if rows:
        y += 8
        label_w = max(width(label, "Text", 8) for label, _ in rows) + 10
        for label, value in rows:
            doc.rule(x, x + w, y)
            doc.text(x, y + 11, label, "Text", 8, STEEL)
            y = doc.para(x + label_w, y + 5.2, value, "Text", 8, w - label_w, 10.5) + 3
    return y


def side_card(doc: Doc, p: dict, x: float, top: float, w: float, h: float, photo_w: float, name_size: float, summary: bool) -> float:
    """Photograph on the left, words on the right, both inside one white cell. Returns the height needed."""
    pad = 5 * mm
    words_w = min(w - photo_w - pad - 2 * mm, 96 * mm)
    doc.fill(x, top, w, h)
    doc.photo(p, x, top, photo_w, h)
    bottom = card_words(doc, p, x + photo_w + 2 * mm, top + pad, words_w, name_size, summary)
    return bottom - top + pad


def stacked_card(doc: Doc, p: dict, x: float, top: float, w: float, h: float, photo_h: float, name_size: float) -> float:
    """Photograph on top, words below, in one white cell. Returns the height needed."""
    pad = 4.5 * mm
    doc.fill(x, top, w, h)
    doc.photo(p, x, top, w, photo_h)
    bottom = card_words(doc, p, x + pad, top + photo_h + 1 * mm, w - 2 * pad, name_size, False)
    return bottom - top + pad


def small_range(items: list[dict]) -> Block:
    """One to three models in a row, each card carrying its own specs."""
    n = len(items)
    w = (CW - (n - 1) * GAP) / n
    if n == 1:
        draw_one = lambda d, p, x, top, h: side_card(d, p, x, top, w, h, 58 * mm, 17, True)  # noqa: E731
        floor = 56 * mm
    elif all(is_portrait(p) for p in items):
        draw_one = lambda d, p, x, top, h: side_card(d, p, x, top, w, h, 36 * mm, 15, False)  # noqa: E731
        floor = 56 * mm
    else:
        photo_h = 50 * mm if n == 2 else 44 * mm
        draw_one = lambda d, p, x, top, h: stacked_card(d, p, x, top, w, h, photo_h, 15)  # noqa: E731
        floor = 0.0
    measure = Doc(None)
    h = max([floor] + [draw_one(measure, p, 0, 0, 0) for p in items])

    def draw(doc: Doc, top: float) -> None:
        for i, p in enumerate(items):
            draw_one(doc, p, SIDE + i * (w + GAP), top, h)

    return h, draw


def grid_rows(items: list[dict]) -> list[Block]:
    """Four or more models: a grid of photographs with the name and key figure under each."""
    portrait = sum(is_portrait(p) for p in items) * 2 > len(items)
    cols = 4 if portrait else 3
    w = (CW - (cols - 1) * GAP) / cols
    photo_h = w * (1.36 if portrait else 0.64)
    show_kind = len({p["kind"] for p in items}) > 1
    h = photo_h + (11.5 * mm if show_kind else 7.5 * mm)

    def row(group: list[dict]) -> Callable[[Doc, float], None]:
        def draw(doc: Doc, top: float) -> None:
            for i, p in enumerate(group):
                x = SIDE + i * (w + GAP)
                doc.photo(p, x, top, w, photo_h)
                base = top + photo_h + 5.4 * mm
                doc.text(x, base, p["name"], "Display", 12.5)
                key = (p.get("keyFigure") or {}).get("value")
                if key:
                    doc.text(x + w, base, key, "TextDemi", 9, RED, align="right")
                if show_kind:
                    doc.text(x, base + 4 * mm, p["kind"], "Text", 8, STEEL)

        return draw

    return [(h, row(items[i : i + cols])) for i in range(0, len(items), cols)]


# ---------- One table per range ----------

TABLE_SIZE = 8
TABLE_LEADING = 10.5
TABLE_PAD = 5 * mm
COL_GAP = 10


def split_columns(items: list[dict]) -> tuple[list[tuple[str, str]], list[tuple[str, str, list[str]]], list[str]]:
    """
    Sorts the spec labels of a range three ways:
    shared  - the same value on every model: said once above the table
    partial - one value on some models and nothing on the rest: said once below the table
    columns - everything else: a column each
    """
    labels: list[str] = []
    for p in items:
        for s in p["specs"]:
            if s["label"] not in labels:
                labels.append(s["label"])
    value = lambda p, label: next((s["value"] for s in p["specs"] if s["label"] == label), "")  # noqa: E731
    shared, partial, columns = [], [], []
    for label in labels:
        values = [value(p, label) for p in items]
        distinct = {v for v in values if v}
        if len(distinct) == 1 and all(values):
            shared.append((label, values[0]))
        elif len(distinct) == 1:
            partial.append((label, next(iter(distinct)), [p["name"] for p, v in zip(items, values) if v]))
        else:
            columns.append(label)
    return shared, partial, columns


def column_widths(head: list[str], body: list[list[str]], avail: float) -> list[float]:
    """Natural widths, then the widest columns give way until the table fits."""
    cols = len(head)
    natural = [
        max([width(head[c], "Text", 7.5)] + [width(r[c], "TextDemi" if c == 0 else "Text", TABLE_SIZE) for r in body]) + 1
        for c in range(cols)
    ]
    floor = [
        max(width(word, "TextDemi" if c == 0 else "Text", TABLE_SIZE) for r in body + [head] for word in (r[c].split() or [""])) + 1
        for c in range(cols)
    ]
    widths = natural[:]
    budget = avail - COL_GAP * (cols - 1)
    while sum(widths) > budget:
        c = max((i for i in range(cols) if widths[i] > floor[i]), key=lambda i: widths[i], default=None)
        if c is None:
            break
        widths[c] -= 1
    # Spare room is shared out so the last column ends at the cell's edge.
    spare = budget - sum(widths)
    if spare > 0:
        widths = [w + spare / cols for w in widths]
    return widths


def spec_table(cat: dict, items: list[dict]) -> Block | None:
    shared, partial, labels = split_columns(items)
    if not (shared or partial or labels):
        return None
    inner = CW - 2 * TABLE_PAD
    head = ["Model"] + labels
    value = lambda p, label: next((s["value"] for s in p["specs"] if s["label"] == label), "")  # noqa: E731
    body = [[p["name"]] + [value(p, label) for label in labels] for p in items]
    widths = column_widths(head, body, inner)
    notes = [f"{label}: {v} on {listed(names)}." for label, v, names in partial]

    def draw(doc: Doc, top: float, h: float = 0) -> float:
        doc.fill(SIDE, top, CW, h)
        x0 = SIDE + TABLE_PAD
        y = top + TABLE_PAD
        doc.text(x0, y + 10, f"{sentence_case(cat['name'])}: figures", "Display", 13.5)
        y += 17
        if shared:
            # Said once for the whole range instead of on every row.
            lead = f"All {len(items)} models"
            x = x0 + doc.text(x0, y + 10, lead, "TextDemi", 8.5) + 12
            for label, v in shared:
                need = width(f"{label} {v}", "Text", 8.5) + 4
                if x + need > x0 + inner:
                    x, y = x0, y + 12
                x += doc.text(x, y + 10, label, "Text", 8.5, STEEL) + 4
                x += doc.text(x, y + 10, v, "TextMedium", 8.5) + 14
            y += 17
        if labels:
            xs = [x0]
            for w in widths[:-1]:
                xs.append(xs[-1] + w + COL_GAP)
            for c, label in enumerate(head):
                doc.text(xs[c], y + 9, label, "Text", 7.5, STEEL)
            y += 13
            doc.rule(x0, x0 + inner, y, INK, 0.8)
            for row in body:
                cells = [simpleSplit(cell, "TextDemi" if c == 0 else "Text", TABLE_SIZE, widths[c]) for c, cell in enumerate(row)]
                for c, lines in enumerate(cells):
                    for i, line in enumerate(lines):
                        doc.text(xs[c], y + 12 + i * TABLE_LEADING, line, "TextDemi" if c == 0 else "Text", TABLE_SIZE)
                y += 17.5 + (max(len(lines) for lines in cells) - 1) * TABLE_LEADING
                doc.rule(x0, x0 + inner, y)
        for note in notes:
            y = doc.para(x0, y + 6, note, "Text", 8, inner, 11, STEEL)
        return y - top + TABLE_PAD

    h = draw(Doc(None), 0)
    return h, lambda doc, top: draw(doc, top, h)


# ---------- Size drawings ----------


def size_strip(items: list[dict]) -> Block | None:
    """Front outlines of every model at one scale, from the width and height in the data."""
    if not all(p.get("dimensionsIn") for p in items):
        return None
    slot = (CW - 2 * TABLE_PAD) / len(items)
    scale = min((slot - 2 * mm) / max(p["dimensionsIn"]["w"] for p in items), 30 * mm / max(p["dimensionsIn"]["h"] for p in items))
    tallest = max(p["dimensionsIn"]["h"] for p in items) * scale
    name_lines = max(len(simpleSplit(p["name"], "TextDemi", 7, slot - 3)) for p in items)
    h = TABLE_PAD + 17 + tallest + 11 + name_lines * 8.5 + 10 + TABLE_PAD

    def draw(doc: Doc, top: float) -> None:
        doc.fill(SIDE, top, CW, h)
        x0 = SIDE + TABLE_PAD
        doc.text(x0, top + TABLE_PAD + 10, "Sizes at one scale", "Display", 13.5)
        doc.text(PW - SIDE - TABLE_PAD, top + TABLE_PAD + 10, "Front view, width × height in inches", "Text", 8, STEEL, align="right")
        floor = top + TABLE_PAD + 17 + tallest
        doc.rule(x0, x0 + slot * len(items), floor, STEEL, 0.5)
        for i, p in enumerate(items):
            d = p["dimensionsIn"]
            w, hh = d["w"] * scale, d["h"] * scale
            cx = x0 + (i + 0.5) * slot
            if not doc.dry:
                doc.canvas.setStrokeColor(INK)
                doc.canvas.setFillColor(PAPER)
                doc.canvas.setLineWidth(0.8)
                doc.canvas.rect(cx - w / 2, PH - floor, w, hh, stroke=1, fill=1)
            base = floor + 11
            for n, line in enumerate(simpleSplit(p["name"], "TextDemi", 7, slot - 3)):
                doc.text(cx, base + n * 8.5, line, "TextDemi", 7, align="center")
            doc.text(cx, base + name_lines * 8.5 + 1, f"{d['w']} × {d['h']}", "Text", 7, STEEL, align="center")

    return h, draw


def pipe_ends(items: list[dict]) -> Block | None:
    """Cut ends of the pipes drawn at their real diameter on the printed page."""
    if not all(p.get("pipe") for p in items):
        return None
    biggest = max(p["pipe"]["outerMm"] for p in items) * mm
    h = TABLE_PAD + 17 + biggest + 16 + TABLE_PAD

    def draw(doc: Doc, top: float) -> None:
        doc.fill(SIDE, top, CW, h)
        x0 = SIDE + TABLE_PAD
        doc.text(x0, top + TABLE_PAD + 10, "Cut ends at real size", "Display", 13.5)
        doc.text(PW - SIDE - TABLE_PAD, top + TABLE_PAD + 10, "True to size when printed on A4 at 100%", "Text", 8, STEEL, align="right")
        floor = top + TABLE_PAD + 17 + biggest
        x = x0 + 6 * mm
        for p in items:
            dia = p["pipe"]["outerMm"] * mm
            cx, cy = x + dia / 2, floor - dia / 2
            if not doc.dry:
                c = doc.canvas
                c.setStrokeColor(INK)
                c.setFillColor(PAPER)
                c.setLineWidth(1.1)
                c.circle(cx, PH - cy, dia / 2, stroke=1, fill=1)
                c.setStrokeColor(STEEL)
                c.setLineWidth(0.5)
                c.line(cx - 5, PH - cy, cx + 5, PH - cy)
                c.line(cx, PH - cy - 5, cx, PH - cy + 5)
            doc.text(cx, floor + 12, f"{p['pipe']['outerMm']} mm", "TextDemi", 8.5, align="center")
            x += dia + 16 * mm
        doc.rule(x0, x - 10 * mm, floor, STEEL, 0.5)

    return h, draw


# ---------- A range ----------

STRIP_H = 13 * mm


def strip(doc: Doc, cat: dict, top: float) -> None:
    """Heading for a range that has no room scene: a red mark, the name and its one-line description."""
    base = top + 7.2 * mm
    doc.fill(SIDE, base - 3.1 * mm, 2.6 * mm, 2.6 * mm, RED)
    doc.text(SIDE + 5 * mm, base, sentence_case(cat["name"]), "Display", 20)
    doc.text(PW - SIDE, base, cat["line"], "Text", 9.5, STEEL, align="right")
    doc.rule(SIDE, PW - SIDE, top + 10 * mm, INK, 0.8)


def banner(doc: Doc, title: str, line: str, scene: dict, h: float, caption: bool = True) -> None:
    """A room scene across the full page with the heading on its shaded lower edge."""
    doc.image(scene_crop(scene, PW, h, shade=True), 0, 0, PW, h, scene["key"])
    doc.fill(0, h, PW, 1.6 * mm, RED)
    doc.text(SIDE, h - 15 * mm, title, "Display", 30, WHITE)
    doc.text(SIDE, h - 7.5 * mm, line, "TextMedium", 10.5, WHITE)
    model = scene.get("model")
    if caption and model:
        doc.text(PW - SIDE, h - 7.5 * mm, f"Shown: {model['name']}", "Text", 8, WHITE, align="right")


def range_blocks(cat: dict, items: list[dict]) -> list[Block]:
    if len(items) <= 3:
        blocks = [small_range(items)]
    else:
        blocks = grid_rows(items) + [b for b in [spec_table(cat, items)] if b]
    blocks += [b for b in (size_strip(items), pipe_ends(items)) if b]
    return blocks


def draw_range(flow: Flow, cat: dict, items: list[dict], scene: dict | None, starts: dict[str, int]) -> None:
    doc = flow.doc
    blocks = range_blocks(cat, items)
    total = sum(h for h, _ in blocks) + GAP * (len(blocks) - 1)
    if scene:
        h = BANNER_MAX
        if total + BANNER_MIN + BANNER_GAP <= CONTENT_BOTTOM < total + BANNER_MAX + BANNER_GAP:
            h = CONTENT_BOTTOM - total - BANNER_GAP  # a shorter picture keeps the range on one page
        flow.page(with_header=False)
        banner(doc, sentence_case(cat["name"]), cat["line"], scene, h)
        flow.y = h + BANNER_GAP
    else:
        # The block above already left GAP below itself.
        lead = SECTION_GAP - GAP
        if flow.room < lead + STRIP_H + blocks[0][0] - 0.5:
            flow.page()
        else:
            flow.y += lead
        strip(doc, cat, flow.y)
        flow.y += STRIP_H
    starts[cat["slug"]] = doc.page
    if not doc.dry:
        doc.canvas.bookmarkPage(cat["slug"])
        doc.canvas.addOutlineEntry(sentence_case(cat["name"]), cat["slug"], level=0)
    for h, draw in blocks:
        if flow.room < h - 0.5:  # half a point of slack for rounding
            flow.page()
        draw(doc, flow.y)
        flow.y += h + GAP


# ---------- Pages ----------


def scene_for(scenes: list[dict], cat: dict) -> dict | None:
    return next((s for s in scenes if s.get("category") == cat["slug"]), None)


def pick_scene(scenes: list[dict], keys: list[str]) -> dict | None:
    for key in keys:
        match = next((s for s in scenes if s["key"] == key), None)
        if match:
            return match
    return scenes[0] if scenes else None


def face_of(cat: dict, items: list[dict], scenes: list[dict]) -> dict:
    """The model that stands for its range: the one in its room scene, else the first."""
    scene = scene_for(scenes, cat)
    slug = (scene or {}).get("model", {}).get("slug")
    return next((p for p in items if p["slug"] == slug), items[0])


def cover(doc: Doc, site: dict, ranges: list[tuple[dict, list[dict]]], scenes: list[dict], total: int) -> None:
    doc.begin_page(WHITE)
    logo_h = doc.logo(SIDE, 13 * mm, 58 * mm)
    doc.text(PW - SIDE, 13 * mm + logo_h - 9 * mm, "Product catalogue", "Display", 22, align="right")
    doc.text(PW - SIDE, 13 * mm + logo_h - 2.5 * mm, str(YEAR), "TextMedium", 11, STEEL, align="right")

    pic_top = 13 * mm + logo_h + 9 * mm
    pic_h = 168 * mm
    scene = pick_scene(scenes, COVER_SCENES)
    doc.fill(0, pic_top - 1.6 * mm, PW, 1.6 * mm, RED)
    if scene:
        doc.image(scene_crop(scene, PW, pic_h, shade=False), 0, pic_top, PW, pic_h, scene["key"])
    band = pic_top + pic_h
    doc.fill(0, band, PW, PH - band, INK)

    doc.text(SIDE, band + 14 * mm, site["descriptor"], "Display", 26, WHITE)
    doc.text(SIDE, band + 21 * mm, f"Since {site['founded']}. {models(total)} in {len(ranges)} ranges.", "Text", 10.5, ON_INK)

    # The whole range as a strip of small photographs.
    n = len(ranges)
    gap = 3 * mm
    cell = (CW - (n - 1) * gap) / n
    top = band + 29 * mm
    for i, (cat, items) in enumerate(ranges):
        x = SIDE + i * (cell + gap)
        doc.photo(face_of(cat, items, scenes), x, top, cell, cell, pad=1.6 * mm)
        doc.text(x + cell / 2, top + cell + 4.2 * mm, sentence_case(cat["name"]), "Text", 6.6, ON_INK, align="center")

    doc.text(SIDE, PH - 13 * mm, bare_url(site["url"]), "TextMedium", 10, WHITE)
    place = ", ".join(v for v in [site.get("city"), site.get("state")] if v)
    doc.text(PW - SIDE, PH - 13 * mm, place, "Text", 10, ON_INK, align="right")
    doc.end_page()


def range_page(doc: Doc, site: dict, ranges: list[tuple[dict, list[dict]]], scenes: list[dict], starts: dict[str, int], dealer_at: int, total: int) -> None:
    """Contents, as pictures: every range with its count and page."""
    doc.begin_page()
    y = header(doc)
    doc.text(SIDE, y + 8 * mm, "The range", "Display", 26)
    doc.text(PW - SIDE, y + 8 * mm, f"{models(total)} in {len(ranges)} ranges", "Text", 9.5, STEEL, align="right")
    y += 14 * mm
    cols = 3
    w = (CW - (cols - 1) * GAP) / cols
    photo_h = 54 * mm
    tile_h = photo_h + 13 * mm
    for i, (cat, items) in enumerate(ranges):
        x = SIDE + (i % cols) * (w + GAP)
        top = y + (i // cols) * (tile_h + 4 * mm)
        doc.photo(face_of(cat, items, scenes), x, top, w, photo_h, pad=5 * mm)
        base = top + photo_h + 6 * mm
        doc.text(x, base, sentence_case(cat["name"]), "Display", 14)
        doc.text(x + w, base, f"Page {starts.get(cat['slug'], 0)}", "TextMedium", 8.5, RED, align="right")
        detail = models(len(items)) + (f", {cat['range']}" if cat.get("range") else "")
        doc.text(x, base + 4.4 * mm, detail, "Text", 8.5, STEEL)
        doc.jump(x, top, w, tile_h, cat["slug"])
    rows = (len(ranges) + cols - 1) // cols
    top = y + rows * (tile_h + 4 * mm) + 2 * mm
    h = 15 * mm
    if top + h <= CONTENT_BOTTOM:
        doc.fill(SIDE, top, CW, h, INK)
        doc.text(SIDE + 6 * mm, top + 9.4 * mm, "For dealers and distributors", "Display", 15, WHITE)
        doc.text(PW - SIDE - 6 * mm, top + 9.2 * mm, f"Page {dealer_at}", "TextMedium", 8.5, WHITE, align="right")
        doc.jump(SIDE, top, CW, h, "dealers")
    doc.end_page(site)


def dealer_page(doc: Doc, site: dict, scene: dict | None) -> None:
    doc.begin_page()
    if not doc.dry:
        doc.canvas.bookmarkPage("dealers")
        doc.canvas.addOutlineEntry("For dealers and distributors", "dealers", level=0)
    title, line = "For dealers and distributors", "Send an enquiry on our website and we call you."
    if scene:
        h = BANNER_MAX
        banner(doc, title, line, scene, h, caption=False)
        y = h + 10 * mm
    else:
        y = header(doc)
        doc.text(SIDE, y + 9 * mm, title, "Display", 28)
        doc.text(SIDE, y + 16 * mm, line, "TextMedium", 10.5, STEEL)
        y += 24 * mm

    url = site["url"].rstrip("/")
    contact = site.get("contact", {})
    qr_w = 46 * mm
    left_w = CW - qr_w - GAP
    paths = [
        ("Dealers", "Shops that want to sell Virgo products.", f"{url}/partners/become-a-dealer"),
        ("Distributors", "Firms that supply shops in their area.", f"{url}/partners/become-a-distributor"),
    ]
    cell_h = 27 * mm
    for i, (name, words, href) in enumerate(paths):
        top = y + i * (cell_h + GAP)
        doc.fill(SIDE, top, left_w, cell_h)
        doc.fill(SIDE, top, 1.2 * mm, cell_h, RED)
        x = SIDE + 7 * mm
        doc.text(x, top + 9.5 * mm, name, "Display", 17)
        doc.text(x, top + 15.5 * mm, words, "Text", 9.5, STEEL)
        doc.text(x, top + 21.5 * mm, bare_url(href), "TextMedium", 9)
        doc.link(SIDE, top, left_w, cell_h, href)

    # A code to scan: the catalogue is often read on paper or forwarded as a file.
    block_h = 2 * cell_h + GAP
    qx = PW - SIDE - qr_w
    doc.fill(qx, y, qr_w, block_h, INK)
    plate = qr_w - 12 * mm
    doc.fill(qx + 6 * mm, y + 6 * mm, plate, plate)
    doc.qr(f"{url}/partners", qx + 8 * mm, y + 8 * mm, plate - 4 * mm)
    doc.text(qx + qr_w / 2, y + plate + 13 * mm, "Scan to send", "TextMedium", 9, WHITE, align="center")
    doc.text(qx + qr_w / 2, y + plate + 17.5 * mm, "an enquiry", "TextMedium", 9, WHITE, align="center")
    doc.link(qx, y, qr_w, block_h, f"{url}/partners")
    y += block_h + GAP

    facts: list[tuple[str, str]] = []
    if contact.get("replyWithin"):
        facts.append((contact["replyWithin"].capitalize(), "We reply to every enquiry within this time."))
    if site.get("statements", {}).get("noApplicationFee") is True:
        facts.append(("No fee", "There is no fee to apply."))
    if facts:
        w = (CW - (len(facts) - 1) * GAP) / len(facts)
        for i, (figure, words) in enumerate(facts):
            x = SIDE + i * (w + GAP)
            doc.fill(x, y, w, 21 * mm)
            doc.text(x + 7 * mm, y + 10 * mm, figure, "Display", 19, RED)
            doc.text(x + 7 * mm, y + 16 * mm, words, "Text", 9, STEEL)
        y += 21 * mm + GAP

    rows: list[tuple[str, str, str | None]] = []
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
    if rows:
        label_w = 30 * mm
        inner = CW - 14 * mm
        measure = sum(len(simpleSplit(v, "TextMedium", 10, inner - label_w)) * 14 + 8 for _, v, _ in rows)
        doc.fill(SIDE, y, CW, measure + 8 * mm)
        yy = y + 4 * mm
        for n, (label, value, href) in enumerate(rows):
            if n:
                doc.rule(SIDE + 7 * mm, PW - SIDE - 7 * mm, yy)
            lines = simpleSplit(value, "TextMedium", 10, inner - label_w)
            doc.text(SIDE + 7 * mm, yy + 14, label, "Text", 9.5, STEEL)
            for i, text_line in enumerate(lines):
                doc.text(SIDE + 7 * mm + label_w, yy + 14 + i * 14, text_line, "TextMedium", 10)
            if href:
                doc.link(SIDE + 7 * mm + label_w, yy + 2, inner - label_w, len(lines) * 14 + 6, href)
            yy += len(lines) * 14 + 8
        y += measure + 8 * mm + GAP
    closing(doc, site, y)
    doc.end_page(site)


def closing(doc: Doc, site: dict, top: float) -> None:
    """Logo, website and place, centred in what is left of the last page."""
    logo_w = 52 * mm
    with Image.open(LOGO) as im:
        logo_h = logo_w * im.height / im.width
    block = logo_h + 20 * mm
    if CONTENT_BOTTOM - top < block + 8 * mm:
        return
    y = top + (CONTENT_BOTTOM - top - block) / 2
    doc.logo((PW - logo_w) / 2, y, logo_w)
    y += logo_h + 6 * mm
    doc.fill(PW / 2 - 8 * mm, y, 16 * mm, 1.1 * mm, RED)
    y += 9.5 * mm
    doc.text(PW / 2, y, bare_url(site["url"]), "TextDemi", 11.5, align="center")
    doc.link(PW / 2 - 45 * mm, y - 4.5 * mm, 90 * mm, 7 * mm, site["url"])
    place = ", ".join(v for v in [site.get("plantArea"), site.get("state")] if v)
    if place:
        doc.text(PW / 2, y + 5.5 * mm, place, "Text", 9.5, STEEL, align="center")


# ---------- Build ----------


def build(target, data: dict, starts: dict[str, int], dealer_at: int) -> tuple[Doc, dict[str, int], int]:
    """Draws the whole catalogue. starts and dealer_at are the page numbers printed on the contents page."""
    site, categories, products = data["site"], data["categories"], data["products"]
    scenes = [s for s in data["scenes"] if (PUBLIC / s["src"].lstrip("/")).exists()]
    ranges = [(c, [p for p in products if p["category"] == c["slug"]]) for c in categories]
    ranges = [(c, items) for c, items in ranges if items]
    total = sum(len(items) for _, items in ranges)

    canvas = Canvas(target, pagesize=A4, pageCompression=1)
    canvas.setTitle(f"Virgo product catalogue {YEAR}")
    canvas.setAuthor(site["name"])
    canvas.setSubject(site["descriptor"])
    doc = Doc(canvas)

    cover(doc, site, ranges, scenes, total)
    range_page(doc, site, ranges, scenes, starts, dealer_at, total)

    found: dict[str, int] = {}
    flow = Flow(doc, site)
    dealer_scene = pick_scene(scenes, DEALER_SCENES)
    for cat, items in ranges:
        scene = scene_for(scenes, cat)
        # Room scenes open the bigger ranges; the dealer page keeps its own.
        if scene and (len(items) < 3 or scene is dealer_scene):
            scene = None
        draw_range(flow, cat, items, scene, found)
    flow.close()

    dealer_found = doc.page
    dealer_page(doc, site, dealer_scene)
    canvas.save()
    return doc, found, dealer_found


def main() -> None:
    if not CATALOGUE.exists():
        sys.exit("Run `node scripts/export-catalogue.mjs` first.")
    data = json.loads(CATALOGUE.read_text())
    register_fonts()

    # First pass finds the page each range lands on; the second prints those numbers.
    _, starts, dealer_at = build(io.BytesIO(), data, {}, 0)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc, again, dealer_again = build(str(OUT), data, starts, dealer_at)
    if (again, dealer_again) != (starts, dealer_at):
        sys.exit("Page numbers moved between the two passes.")

    size = OUT.stat().st_size
    print(f"Wrote {OUT.relative_to(ROOT)}: {doc.page - 1} pages, {size / 1024 / 1024:.2f} MB")
    for slug, page in starts.items():
        print(f"  {slug}: page {page}")
    print(f"  dealers: page {dealer_at}")
    failed = False
    if size > MAX_BYTES:
        print("  Over 6 MB: lower the sizes in prepared() and scene_crop().", file=sys.stderr)
        failed = True
    for problem in doc.problems:
        print(f"  Layout: {problem}", file=sys.stderr)
        failed = True
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
