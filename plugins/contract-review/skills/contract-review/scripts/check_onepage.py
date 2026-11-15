import sys

try:
    import pymupdf
except ImportError:
    sys.exit("missing Python package 'pymupdf'. Install: python -m pip install pymupdf (use python3/py -3 if that is your interpreter).")

sys.stdout.reconfigure(encoding="utf-8")
pdf, png = sys.argv[1], sys.argv[2]
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 1123 - 34
marker = sys.argv[4] if len(sys.argv) > 4 else "1 / 1"
d = pymupdf.open(pdf)
p = d[0]
p.get_pixmap(dpi=110).save(png)
hits = p.search_for(marker)
# Footer is the last flex child: if content overflows it is pushed past the page and clipped, so a missing marker means overflow.
foot = round(max(r.y1 for r in hits) * 96 / 72) if hits else None
ok = len(d) == 1 and foot is not None and foot <= limit + 1
print(f"pages {len(d)}  footer '{marker}' bottom {foot}px  limit {limit}px  {'OK' if ok else 'OVERFLOW'}")
