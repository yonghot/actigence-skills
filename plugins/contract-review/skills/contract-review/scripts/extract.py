# Requires: pymupdf (PDF input) and python-docx (DOCX input); the "brn" subcommand needs neither.
import re
import sys
from pathlib import Path

KDIGIT = {c: i for i, c in enumerate("영일이삼사오육칠팔구")}
KSMALL = {"십": 10, "백": 100, "천": 1000}
KBIG = {"만": 10**4, "억": 10**8, "조": 10**12}
BLANK = re.compile(r"○+|□+|△+|_{3,}|\bO{2,}\b|\bX{2,}\b|\(\s{2,}\)")
BRN = re.compile(r"\b\d{3}-\d{2}-\d{5}\b")
KAMT = re.compile(r"일금\s*([영일이삼사오육칠팔구십백천만억조]+)\s*원")
NAMT = re.compile(r"(?:₩|\\)\s*([\d,]+)|([\d,]{4,})\s*원")


def brn_ok(s):
    d = [int(c) for c in s if c.isdigit()]
    if len(d) != 10:
        return False
    w = [1, 3, 7, 1, 3, 7, 1, 3, 5]
    t = sum(a * b for a, b in zip(d, w)) + d[8] * 5 // 10
    return (10 - t % 10) % 10 == d[9]


def kor_to_int(s):
    total, chunk, num = 0, 0, 0
    for c in s:
        if c in KDIGIT:
            num = KDIGIT[c]
        elif c in KSMALL:
            chunk += (num or 1) * KSMALL[c]
            num = 0
        elif c in KBIG:
            total += (chunk + num or 1) * KBIG[c]
            chunk, num = 0, 0
    return total + chunk + num


def need(mod, pkg):
    try:
        return __import__(mod)
    except ImportError:
        sys.exit(f"missing Python package '{pkg}'. Install: python -m pip install {pkg} (use python3/py -3 if that is your interpreter). 'brn' needs no packages.")


def pdf(path, out):
    pymupdf = need("pymupdf", "pymupdf")
    doc = pymupdf.open(path)
    pages, marks = [], []
    for p in doc:
        n = p.number + 1
        pages.append(f"=== p.{n} ===\n{p.get_text()}")
        for b in p.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                hit = "".join(s["text"] for s in l["spans"] if s["color"] not in (0, 0x808080) and s["text"].strip())
                if hit.strip():
                    col = next(hex(s["color"]) for s in l["spans"] if s["color"] not in (0, 0x808080) and s["text"].strip())
                    marks.append(f"p.{n} color {col}: {hit.strip()}")
        for d in p.get_drawings():
            f = d.get("fill")
            if f and f not in ((1, 1, 1), (0, 0, 0)) and d["rect"].height < 20:
                t = p.get_textbox(d["rect"]).strip()
                if t:
                    marks.append(f"p.{n} fill {tuple(round(x, 2) for x in f)}: {t}")
        for a in p.annots() or []:
            t = p.get_textbox(a.rect).strip()
            marks.append(f"p.{n} annot {a.type[1]}: {t} {a.info.get('content', '')}".strip())
        p.get_pixmap(dpi=80).save(out / f"p-{n}.png")
    return "\n".join(pages), marks, len(doc)


def docx(path, out):
    d = need("docx", "python-docx")
    doc = d.Document(path)
    lines, marks = [], []

    def scan(par, where):
        lines.append(par.text)
        for r in par.runs:
            c = r.font.color.rgb if r.font.color and r.font.color.type else None
            if r.text.strip() and (r.font.highlight_color or (c and str(c) != "000000")):
                marks.append(f"{where} {'hl ' + str(r.font.highlight_color) if r.font.highlight_color else 'color ' + str(c)}: {r.text.strip()}")

    for i, par in enumerate(doc.paragraphs):
        scan(par, f"para {i}")
    for ti, t in enumerate(doc.tables):
        for row in t.rows:
            for cell in row.cells:
                for par in cell.paragraphs:
                    scan(par, f"table {ti}")
    return "\n".join(lines), marks, None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        print("usage: extract.py <file.pdf|file.docx> <out_dir> | extract.py brn <number> ...")
        sys.exit(2)
    if sys.argv[1] == "brn":
        for s in sys.argv[2:]:
            print(s, "OK" if brn_ok(s) else "CHECKSUM FAIL")
        return
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    text, marks, npages = (pdf if src.suffix.lower() == ".pdf" else docx)(src, out)
    (out / "text.txt").write_text(text, encoding="utf-8")
    (out / "marks.txt").write_text("\n".join(marks), encoding="utf-8")
    flat = re.sub(r"\s+", " ", text)
    rep = [f"pages: {npages}  chars: {len(text)}  -> {out / 'text.txt'}",
           f"marks (color/highlight/annot): {len(marks)}  -> {out / 'marks.txt'}"]
    rep += ["   " + m for m in marks]
    rep += [f"blank: {b}" for b in sorted(set(BLANK.findall(flat)))]
    rep += [f"brn: {b} {'OK' if brn_ok(b) else 'CHECKSUM FAIL'}" for b in sorted(set(BRN.findall(flat)))]
    for m in KAMT.finditer(flat):
        near = flat[max(0, m.start() - 80): m.end() + 80]
        nums = [int((a or b).replace(",", "")) for a, b in NAMT.findall(near) if (a or b).replace(",", "")]
        v = kor_to_int(m.group(1))
        rep.append(f"amount: 일금 {m.group(1)}원 = {v:,}  nearby digits {[f'{n:,}' for n in nums]}  {'MATCH' if v in nums else 'CHECK'}")
    rep += [f"attachment ref: {m.group(0).strip()}" for m in re.finditer(r"(별첨|첨부|붙임)\s*\d*\.?\s*[^\n]{0,30}", text)]
    (out / "summary.txt").write_text("\n".join(rep), encoding="utf-8")
    print("\n".join(rep))
    print(f"-> {out / 'summary.txt'}")


if __name__ == "__main__":
    main()
