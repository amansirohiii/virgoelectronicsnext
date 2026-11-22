# Scripts

Three scripts that build files from the site's own product data. Re-run them whenever a product, a category, a scene or a photograph changes, and commit what they write.

| Script | What it does | Writes |
|---|---|---|
| `export-catalogue.mjs` | Reads `src/content/site.ts`, `scenes.ts` and the catalogue through `src/lib/catalogue.ts` (published products only) and saves them as JSON for the two Python scripts. Uses the `typescript` package already installed; no extra dependencies. | `scripts/.cache/catalogue.json` (not committed) |
| `build_share_images.py` | Makes a 1200 x 630 JPG share picture (WhatsApp, LinkedIn, Open Graph) for every product, every category and the main pages, and the list that `pageMeta()` in `src/lib/seo.ts` reads. Pictures for products that no longer exist are deleted. | `public/og/*.jpg`, `src/content/share-images.json` |
| `build_catalogue_pdf.py` | Lays out the A4 PDF catalogue: cover, contents, a section per category with every model's photograph and spec table, a page for dealers and distributors, and a back cover. It checks its own layout and stops with an error if text leaves the margins or overlaps a picture. | `public/downloads/virgo-catalogue.pdf` |

## Re-run everything

```sh
node scripts/export-catalogue.mjs && python3 scripts/build_share_images.py && python3 scripts/build_catalogue_pdf.py
```

Python needs Pillow (with WebP support, which the standard wheels have) and reportlab:

```sh
python3 -m pip install Pillow reportlab
```

The fonts are the ones that ship with macOS (Avenir Next and Avenir Next Condensed, with DIN Condensed as a fallback for the heavy face), so run the Python scripts on a Mac.

## Notes

- Nothing is typed into the scripts by hand except the titles on the share pictures of the fixed pages and the short fixed wording on the PDF cover and dealer page. Names, counts, figures and specs come from the data, and a value that is not in the data is not printed.
- Scenes are picked by key with a fallback to whatever scenes exist, so new scene pictures are used without changing the scripts.
- A page path with no entry in `share-images.json` falls back to `/opengraph-image`.
