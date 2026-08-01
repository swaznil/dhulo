# Dhulo Play Store graphics

Upload-ready artwork is in `final/`.

## Portrait phone screenshots — 1080 × 1920 (9:16)

1. `01-quiet-place-9x16.png`
2. `02-write-and-release-9x16.png`
3. `03-watch-it-fade-9x16.png`
4. `04-make-space-9x16.png`
5. `05-release-for-good-9x16.png`
6. `06-your-space-9x16.png`
7. `07-choose-the-feeling-9x16.png`
8. `08-private-by-design-9x16.png`

## Landscape graphics — 1920 × 1080 (16:9)

1. `09-write-fade-release-16x9.png`
2. `10-softer-way-16x9.png`

The `raw/` folder contains the authentic app captures used in the artwork. Run
`python build_store_graphics.py` from any directory to rebuild the final set.

The 16:9 files are landscape promotional/tablet artwork. Google Play's separate
feature-graphic slot uses 1024 × 500, so these should not be substituted into
that slot without a dedicated crop.
