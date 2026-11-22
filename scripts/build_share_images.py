#!/usr/bin/env python3
"""
Builds the 1200 x 630 share images (Open Graph, WhatsApp, LinkedIn) for every
public page from scripts/.cache/catalogue.json, and writes
src/content/share-images.json, which src/lib/seo.ts reads.

Run `node scripts/export-catalogue.mjs` first. Needs Pillow with WebP support.
Usage: python scripts/build_share_images.py
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CATALOGUE = ROOT / "scripts" / ".cache" / "catalogue.json"
OUT_DIR = PUBLIC / "og"
MANIFEST = ROOT / "src" / "content" / "share-images.json"

W, H = 1200, 630
QUALITY = 88
MAX_BYTES = 200 * 1024

# Colours from src/app/globals.css
WHITE = (255, 255, 255)
INK = (22, 24, 27)
STEEL = (85, 91, 99)
LINE = (216, 214, 207)

CONDENSED = "/System/Library/Fonts/Avenir Next Condensed.ttc"
CONDENSED_HEAVY = 8
TEXT = "/System/Library/Fonts/Avenir Next.ttc"
TEXT_REGULAR, TEXT_MEDIUM = 7, 5
DIN_FALLBACK = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"

# Static pages: path, file name, short title, scene keys in order of preference.
# Scene keys that do not exist are skipped; any scene can fill in.
PAGES = [
    ("/", "home", None, ["cooler"]),
    ("/products", "products", "All products", ["ceilingFan"]),
    ("/partners", "partners", "For dealers and distributors", ["pedestalFan"]),
    ("/partners/become-a-dealer", "become-a-dealer", "Become a Virgo dealer", ["heater"]),
    ("/partners/become-a-distributor", "become-a-distributor", "Become a Virgo distributor", ["cooler"]),
    ("/bulk-orders", "bulk-orders", "Bulk orders", ["pedestalFan"]),
    ("/about", "about", "About us", ["ceilingFan"]),
    ("/contact", "contact", "Contact us", ["heater"]),
]


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size, index=index)
    except OSError:
        if path == CONDENSED:
            return ImageFont.truetype(DIN_FALLBACK, size)
        raise


def heavy(size: int) -> ImageFont.FreeTypeFont:
    return font(CONDENSED, size, CONDENSED_HEAVY)


def sentence_case(text: str) -> str:
    """'Ceiling Fans' -> 'Ceiling fans'. Only for category names, never model names."""
    words = text.split(" ")
    return " ".join([words[0]] + [w.lower() for w in words[1:]])


def models(n: int) -> str:
    return f"{n} model" if n == 1 else f"{n} models"


def open_rgb(src: str) -> Image.Image:
    im = Image.open(PUBLIC / src.lstrip("/"))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, WHITE)
        bg.paste(im, mask=im.getchannel("A"))
        return bg
    return im.convert("RGB")


def paste_fit(canvas: Image.Image, src: str, box: tuple[int, int, int, int]) -> None:
    """Scale the photograph to fit inside box, centred, keeping its proportions."""
    im = open_rgb(src)
    x0, y0, x1, y1 = box
    scale = min((x1 - x0) / im.width, (y1 - y0) / im.height)
    size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    im = im.resize(size, Image.LANCZOS)
    canvas.paste(im, (x0 + (x1 - x0 - size[0]) // 2, y0 + (y1 - y0 - size[1]) // 2))


def paste_cover(canvas: Image.Image, src: str, box: tuple[int, int, int, int], focus: str) -> None:
    """Fill box with the photograph (cover), cropped around the scene's focus point."""
    im = open_rgb(src)
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    scale = max(bw / im.width, bh / im.height)
    size = (max(bw, round(im.width * scale)), max(bh, round(im.height * scale)))
    im = im.resize(size, Image.LANCZOS)
    try:
        fx, fy = (float(p.strip().rstrip("%")) / 100 for p in focus.split())
    except ValueError:
        fx, fy = 0.5, 0.5
    # Centre the focus point in the box where the edges allow, so the product stays whole.
    left = min(max(0, round(size[0] * fx - bw / 2)), size[0] - bw)
    top = min(max(0, round(size[1] * fy - bh / 2)), size[1] - bh)
    canvas.paste(im.crop((left, top, left + bw, top + bh)), (x0, y0))


def logo(canvas: Image.Image, width: int, right: int, bottom: int) -> None:
    im = Image.open(PUBLIC / "brand" / "virgo-logo.png").convert("RGBA")
    height = round(im.height * width / im.width)
    im = im.resize((width, height), Image.LANCZOS)
    canvas.paste(im, (right - width, bottom - height), im)


def wrap(text: str, f: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    lines: list[str] = []
    for word in text.split():
        trial = f"{lines[-1]} {word}" if lines else word
        if lines and f.getlength(trial) <= max_w:
            lines[-1] = trial
        else:
            lines.append(word)
    return lines


def fit_heading(text: str, max_w: int, sizes: range, max_lines: int) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    """Largest heavy condensed size at which text wraps into max_lines within max_w."""
    f, lines = heavy(sizes.start), [text]
    for size in sizes:
        f = heavy(size)
        lines = wrap(text, f, max_w)
        if len(lines) <= max_lines and all(f.getlength(l) <= max_w for l in lines):
            break
    return f, lines


def cap(f: ImageFont.FreeTypeFont) -> int:
    """Height of a capital letter above the baseline, for placing text by its visible top."""
    return -f.getbbox("H", anchor="ls")[1]


def draw_lines(d: ImageDraw.ImageDraw, x: int, top: int, lines: list[str], f, fill, leading: float) -> int:
    """Draws lines with the first line's capitals starting at top; returns the last baseline."""
    step = round(f.size * leading)
    baseline = top + cap(f)
    for i, line in enumerate(lines):
        d.text((x, baseline + i * step), line, font=f, fill=fill, anchor="ls")
    return baseline + (len(lines) - 1) * step


def save(canvas: Image.Image, name: str) -> str:
    """Saves as progressive JPG; steps quality down only if 88 would exceed the size budget."""
    path = OUT_DIR / f"{name}.jpg"
    quality = QUALITY
    while True:
        buf = io.BytesIO()
        canvas.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
        if buf.tell() <= MAX_BYTES or quality <= 70:
            break
        quality -= 4
    if quality != QUALITY:
        print(f"  {name}: saved at quality {quality} to stay under 200 KB", file=sys.stderr)
    path.write_bytes(buf.getvalue())
    return f"/og/{path.name}"


def product_image(p: dict) -> Image.Image:
    c = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(c)
    paste_fit(c, p["images"][0]["src"], (56, 56, 624, 574))
    d.line([(660, 56), (660, 574)], fill=LINE, width=1)

    x, right, top = 692, 1144, 72
    logo_w = 190
    logo_top = 574 - round(logo_w * 276 / 720)
    kind_font = font(TEXT, 32, TEXT_MEDIUM)
    label_font = font(TEXT, 26, TEXT_REGULAR)
    key = p.get("keyFigure")
    value_font = fit_heading(key["value"], right - x, range(80, 39, -4), 1)[0] if key else None

    # Largest name size at which the whole column clears the logo.
    for size in range(112, 51, -4):
        name_font = heavy(size)
        lines = wrap(p["name"], name_font, right - x)
        if len(lines) > 2 or any(name_font.getlength(l) > right - x for l in lines):
            continue
        name_base = top + cap(name_font) + (len(lines) - 1) * size
        kind_base = name_base + 56
        rule_y = kind_base + 34
        label_base = rule_y + 50
        value_base = label_base + 18 + cap(value_font) if value_font else rule_y
        if value_base <= logo_top - 32:
            break

    draw_lines(d, x, top, lines, name_font, INK, 1.0)
    d.text((x, kind_base), p["kind"], font=kind_font, fill=STEEL, anchor="ls")
    d.line([(x, rule_y), (right, rule_y)], fill=INK, width=3)
    if key and value_font:
        d.text((x, label_base), key["label"], font=label_font, fill=STEEL, anchor="ls")
        d.text((x, value_base), key["value"], font=value_font, fill=INK, anchor="ls")

    logo(c, logo_w, right, 574)
    return c


def category_image(cat: dict, items: list[dict]) -> Image.Image:
    c = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(c)
    shown = items[:4]
    left, right, top, bottom = 56, 1144, 48, 388
    gap = 24
    cell = (right - left - gap * (len(shown) - 1)) / max(1, len(shown))
    for i, p in enumerate(shown):
        x0 = round(left + i * (cell + gap))
        paste_fit(c, p["images"][0]["src"], (x0, top, round(x0 + cell), bottom))

    d.line([(left, 420), (right, 420)], fill=INK, width=3)
    name_font, lines = fit_heading(sentence_case(cat["name"]), 760, range(96, 55, -4), 1)
    name_base = draw_lines(d, left, 452, lines, name_font, INK, 1.0)
    d.text((left, name_base + 52), models(cat["count"]), font=font(TEXT, 30, TEXT_MEDIUM), fill=STEEL, anchor="ls")
    logo(c, 190, right, 582)
    return c


def page_image(title: str, sub: str | None, scene: dict) -> Image.Image:
    c = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(c)
    split = round(W * 0.6)
    paste_cover(c, scene["src"], (0, 0, split, H), scene.get("focus", "50% 50%"))

    x, right = split + 56, W - 56
    title_font, lines = fit_heading(title, right - x, range(72, 43, -4), 4)
    y = draw_lines(d, x, 72, lines, title_font, INK, 1.02)
    y += 36
    d.line([(x, y), (right, y)], fill=INK, width=3)
    if sub:
        sub_font = font(TEXT, 26, TEXT_MEDIUM)
        draw_lines(d, x, y + 28, wrap(sub, sub_font, right - x), sub_font, STEEL, 1.35)
    logo(c, 190, right, H - 56)
    return c


def pick_scenes(scenes: list[dict]) -> dict[str, dict]:
    """Spreads the scenes over the pages: fewest uses first, then the page's preference."""
    used = {s["key"]: 0 for s in scenes}
    picked: dict[str, dict] = {}
    for path, _, _, prefs in PAGES:
        def rank(item: tuple[int, dict]) -> tuple[int, int, int]:
            i, s = item
            pref = prefs.index(s["key"]) if s["key"] in prefs else len(prefs)
            return (used[s["key"]], pref, i)

        _, scene = min(enumerate(scenes), key=rank)
        used[scene["key"]] += 1
        picked[path] = scene
    return picked


def main() -> None:
    if not CATALOGUE.exists():
        sys.exit("Run `node scripts/export-catalogue.mjs` first.")
    data = json.loads(CATALOGUE.read_text())
    site, categories, products = data["site"], data["categories"], data["products"]
    scenes = [s for s in data["scenes"] if (PUBLIC / s["src"].lstrip("/")).exists()]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, dict] = {}

    def add(path: str, image: Image.Image, name: str, alt: str) -> None:
        manifest[path] = {"src": save(image, name), "width": W, "height": H, "alt": alt}

    for p in products:
        add(
            p["path"],
            product_image(p),
            f"product-{p['category']}-{p['slug']}",
            f"{site['brand']} {p['name']}, {p['kind'].lower()}",
        )

    for cat in categories:
        items = [p for p in products if p["category"] == cat["slug"]]
        add(
            cat["path"],
            category_image(cat, items),
            f"category-{cat['slug']}",
            f"{site['brand']} {sentence_case(cat['name']).lower()}: {models(cat['count'])}",
        )

    if scenes:
        subs = {
            "/": site["descriptor"],
            "/products": f"{models(len(products))} in {len(categories)} categories",
        }
        titles = {"/": site["name"]}
        for path, scene in pick_scenes(scenes).items():
            name, title = next((n, t) for pth, n, t, _ in PAGES if pth == path)
            title = titles.get(path, title)
            add(path, page_image(title, subs.get(path), scene), f"page-{name}", f"{title}. {scene['alt']}")
    else:
        print("No scene pictures found: static pages keep the default share image.", file=sys.stderr)

    keep = {Path(v["src"]).name for v in manifest.values()}
    for old in OUT_DIR.glob("*.jpg"):
        if old.name not in keep:
            old.unlink()

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    sizes = [(OUT_DIR / Path(v["src"]).name).stat().st_size for v in manifest.values()]
    print(f"Wrote {len(manifest)} share images to public/og (largest {max(sizes) // 1024} KB) and {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
