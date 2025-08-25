import os
import sys
import json
import io
import re
from typing import Dict, Any, List, Optional, Tuple
from difflib import SequenceMatcher
import base64
# 'requests' is optional; if unavailable, external OCR fallbacks will be skipped gracefully
try:
    import requests  # type: ignore
except Exception:
    requests = None  # sentinel to detect unavailability

# Third-party imports
try:
    import pytesseract
    import pandas as pd
    import fitz  # PyMuPDF
    from pdf2image import convert_from_path
    from PIL import Image
    try:
        import pdfplumber  # optional: preferred for digital PDFs
    except Exception:
        pdfplumber = None
except Exception as e:
    # Fail fast with a clear message about missing dependencies
    print(json.dumps({
        "success": False,
        "error": f"Missing Python dependency: {e}",
        "text": ""
    }))
    sys.exit(1)


def _configure_binaries():
    """Configure platform-specific binary paths (Tesseract, Poppler)."""
    # Tesseract
    tess_path = os.environ.get(
        "TESSERACT_PATH",
        r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe" if os.name == "nt" else None,
    )
    if tess_path:
        pytesseract.pytesseract.tesseract_cmd = tess_path

    # Poppler (for pdf2image). Optional; if missing, we'll fall back to PyMuPDF rasterization.
    poppler_path = os.environ.get(
        "POPPLER_PATH",
        r"C:\\Program Files\\poppler-24.02.0\\Library\\bin" if os.name == "nt" else None,
    )
    return poppler_path


def _extract_items_from_pdf_layout(file_path: str) -> List[Dict[str, Any]]:
    """Extract item rows from a tabular 'Order Details' using PDF text positions (PyMuPDF words).
    Works when the PDF has embedded text (not just images). Returns a list of items with
    columns: no, product, variation, productPrice, qty, subtotal.
    """
    items: List[Dict[str, Any]] = []
    try:
        doc = fitz.open(file_path)
    except Exception:
        return items

    # Synonyms for header detection
    prod_syn = re.compile(r"product|item|description|details?", re.I)
    qty_syn = re.compile(r"qty|quantity", re.I)
    price_syn = re.compile(r"price|unit\s*price|unitprice", re.I)
    subtotal_syn = re.compile(r"subtotal|amount|total", re.I)
    no_syn = re.compile(r"^(no\.|no|#)$", re.I)

    def _to_float(s: str) -> Optional[float]:
        try:
            return float(s.replace(',', '').lstrip('₱$P'))
        except Exception:
            m = re.search(r"([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)", s)
            if m:
                try:
                    return float(m.group(1).replace(',', ''))
                except Exception:
                    return None
            return None

    for page in doc:
        words = page.get_text('words')  # list of (x0, y0, x1, y1, word, block_no, line_no, word_no)
        if not words:
            continue
        # Group by line_no
        lines_map: Dict[Tuple[int,int], List[Tuple[float,float,float,float,str]]] = {}
        for x0,y0,x1,y1,w,bno,lno,wn in words:
            key = (bno, lno)
            lines_map.setdefault(key, []).append((x0,y0,x1,y1,w))
        # Build sorted lines
        sorted_lines = []
        for key, lst in lines_map.items():
            lst.sort(key=lambda t: t[0])
            x0s = [t[0] for t in lst]
            y0s = [t[1] for t in lst]
            text = ' '.join([t[4] for t in lst])
            sorted_lines.append((min(x0s), min(y0s), text, lst))
        sorted_lines.sort(key=lambda t: (t[1], t[0]))

        # Find header line on this page
        header_idx = None
        header_cols = None
        for idx, (_x, _y, text, lst) in enumerate(sorted_lines):
            tnorm = text.lower()
            if prod_syn.search(tnorm) and qty_syn.search(tnorm) and price_syn.search(tnorm) and subtotal_syn.search(tnorm):
                # Build column map based on word positions
                col_markers: List[Tuple[float,str]] = []
                for x0,y0,x1,y1,w in lst:
                    wl = w.lower()
                    if no_syn.match(wl):
                        col_markers.append((x0, 'no'))
                    elif prod_syn.search(wl):
                        col_markers.append((x0, 'product'))
                    elif re.search(r"variation|variant|var", wl):
                        col_markers.append((x0, 'variation'))
                    elif price_syn.search(wl):
                        col_markers.append((x0, 'price'))
                    elif qty_syn.search(wl):
                        col_markers.append((x0, 'qty'))
                    elif subtotal_syn.search(wl):
                        col_markers.append((x0, 'subtotal'))
                # Deduplicate markers by nearest x and sort
                col_markers.sort(key=lambda z: z[0])
                dedup = []
                for x, name in col_markers:
                    if not dedup or abs(x - dedup[-1][0]) > 5:
                        dedup.append((x, name))
                if len(dedup) >= 3:
                    header_idx = idx
                    header_cols = dedup
                    break

        if header_idx is None or not header_cols:
            # Region-based fallback: find words between 'Order Details' and totals and parse rows heuristically
            # 1) Locate region bounds
            lines_rb = []
            # Rebuild lines for region finding
            lines_map2: Dict[int, List[Tuple[float,float,float,float,str,int]]] = {}
            for x0,y0,x1,y1,w,bno,lno,wn in words:
                key = int(y0)
                lines_map2.setdefault(key, []).append((x0,y0,x1,y1,w,bno))
            for key, lst in lines_map2.items():
                lst.sort(key=lambda t: t[0])
                text = ' '.join([t[4] for t in lst])
                y = min([t[1] for t in lst])
                lines_rb.append((y, text))
            lines_rb.sort(key=lambda t: t[0])
            y_start = None
            y_end = None
            for y, text in lines_rb:
                if re.search(r"^\s*Order\s+Details\b", text, re.I):
                    y_start = y + 3
                    break
            if y_start is None:
                continue
            for y, text in lines_rb:
                if y <= y_start:
                    continue
                if re.search(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", text, re.I):
                    y_end = y - 2
                    break
            if y_end is None:
                # take lower page bound
                y_end = max([t[1] for t in words]) + 5

            # 2) Collect words in region
            region_words = [ (x0,y0,x1,y1,w) for x0,y0,x1,y1,w,_,_,_ in words if y0 >= y_start and y0 <= y_end ]
            if not region_words:
                continue
            region_words.sort(key=lambda t: (t[1], t[0]))

            # 3) Group into rows by y proximity
            rows: List[List[Tuple[float,float,float,float,str]]] = []
            row = []
            prev_y = None
            for x0,y0,x1,y1,w in region_words:
                if prev_y is None or abs(y0 - prev_y) <= 5:
                    row.append((x0,y0,x1,y1,w))
                    prev_y = y0 if prev_y is None else (prev_y + y0) / 2.0
                else:
                    if row:
                        rows.append(sorted(row, key=lambda t: t[0]))
                    row = [(x0,y0,x1,y1,w)]
                    prev_y = y0
            if row:
                rows.append(sorted(row, key=lambda t: t[0]))

            # 4) Parse each row with numeric heuristics
            amt_re = re.compile(r"^[₱$P]?\d[\d,]*(?:\.\d{2})?$")
            int_re = re.compile(r"^\d{1,3}$")

            def _to_f(s: str) -> Optional[float]:
                try:
                    return float(s.replace(',', '').lstrip('₱$P'))
                except Exception:
                    m = re.search(r"\d[\d,]*(?:\.\d{2})?", s)
                    return float(m.group(0).replace(',', '')) if m else None

            for r in rows:
                texts = [t[4] for t in r]
                if not texts or any(re.search(r"No\b\s*\|\s*Product", ' '.join(texts), re.I)):
                    continue
                # Identify rightmost money as subtotal, the next money as price; an integer near left-middle as qty.
                money_tokens = [(((t[0]+t[2])/2.0), t[4]) for t in r if amt_re.match(t[4]) and re.search(r"\d", t[4])]
                money_tokens.sort(key=lambda z: z[0])
                price_val = None
                subtotal_val = None
                qty_val = None
                if money_tokens:
                    # choose rightmost as subtotal
                    subtotal_val = _to_f(money_tokens[-1][1])
                    if len(money_tokens) >= 2:
                        price_val = _to_f(money_tokens[-2][1])
                # qty: integer tokens that aren't part of money tokens
                qty_candidates = [(((t[0]+t[2])/2.0), t[4]) for t in r if int_re.match(t[4])]
                if qty_candidates:
                    try:
                        qty_val = int(qty_candidates[0][1])
                    except Exception:
                        qty_val = None
                # Product: all words excluding tokens used above and obvious labels
                used = set([tok for _, tok in money_tokens]) | set([q for _, q in qty_candidates])
                prod_parts = []
                for x0,y0,x1,y1,w in r:
                    if w in used:
                        continue
                    if re.search(r"^(qty|quantity|subtotal|amount|price)$", w, re.I):
                        continue
                    prod_parts.append(w)
                product = ' '.join(prod_parts).strip()
                if product and (qty_val is not None or price_val is not None or subtotal_val is not None):
                    items.append({
                        'no': (len(items) + 1),
                        'product': product[:200],
                        'variation': None,
                        'productPrice': price_val,
                        'qty': qty_val,
                        'subtotal': subtotal_val,
                    })
            # Move to next page after region parse
            continue

        # Header present: Build column x ranges and parse rows
        xs = [x for x,_ in header_cols]
        names = [n for _,n in header_cols]
        ranges = []
        for i, x in enumerate(xs):
            start = x - 2
            end = xs[i+1] - 2 if i+1 < len(xs) else float('inf')
            ranges.append((start, end, names[i]))

        current_row: Dict[str, Any] = {}

        def flush_row():
            nonlocal current_row
            if not current_row:
                return
            prod = (current_row.get('product') or '').strip()
            if not prod:
                current_row = {}
                return
            # Map to final schema
            item = {
                'no': current_row.get('no'),
                'product': prod[:200],
                'variation': (current_row.get('variation') or None),
                'productPrice': current_row.get('price'),
                'qty': current_row.get('qty'),
                'subtotal': current_row.get('subtotal'),
            }
            items.append(item)
            current_row = {}

        stop_pattern = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", re.I)
        for _x, _y, text, lst in sorted_lines[header_idx+1:]:
            if stop_pattern.search(text):
                flush_row()
                break
            # Assign each word to a column by x center
            col_text: Dict[str, List[str]] = {n: [] for n in ['no','product','variation','price','qty','subtotal']}
            for x0,y0,x1,y1,w in lst:
                xmid = (x0 + x1) / 2.0
                col_name = None
                for start,end,name in ranges:
                    if start <= xmid < end:
                        col_name = name
                        break
                if not col_name:
                    continue
                col_text.setdefault(col_name, []).append(w)
            # Build fields
            def join(n):
                return ' '.join(col_text.get(n, [])).strip()
            no_s = join('no')
            product_s = join('product')
            variation_s = join('variation')
            price_s = join('price')
            qty_s = join('qty')
            subtotal_s = join('subtotal')

            # New row heuristics: start if we have a numeric No., or if we see qty/price/subtotal alongside product text
            new_row = False
            no_val = None
            try:
                if no_s:
                    no_val = int(re.sub(r"[^0-9]", "", no_s))
                    new_row = True
            except Exception:
                no_val = None
            price_val = _to_float(price_s) if price_s else None
            qty_val = None
            try:
                if qty_s:
                    qtmp = int(re.sub(r"[^0-9]", "", qty_s))
                    qty_val = qtmp
            except Exception:
                pass
            subtotal_val = _to_float(subtotal_s) if subtotal_s else None

            if not new_row and product_s and (qty_val is not None or price_val is not None or subtotal_val is not None):
                new_row = True

            if new_row:
                if current_row:
                    flush_row()
                current_row = {'no': no_val}
            # Append/assign fields
            if product_s:
                if 'product' in current_row and current_row.get('product'):
                    current_row['product'] += ' ' + product_s
                else:
                    current_row['product'] = product_s
            if variation_s:
                if current_row.get('variation'):
                    current_row['variation'] += ' ' + variation_s
                else:
                    current_row['variation'] = variation_s
            if price_val is not None:
                current_row['price'] = price_val
            if qty_val is not None:
                current_row['qty'] = qty_val
            if subtotal_val is not None:
                current_row['subtotal'] = subtotal_val
        # Flush last row for this page
        flush_row()
    # If header-based parsing produced no items, try region-based fallback once more
    if not items:
        try:
            doc2 = fitz.open(file_path)
            for page in doc2:
                words = page.get_text('words')
                if not words:
                    continue
                lines_rb = []
                lines_map2: Dict[int, List[Tuple[float,float,float,float,str,int]]] = {}
                for x0,y0,x1,y1,w,bno,lno,wn in words:
                    key = int(y0)
                    lines_map2.setdefault(key, []).append((x0,y0,x1,y1,w,bno))
                for key, lst in lines_map2.items():
                    lst.sort(key=lambda t: t[0])
                    text = ' '.join([t[4] for t in lst])
                    y = min([t[1] for t in lst])
                    lines_rb.append((y, text))
                lines_rb.sort(key=lambda t: t[0])
                y_start = None
                y_end = None
                for y, text in lines_rb:
                    if re.search(r"^\s*Order\s+Details\b", text, re.I):
                        y_start = y + 3
                        break
                if y_start is None:
                    continue
                for y, text in lines_rb:
                    if y <= y_start:
                        continue
                    if re.search(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", text, re.I):
                        y_end = y - 2
                        break
                if y_end is None:
                    y_end = max([t[1] for t in words]) + 5
                region_words = [ (x0,y0,x1,y1,w) for x0,y0,x1,y1,w,_,_,_ in words if y0 >= y_start and y0 <= y_end ]
                if not region_words:
                    continue
                region_words.sort(key=lambda t: (t[1], t[0]))
                rows: List[List[Tuple[float,float,float,float,str]]] = []
                row = []
                prev_y = None
                for x0,y0,x1,y1,w in region_words:
                    if prev_y is None or abs(y0 - prev_y) <= 5:
                        row.append((x0,y0,x1,y1,w))
                        prev_y = y0 if prev_y is None else (prev_y + y0) / 2.0
                    else:
                        if row:
                            rows.append(sorted(row, key=lambda t: t[0]))
                        row = [(x0,y0,x1,y1,w)]
                        prev_y = y0
                if row:
                    rows.append(sorted(row, key=lambda t: t[0]))
                amt_re = re.compile(r"^[₱$P]?\d[\d,]*(?:\.\d{2})?$")
                int_re = re.compile(r"^\d{1,3}$")
                def _to_f(s: str) -> Optional[float]:
                    try:
                        return float(s.replace(',', '').lstrip('₱$P'))
                    except Exception:
                        m = re.search(r"\d[\d,]*(?:\.\d{2})?", s)
                        return float(m.group(0).replace(',', '')) if m else None
                for r in rows:
                    texts = [t[4] for t in r]
                    if not texts or any(re.search(r"No\b\s*\|\s*Product", ' '.join(texts), re.I)):
                        continue
                    money_tokens = [(((t[0]+t[2])/2.0), t[4]) for t in r if amt_re.match(t[4]) and re.search(r"\d", t[4])]
                    money_tokens.sort(key=lambda z: z[0])
                    price_val = None; subtotal_val = None
                    qty_val = None
                    if money_tokens:
                        subtotal_val = _to_f(money_tokens[-1][1])
                        if len(money_tokens) >= 2:
                            price_val = _to_f(money_tokens[-2][1])
                    qty_candidates = [(((t[0]+t[2])/2.0), t[4]) for t in r if int_re.match(t[4])]
                    if qty_candidates:
                        try:
                            qty_val = int(qty_candidates[0][1])
                        except Exception:
                            qty_val = None
                    used = set([tok for _, tok in money_tokens]) | set([q for _, q in qty_candidates])
                    prod_parts = []
                    for x0,y0,x1,y1,w in r:
                        if w in used:
                            continue
                        if re.search(r"^(qty|quantity|subtotal|amount|price)$", w, re.I):
                            continue
                        prod_parts.append(w)
                    product = ' '.join(prod_parts).strip()
                    if product and (qty_val is not None or price_val is not None or subtotal_val is not None):
                        items.append({
                            'no': (len(items) + 1),
                            'product': product[:200],
                            'variation': None,
                            'productPrice': price_val,
                            'qty': qty_val,
                            'subtotal': subtotal_val,
                        })
        except Exception:
            pass
    return items


def _extract_items_from_pdfplumber(file_path: str) -> List[Dict[str, Any]]:
    """Use pdfplumber's table extraction to parse 'Order Details' when available.
    Prefer column headers mapping: No | Product | Variation | Product Price | Qty | Subtotal.
    """
    items: List[Dict[str, Any]] = []
    if not pdfplumber:
        return items
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # Attempt to locate the 'Order Details' region to improve table detection
                y_top = None
                y_bottom = None
                try:
                    words = page.extract_words() or []
                except Exception:
                    words = []
                if words:
                    for w in words:
                        t = (w.get('text') or '').strip()
                        if re.search(r"^\s*Order\s+Details\b", t, re.I):
                            y_top = float(w.get('top', 0)) + 2
                            break
                    if y_top is not None:
                        for w in words:
                            if float(w.get('top', 0)) <= y_top:
                                continue
                            t = (w.get('text') or '').strip()
                            if re.search(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", t, re.I):
                                y_bottom = float(w.get('top', 0)) - 2
                                break
                page_to_parse = page
                if y_top is not None:
                    if y_bottom is None:
                        y_bottom = page.height - 2
                    try:
                        page_to_parse = page.crop((0, y_top, page.width, y_bottom))
                    except Exception:
                        page_to_parse = page

                def run_table_pass(p, strategy: str) -> List[List[str]]:
                    try:
                        if strategy == 'lines':
                            return p.extract_tables(table_settings={
                                "vertical_strategy": "lines",
                                "horizontal_strategy": "lines",
                                "snap_tolerance": 3,
                                "join_tolerance": 3,
                                "edge_min_length": 20,
                            }) or []
                        # text strategy
                        return p.extract_tables(table_settings={
                            "vertical_strategy": "text",
                            "horizontal_strategy": "text",
                            "text_x_tolerance": 2,
                            "text_y_tolerance": 2,
                            "intersection_tolerance": 2,
                        }) or []
                    except Exception:
                        try:
                            return p.extract_tables() or []
                        except Exception:
                            return []

                tables = run_table_pass(page_to_parse, 'lines')
                if not tables:
                    tables = run_table_pass(page_to_parse, 'text')

                for tbl in tables:
                    if not tbl or len(tbl) < 2:
                        continue
                    # Find a header-like row (contains Product and Qty, Price or Subtotal)
                    header_idx = None
                    for i, row in enumerate(tbl[:5]):  # search first few rows
                        joined = ' '.join([c or '' for c in row]).strip().lower()
                        if re.search(r"product|description|item", joined) and re.search(r"qty|quantity", joined) and (re.search(r"price|unit", joined) or re.search(r"subtotal|amount|total", joined)):
                            header_idx = i
                            break
                    if header_idx is None:
                        continue
                    header = [ (c or '').strip() for c in tbl[header_idx] ]
                    # Map columns to logical names by header tokens
                    def idx_of(pattern: str) -> Optional[int]:
                        for j, h in enumerate(header):
                            if re.search(pattern, h, re.I):
                                return j
                        return None
                    idx_no = idx_of(r"^no\.?|^#")
                    idx_prod = idx_of(r"product|item|description|details?")
                    idx_var = idx_of(r"variation|variant|var")
                    idx_price = idx_of(r"price|unit\s*price|unitprice")
                    idx_qty = idx_of(r"qty|quantity")
                    idx_sub = idx_of(r"subtotal|amount|total")
                    # Require minimal mapping
                    if idx_prod is None or (idx_qty is None and idx_sub is None and idx_price is None):
                        continue
                    # Parse subsequent rows until a blank-ish separator
                    last_item_ref: Optional[Dict[str, Any]] = None
                    for row in tbl[header_idx+1:]:
                        if not row or all((c or '').strip() == '' for c in row):
                            continue
                        def cell(i):
                            return (row[i] if i is not None and i < len(row) else '') or ''
                        no_s = cell(idx_no)
                        prod_s = cell(idx_prod)
                        var_s = cell(idx_var)
                        price_s = cell(idx_price)
                        qty_s = cell(idx_qty)
                        sub_s = cell(idx_sub)

                        # If product cell is empty but row has many columns, try to stitch across
                        if not prod_s:
                            prod_s = ' '.join([ (row[k] or '') for k in range(len(row)) if k not in [idx_no, idx_var, idx_price, idx_qty, idx_sub] ]).strip()
                        try:
                            no_v = int(re.sub(r"[^0-9]", "", no_s)) if no_s else None
                        except Exception:
                            no_v = None
                        def to_f(x: str) -> Optional[float]:
                            x = (x or '').strip()
                            try:
                                return float(x.replace(',', '').lstrip('₱$P')) if x else None
                            except Exception:
                                m = re.search(r"\d[\d,]*(?:\.\d{2})?", x)
                                return float(m.group(0).replace(',', '')) if m else None
                        price_v = to_f(price_s)
                        try:
                            qty_v = int(re.sub(r"[^0-9]", "", qty_s)) if qty_s else None
                        except Exception:
                            qty_v = None
                        sub_v = to_f(sub_s)

                        # Accept if we have product and at least one of qty/price/subtotal
                        if (prod_s and (qty_v is not None or price_v is not None or sub_v is not None)):
                            new_item = {
                                'no': no_v if no_v is not None else (len(items)+1),
                                'product': str(prod_s)[:200],
                                'variation': (str(var_s).strip() or None),
                                'productPrice': price_v,
                                'qty': qty_v,
                                'subtotal': sub_v,
                            }
                            items.append(new_item)
                            last_item_ref = new_item
                        else:
                            # Continuation row: append to last product if present
                            if prod_s and last_item_ref is not None:
                                combined = (last_item_ref.get('product') or '')
                                combined = (combined + ' ' + str(prod_s)).strip()
                                last_item_ref['product'] = combined[:200]
                # If items found on this page, proceed; else keep scanning next pages
    except Exception:
        return items
    return items


def _extract_items_from_tesseract_images(images: List[Image.Image]) -> List[Dict[str, Any]]:
    """Use Tesseract TSV output to detect a tabular items section on page images.
    Works for scanned PDFs or images by reconstructing lines and mapping to columns using header positions.
    """
    items: List[Dict[str, Any]] = []
    if not images:
        return items
    # Header synonym patterns
    prod_syn = re.compile(r"product|item|description|details?", re.I)
    qty_syn = re.compile(r"qty|quantity", re.I)
    price_syn = re.compile(r"price|unit\s*price|unitprice", re.I)
    subtotal_syn = re.compile(r"subtotal|amount|total", re.I)
    no_syn = re.compile(r"^(no\.|no|#)$", re.I)

    def _to_float(s: str) -> Optional[float]:
        try:
            return float(s.replace(',', '').lstrip('₱$P'))
        except Exception:
            m = re.search(r"([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)", s)
            if m:
                try:
                    return float(m.group(1).replace(',', ''))
                except Exception:
                    return None
            return None

    for img in images:
        try:
            # Prefer DataFrame for easier grouping if pandas is available
            df = pytesseract.image_to_data(img, output_type=pytesseract.Output.DATAFRAME, config='--psm 6')
        except Exception:
            try:
                tsv = pytesseract.image_to_data(img, config='--psm 6')
                # Fallback: rough parse of TSV
                lines = [l for l in tsv.splitlines()[1:] if l.strip()]
                parts = [ln.split('\t') for ln in lines if '\t' in ln]
                cols = ['level','page_num','block_num','par_num','line_num','word_num','left','top','width','height','conf','text']
                # crude DataFrame substitute
                df = pd.DataFrame(parts, columns=cols)
            except Exception:
                continue
        # Clean and types
        df = df[df['conf'].astype(str) != '-1']
        if 'text' not in df.columns or df.empty:
            continue
        # Build line-level aggregation
        df['text'] = df['text'].fillna('')
        df['left'] = pd.to_numeric(df['left'], errors='coerce')
        df['top'] = pd.to_numeric(df['top'], errors='coerce')
        df['width'] = pd.to_numeric(df['width'], errors='coerce')
        df = df.dropna(subset=['left','top','width'])
        if df.empty:
            continue
        grouped = df.groupby(['block_num','par_num','line_num'])
        lines_list = []
        for (b,p,l), g in grouped:
            g = g.sort_values('left')
            x0 = float(g['left'].min())
            y0 = float(g['top'].min())
            words = [(float(r['left']), float(r['top']), float(r['left'])+float(r['width']), float(r['top'])+float(r['height']) if 'height' in r else float(r['top'])+10.0, str(r['text'])) for _, r in g.iterrows()]
            text = ' '.join([w[-1] for w in words]).strip()
            lines_list.append((x0, y0, text, words))
        lines_list.sort(key=lambda t: (t[1], t[0]))

    # Find header
        header_idx = None
        header_cols = None
        for idx, (_x, _y, text, lst) in enumerate(lines_list):
            tnorm = text.lower()
            if prod_syn.search(tnorm) and qty_syn.search(tnorm) and price_syn.search(tnorm) and subtotal_syn.search(tnorm):
                # Collect column markers
                col_markers: List[Tuple[float,str]] = []
                for x0,y0,x1,y1,w in lst:
                    wl = w.lower()
                    if no_syn.match(wl):
                        col_markers.append((x0, 'no'))
                    elif prod_syn.search(wl):
                        col_markers.append((x0, 'product'))
                    elif re.search(r"variation|variant|var", wl):
                        col_markers.append((x0, 'variation'))
                    elif price_syn.search(wl):
                        col_markers.append((x0, 'price'))
                    elif qty_syn.search(wl):
                        col_markers.append((x0, 'qty'))
                    elif subtotal_syn.search(wl):
                        col_markers.append((x0, 'subtotal'))
                col_markers.sort(key=lambda z: z[0])
                dedup = []
                for x, name in col_markers:
                    if not dedup or abs(x - dedup[-1][0]) > 5:
                        dedup.append((x, name))
                if len(dedup) >= 3:
                    header_idx = idx
                    header_cols = dedup
                    break
        if header_idx is None or not header_cols:
            # Region-based fallback between 'Order Details' and totals, similar to PDF/Vision paths
            stop_pattern = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", re.I)
            y_start = None
            y_end = None
            for (_x, _y, text, _lst) in lines_list:
                if re.search(r"^\s*Order\s+Details\b", text, re.I):
                    y_start = _y + 3
                    break
            if y_start is None:
                continue
            for (_x, _y, text, _lst) in lines_list:
                if _y <= y_start:
                    continue
                if stop_pattern.search(text):
                    y_end = _y - 2
                    break
            if y_end is None:
                # fallback to lowest y
                ys = [y for (_, y, _t, _l) in lines_list]
                y_end = (max(ys) + 5) if ys else (y_start + 300)

            def _to_f(s: str) -> Optional[float]:
                try:
                    return float(s.replace(',', '').lstrip('₱$P'))
                except Exception:
                    m = re.search(r"\d[\d,]*(?:\.\d{2})?", s)
                    return float(m.group(0).replace(',', '')) if m else None

            for (_x, _y, text, lst) in lines_list:
                if _y < y_start or _y > y_end:
                    continue
                if stop_pattern.search(text) or re.search(r"No\b\s*\|\s*Product", text, re.I):
                    continue
                monies = [(((x0+x1)/2.0), w) for x0,y0,x1,y1,w in lst if re.match(r"^[₱$P]?\d[\d,]*(?:\.\d{2})?$", w)]
                monies.sort(key=lambda z: z[0])
                price_val = _to_f(monies[-2][1]) if len(monies) >= 2 else None
                subtotal_val = _to_f(monies[-1][1]) if len(monies) >= 1 else None
                qty_tokens = [w for x0,y0,x1,y1,w in lst if re.match(r"^\d{1,3}$", w)]
                qty_val = None
                if qty_tokens:
                    try:
                        qty_val = int(qty_tokens[0])
                    except Exception:
                        pass
                used = set([m for _, m in monies]) | set(qty_tokens)
                prod_parts = [w for x0,y0,x1,y1,w in lst if w not in used and not re.match(r"^(qty|quantity|subtotal|amount|price)$", w, re.I)]
                product = ' '.join(prod_parts).strip()
                if product and (qty_val is not None or price_val is not None or subtotal_val is not None):
                    items.append({
                        'no': (len(items) + 1),
                        'product': product[:200],
                        'variation': None,
                        'productPrice': price_val,
                        'qty': qty_val,
                        'subtotal': subtotal_val,
                    })
            # proceed to next image
            continue
        # Build column ranges
        xs = [x for x,_ in header_cols]
        names = [n for _,n in header_cols]
        ranges = []
        for i, x in enumerate(xs):
            start = x - 3
            end = xs[i+1] - 3 if i+1 < len(xs) else float('inf')
            ranges.append((start, end, names[i]))

        current_row: Dict[str, Any] = {}
        def flush_row():
            nonlocal current_row
            if not current_row:
                return
            prod = (current_row.get('product') or '').strip()
            if not prod:
                current_row = {}
                return
            items.append({
                'no': current_row.get('no'),
                'product': prod[:200],
                'variation': (current_row.get('variation') or None),
                'productPrice': current_row.get('price'),
                'qty': current_row.get('qty'),
                'subtotal': current_row.get('subtotal'),
            })
            current_row = {}

        stop_pattern = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", re.I)
        for _x, _y, text, lst in lines_list[header_idx+1:]:
            if stop_pattern.search(text):
                flush_row()
                break
            col_text: Dict[str, List[str]] = {n: [] for n in ['no','product','variation','price','qty','subtotal']}
            for x0,y0,x1,y1,w in lst:
                xmid = (x0 + x1) / 2.0
                name = None
                for start,end,col in ranges:
                    if start <= xmid < end:
                        name = col
                        break
                if name:
                    col_text.setdefault(name, []).append(w)
            def join(n):
                return ' '.join(col_text.get(n, [])).strip()
            no_s = join('no'); product_s = join('product'); variation_s = join('variation')
            price_s = join('price'); qty_s = join('qty'); subtotal_s = join('subtotal')
            new_row = False
            no_val = None
            try:
                if no_s:
                    no_val = int(re.sub(r"[^0-9]", "", no_s))
                    new_row = True
            except Exception:
                no_val = None
            price_val = _to_float(price_s) if price_s else None
            qty_val = None
            try:
                if qty_s:
                    qty_val = int(re.sub(r"[^0-9]", "", qty_s))
            except Exception:
                qty_val = None
            subtotal_val = _to_float(subtotal_s) if subtotal_s else None
            if not new_row and product_s and (qty_val is not None or price_val is not None or subtotal_val is not None):
                new_row = True
            if new_row:
                if current_row:
                    flush_row()
                current_row = {'no': no_val}
            if product_s:
                if current_row.get('product'):
                    current_row['product'] += ' ' + product_s
                else:
                    current_row['product'] = product_s
            if variation_s:
                current_row['variation'] = (current_row.get('variation') + ' ' + variation_s) if current_row.get('variation') else variation_s
            if price_val is not None:
                current_row['price'] = price_val
            if qty_val is not None:
                current_row['qty'] = qty_val
            if subtotal_val is not None:
                current_row['subtotal'] = subtotal_val
        flush_row()
    return items


def _extract_items_from_google_vision_images(images: List[Image.Image], api_key: str) -> List[Dict[str, Any]]:
    """Use Google Vision API (DOCUMENT_TEXT_DETECTION) to get word boxes and parse table rows.
    Requires GOOGLE_CLOUD_API_KEY; uses REST endpoint to avoid extra libs.
    """
    if not api_key or not images or requests is None:
        return []
    items: List[Dict[str, Any]] = []

    prod_syn = re.compile(r"product|item|description|details?", re.I)
    qty_syn = re.compile(r"qty|quantity", re.I)
    price_syn = re.compile(r"price|unit\s*price|unitprice", re.I)
    subtotal_syn = re.compile(r"subtotal|amount|total", re.I)
    no_syn = re.compile(r"^(no\.|no|#)$", re.I)

    def _to_float(s: str) -> Optional[float]:
        try:
            return float(s.replace(',', '').lstrip('₱$P'))
        except Exception:
            m = re.search(r"([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)", s)
            if m:
                try:
                    return float(m.group(1).replace(',', ''))
                except Exception:
                    return None
            return None

    url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"

    for img in images:
        try:
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            payload = {
                "requests": [
                    {
                        "image": {"content": b64},
                        "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
                    }
                ]
            }
            resp = requests.post(url, json=payload, timeout=30)
            data = resp.json()
        except Exception:
            continue
        try:
            pages = data['responses'][0]['fullTextAnnotation']['pages']
        except Exception:
            continue
        # Build words list similar to PyMuPDF output
        words_flat: List[Tuple[float,float,float,float,str]] = []
        for page in pages:
            for block in page.get('blocks', []):
                for para in block.get('paragraphs', []):
                    for word in para.get('words', []):
                        text = ''.join([s.get('text','') for s in word.get('symbols', [])]).strip()
                        if not text:
                            continue
                        bb = word.get('boundingBox', {}).get('vertices', [])
                        xs = [v.get('x', 0) for v in bb]
                        ys = [v.get('y', 0) for v in bb]
                        if not xs or not ys:
                            continue
                        x0, x1 = min(xs), max(xs)
                        y0, y1 = min(ys), max(ys)
                        words_flat.append((float(x0), float(y0), float(x1), float(y1), text))
        if not words_flat:
            continue
        # Group to line-like structures by y
        words_flat.sort(key=lambda t: (t[1], t[0]))
        lines_list: List[Tuple[float,float,str,List[Tuple[float,float,float,float,str]]]] = []
        row: List[Tuple[float,float,float,float,str]] = []
        prev_y = None
        for w in words_flat:
            if prev_y is None or abs(w[1] - prev_y) <= 6:
                row.append(w)
                prev_y = w[1] if prev_y is None else (prev_y + w[1]) / 2.0
            else:
                if row:
                    row.sort(key=lambda t: t[0])
                    text = ' '.join([t[4] for t in row])
                    lines_list.append((row[0][0], row[0][1], text, row.copy()))
                row = [w]
                prev_y = w[1]
        if row:
            row.sort(key=lambda t: t[0])
            text = ' '.join([t[4] for t in row])
            lines_list.append((row[0][0], row[0][1], text, row.copy()))

        # Find header or proceed to region parse if missing
        header_idx = None
        header_cols = None
        for idx, (_x, _y, text, lst) in enumerate(lines_list):
            tnorm = text.lower()
            if prod_syn.search(tnorm) and qty_syn.search(tnorm) and price_syn.search(tnorm) and subtotal_syn.search(tnorm):
                col_markers: List[Tuple[float,str]] = []
                for x0,y0,x1,y1,w in lst:
                    wl = w.lower()
                    if no_syn.match(wl):
                        col_markers.append((x0, 'no'))
                    elif prod_syn.search(wl):
                        col_markers.append((x0, 'product'))
                    elif re.search(r"variation|variant|var", wl):
                        col_markers.append((x0, 'variation'))
                    elif price_syn.search(wl):
                        col_markers.append((x0, 'price'))
                    elif qty_syn.search(wl):
                        col_markers.append((x0, 'qty'))
                    elif subtotal_syn.search(wl):
                        col_markers.append((x0, 'subtotal'))
                col_markers.sort(key=lambda z: z[0])
                dedup = []
                for x, name in col_markers:
                    if not dedup or abs(x - dedup[-1][0]) > 5:
                        dedup.append((x, name))
                if len(dedup) >= 3:
                    header_idx = idx
                    header_cols = dedup
                    break
        # Build ranges if header present
        ranges = []
        if header_cols is not None:
            xs = [x for x,_ in header_cols]
            names = [n for _,n in header_cols]
            for i, x in enumerate(xs):
                start = x - 3
                end = xs[i+1] - 3 if i+1 < len(xs) else float('inf')
                ranges.append((start, end, names[i]))

        stop_pattern = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", re.I)
        current_row: Dict[str, Any] = {}
        def flush_row():
            nonlocal current_row
            if not current_row:
                return
            prod = (current_row.get('product') or '').strip()
            if not prod:
                current_row = {}
                return
            items.append({
                'no': current_row.get('no'),
                'product': prod[:200],
                'variation': (current_row.get('variation') or None),
                'productPrice': current_row.get('price'),
                'qty': current_row.get('qty'),
                'subtotal': current_row.get('subtotal'),
            })
            current_row = {}

        # If header missing, fall back to region parse similar to the PDF path
        if header_idx is None:
            # Define region between 'Order Details' and totals
            y_start = None
            y_end = None
            for (_x,_y,text,_lst) in lines_list:
                if re.search(r"^\s*Order\s+Details\b", text, re.I):
                    y_start = _y + 3
                    break
            if y_start is None:
                continue
            for (_x,_y,text,_lst) in lines_list:
                if _y <= y_start:
                    continue
                if stop_pattern.search(text):
                    y_end = _y - 2
                    break
            if y_end is None:
                y_end = max([w[1] for w in words_flat]) + 5
            # Collect words in region and group by rows (already grouped)
            for (_x, _y, text, lst) in lines_list:
                if _y < y_start or _y > y_end:
                    continue
                if stop_pattern.search(text) or re.search(r"No\b\s*\|\s*Product", text, re.I):
                    continue
                # Heuristic extraction
                def join_by(filt):
                    return ' '.join([w for x0,y0,x1,y1,w in lst if filt(x0,y0,x1,y1,w)]).strip()
                # Money tokens in the row
                monies = [( (x0+x1)/2.0, w) for x0,y0,x1,y1,w in lst if re.match(r"^[₱$P]?\d[\d,]*(?:\.\d{2})?$", w)]
                monies.sort(key=lambda z: z[0])
                price_val = _to_float(monies[-2][1]) if len(monies) >= 2 else None
                subtotal_val = _to_float(monies[-1][1]) if len(monies) >= 1 else None
                qty_tokens = [w for x0,y0,x1,y1,w in lst if re.match(r"^\d{1,3}$", w)]
                qty_val = None
                if qty_tokens:
                    try:
                        qty_val = int(qty_tokens[0])
                    except Exception:
                        pass
                used = set([m for _,m in monies]) | set(qty_tokens)
                prod_parts = [w for x0,y0,x1,y1,w in lst if w not in used and not re.match(r"^(qty|quantity|subtotal|amount|price)$", w, re.I)]
                product = ' '.join(prod_parts).strip()
                if product and (qty_val is not None or price_val is not None or subtotal_val is not None):
                    items.append({
                        'no': (len(items)+1),
                        'product': product[:200],
                        'variation': None,
                        'productPrice': price_val,
                        'qty': qty_val,
                        'subtotal': subtotal_val,
                    })
            continue

        # Header present: column-based parsing
        for (_x,_y,text,lst) in lines_list[header_idx+1:]:
            if stop_pattern.search(text):
                flush_row()
                break
            col_text: Dict[str, List[str]] = {n: [] for n in ['no','product','variation','price','qty','subtotal']}
            for x0,y0,x1,y1,w in lst:
                xmid = (x0 + x1)/2.0
                name = None
                for start,end,col in ranges:
                    if start <= xmid < end:
                        name = col
                        break
                if name:
                    col_text.setdefault(name, []).append(w)
            def join(n):
                return ' '.join(col_text.get(n, [])).strip()
            no_s = join('no'); product_s = join('product'); variation_s = join('variation')
            price_s = join('price'); qty_s = join('qty'); subtotal_s = join('subtotal')
            new_row = False
            no_val = None
            try:
                if no_s:
                    no_val = int(re.sub(r"[^0-9]", "", no_s))
                    new_row = True
            except Exception:
                no_val = None
            price_val = _to_float(price_s) if price_s else None
            qty_val = None
            try:
                if qty_s:
                    qty_val = int(re.sub(r"[^0-9]", "", qty_s))
            except Exception:
                qty_val = None
            subtotal_val = _to_float(subtotal_s) if subtotal_s else None
            if not new_row and product_s and (qty_val is not None or price_val is not None or subtotal_val is not None):
                new_row = True
            if new_row:
                if current_row:
                    flush_row()
                current_row = {'no': no_val}
            if product_s:
                current_row['product'] = (current_row.get('product') + ' ' + product_s).strip() if current_row.get('product') else product_s
            if variation_s:
                current_row['variation'] = (current_row.get('variation') + ' ' + variation_s) if current_row.get('variation') else variation_s
            if price_val is not None:
                current_row['price'] = price_val
            if qty_val is not None:
                current_row['qty'] = qty_val
            if subtotal_val is not None:
                current_row['subtotal'] = subtotal_val
        flush_row()

    return items


def _extract_items_from_ocrspace(images: List[Image.Image], api_key: str) -> List[Dict[str, Any]]:
    """Use OCR.space API with isTable=true to get table-aware OCR and parse items.
    Docs: https://ocr.space/ocrapi
    """
    if not api_key or not images or requests is None:
        return []
    items: List[Dict[str, Any]] = []
    url = 'https://api.ocr.space/parse/image'
    headers = {'apikey': api_key}

    def _to_float(s: str) -> Optional[float]:
        try:
            return float(s.replace(',', '').lstrip('₱$P'))
        except Exception:
            m = re.search(r"\d[\d,]*(?:\.\d{2})?", s)
            return float(m.group(0).replace(',', '')) if m else None

    for img in images:
        try:
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            buf.seek(0)
            files = {'file': ('page.png', buf.getvalue(), 'image/png')}
            data = {
                'isOverlayRequired': True,
                'OCREngine': 2,
                'scale': True,
                'isTable': True,
                'detectOrientation': True,
                'language': 'eng'
            }
            resp = requests.post(url, headers=headers, files=files, data=data, timeout=60)
            j = resp.json()
        except Exception:
            continue
        try:
            parsed = j['ParsedResults'][0]
        except Exception:
            continue
        # First try text overlay lines by MinTop to reconstruct rows
        overlay = parsed.get('TextOverlay', {})
        lines = overlay.get('Lines', []) or []
        if lines:
            # Group words per line, then map to columns by x as before using header synonyms
            line_structs = []
            for ln in sorted(lines, key=lambda x: x.get('MinTop', 0)):
                words = ln.get('Words', []) or []
                lst = []
                for w in words:
                    left = float(w.get('Left', 0))
                    top = float(w.get('Top', 0))
                    width = float(w.get('Width', 0))
                    height = float(w.get('Height', 0))
                    text = w.get('WordText', '')
                    lst.append((left, top, left+width, top+height, text))
                if lst:
                    lst.sort(key=lambda t: t[0])
                    text = ' '.join([t[4] for t in lst])
                    line_structs.append((lst[0][0], lst[0][1], text, lst))

            # Header detection
            prod_syn = re.compile(r"product|item|description|details?", re.I)
            qty_syn = re.compile(r"qty|quantity", re.I)
            price_syn = re.compile(r"price|unit\s*price|unitprice", re.I)
            subtotal_syn = re.compile(r"subtotal|amount|total", re.I)
            no_syn = re.compile(r"^(no\.|no|#)$", re.I)
            header_idx = None
            header_cols = None
            for idx, (_x,_y,text,lst) in enumerate(line_structs):
                tnorm = text.lower()
                if prod_syn.search(tnorm) and qty_syn.search(tnorm) and price_syn.search(tnorm) and subtotal_syn.search(tnorm):
                    col_markers = []
                    for x0,y0,x1,y1,w in lst:
                        wl = w.lower()
                        if no_syn.match(wl): col_markers.append((x0,'no'))
                        elif prod_syn.search(wl): col_markers.append((x0,'product'))
                        elif re.search(r"variation|variant|var", wl): col_markers.append((x0,'variation'))
                        elif price_syn.search(wl): col_markers.append((x0,'price'))
                        elif qty_syn.search(wl): col_markers.append((x0,'qty'))
                        elif subtotal_syn.search(wl): col_markers.append((x0,'subtotal'))
                    col_markers.sort(key=lambda z: z[0])
                    dedup = []
                    for x,name in col_markers:
                        if not dedup or abs(x - dedup[-1][0]) > 5:
                            dedup.append((x,name))
                    if len(dedup) >= 3:
                        header_idx = idx
                        header_cols = dedup
                        break
            ranges = []
            if header_cols:
                xs = [x for x,_ in header_cols]
                names = [n for _,n in header_cols]
                for i, x in enumerate(xs):
                    start = x - 3
                    end = xs[i+1] - 3 if i+1 < len(xs) else float('inf')
                    ranges.append((start, end, names[i]))
            # Parse lines
            stop_pattern = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", re.I)
            current_row: Dict[str, Any] = {}
            def flush_row():
                nonlocal current_row
                if not current_row:
                    return
                prod = (current_row.get('product') or '').strip()
                if not prod:
                    current_row = {}
                    return
                items.append({
                    'no': current_row.get('no'),
                    'product': prod[:200],
                    'variation': (current_row.get('variation') or None),
                    'productPrice': current_row.get('price'),
                    'qty': current_row.get('qty'),
                    'subtotal': current_row.get('subtotal'),
                })
                current_row = {}
            for (_x,_y,text,lst) in (line_structs[header_idx+1:] if header_idx is not None else line_structs):
                if stop_pattern.search(text):
                    flush_row(); break
                col_text: Dict[str, List[str]] = {n: [] for n in ['no','product','variation','price','qty','subtotal']}
                if ranges:
                    for x0,y0,x1,y1,w in lst:
                        xmid = (x0 + x1)/2.0
                        name = None
                        for start,end,col in ranges:
                            if start <= xmid < end:
                                name = col; break
                        if name:
                            col_text.setdefault(name, []).append(w)
                else:
                    # No header: fallback heuristic per line
                    monies = [( (x0+x1)/2.0, w) for x0,y0,x1,y1,w in lst if re.match(r"^[₱$P]?\d[\d,]*(?:\.\d{2})?$", w)]
                    monies.sort(key=lambda z: z[0])
                    price_val = _to_float(monies[-2][1]) if len(monies) >= 2 else None
                    subtotal_val = _to_float(monies[-1][1]) if len(monies) >= 1 else None
                    qty_tokens = [w for x0,y0,x1,y1,w in lst if re.match(r"^\d{1,3}$", w)]
                    qty_val = int(qty_tokens[0]) if qty_tokens and qty_tokens[0].isdigit() else None
                    used = set([m for _,m in monies]) | set(qty_tokens)
                    prod_parts = [w for x0,y0,x1,y1,w in lst if w not in used and not re.match(r"^(qty|quantity|subtotal|amount|price)$", w, re.I)]
                    product = ' '.join(prod_parts).strip()
                    if product and (qty_val is not None or price_val is not None or subtotal_val is not None):
                        items.append({
                            'no': (len(items)+1),
                            'product': product[:200],
                            'variation': None,
                            'productPrice': price_val,
                            'qty': qty_val,
                            'subtotal': subtotal_val,
                        })
                    continue
                def join(n):
                    return ' '.join(col_text.get(n, [])).strip()
                no_s = join('no'); product_s = join('product'); variation_s = join('variation')
                price_s = join('price'); qty_s = join('qty'); subtotal_s = join('subtotal')
                new_row = False
                no_val = None
                try:
                    if no_s:
                        no_val = int(re.sub(r"[^0-9]", "", no_s))
                        new_row = True
                except Exception:
                    no_val = None
                price_val = _to_float(price_s) if price_s else None
                qty_val = None
                try:
                    if qty_s:
                        qty_val = int(re.sub(r"[^0-9]", "", qty_s))
                except Exception:
                    qty_val = None
                subtotal_val = _to_float(subtotal_s) if subtotal_s else None
                if not new_row and product_s and (qty_val is not None or price_val is not None or subtotal_val is not None):
                    new_row = True
                if new_row:
                    if current_row:
                        flush_row()
                    current_row = {'no': no_val}
                if product_s:
                    current_row['product'] = (current_row.get('product') + ' ' + product_s).strip() if current_row.get('product') else product_s
                if variation_s:
                    current_row['variation'] = (current_row.get('variation') + ' ' + variation_s) if current_row.get('variation') else variation_s
                if price_val is not None:
                    current_row['price'] = price_val
                if qty_val is not None:
                    current_row['qty'] = qty_val
                if subtotal_val is not None:
                    current_row['subtotal'] = subtotal_val
            flush_row()
    return items


def process_file(file_path: str, poppler_path: str | None = None) -> Dict[str, Any]:
    ext = os.path.splitext(file_path)[-1].lower()
    extracted_text = ""
    layout_items: List[Dict[str, Any]] = []
    plumber_items: List[Dict[str, Any]] = []
    tesseract_items: List[Dict[str, Any]] = []
    vision_items: List[Dict[str, Any]] = []
    ocrspace_items: List[Dict[str, Any]] = []
    page_images: List[Image.Image] = []

    if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
        img = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(img)
        page_images.append(img)

    elif ext == ".pdf":
        pdf_file = fitz.open(file_path)
        bold_total_lines: List[str] = []
        for page_num in range(len(pdf_file)):
            page = pdf_file[page_num]
            text = page.get_text()
            if text and text.strip():
                extracted_text += text + "\n"
            else:
                # If no embedded text, run OCR on the page image.
                try:
                    if poppler_path:
                        images = convert_from_path(file_path, first_page=page_num + 1, last_page=page_num + 1, poppler_path=poppler_path)
                        if images:
                            extracted_text += pytesseract.image_to_string(images[0]) + "\n"
                            page_images.append(images[0])
                    else:
                        # Fallback: render the page to a pixmap using PyMuPDF, then OCR
                        pix = page.get_pixmap()
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        extracted_text += pytesseract.image_to_string(img) + "\n"
                        page_images.append(img)
                except Exception:
                    # As a last resort, try PyMuPDF rasterization
                    try:
                        pix = page.get_pixmap()
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        extracted_text += pytesseract.image_to_string(img) + "\n"
                        page_images.append(img)
                    except Exception:
                        pass
            # Collect bold-ish lines that include totals / currency for better Grand Total detection
            try:
                tdict = page.get_text("dict")
                for b in tdict.get('blocks', []) or []:
                    for ln in b.get('lines', []) or []:
                        spans = ln.get('spans', []) or []
                        if not spans:
                            continue
                        line_text = ''.join([str(s.get('text') or '') for s in spans]).strip()
                        if not line_text:
                            continue
                        # Heuristic bold detection via font name
                        is_bold = any(re.search(r"bold|black|heavy|semibold|medium", str(s.get('font','')), re.I) for s in spans)
                        if is_bold and (re.search(r"[₱$€£]", line_text) or re.search(r"total", line_text, re.I)):
                            bold_total_lines.append(line_text)
            except Exception:
                pass

        # Try pdfplumber table extraction first (best for digital PDFs)
        try:
            plumber_items = _extract_items_from_pdfplumber(file_path)
        except Exception:
            plumber_items = []
        # Try layout-based table extraction for items
        try:
            layout_items = _extract_items_from_pdf_layout(file_path)
        except Exception:
            layout_items = []
        # Also run Tesseract TSV on rendered images (for scanned PDFs)
        try:
            if page_images:
                tesseract_items = _extract_items_from_tesseract_images(page_images)
        except Exception:
            tesseract_items = []
        # Google Vision OCR fallback if configured
        try:
            api_key = os.environ.get('GOOGLE_CLOUD_API_KEY') or os.environ.get('GOOGLE_API_KEY')
            if page_images and api_key:
                vision_items = _extract_items_from_google_vision_images(page_images, api_key)
        except Exception:
            vision_items = []
        # OCR.space fallback if configured
        try:
            ocrspace_key = os.environ.get('OCRSPACE_API_KEY')
            if page_images and ocrspace_key:
                ocrspace_items = _extract_items_from_ocrspace(page_images, ocrspace_key)
        except Exception:
            ocrspace_items = []

    elif ext == ".xlsx":
        df = pd.read_excel(file_path)
        extracted_text = df.to_string(index=False)

    elif ext == ".csv":
        df = pd.read_csv(file_path)
        extracted_text = df.to_string(index=False)

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # Prefer layout-based items; if empty, use tesseract-derived items
    if not tesseract_items and page_images:
        try:
            tesseract_items = _extract_items_from_tesseract_images(page_images)
        except Exception:
            tesseract_items = []
    # If still empty and Vision API key present, try Vision OCR
    if not (layout_items or tesseract_items) and page_images:
        try:
            api_key = os.environ.get('GOOGLE_CLOUD_API_KEY') or os.environ.get('GOOGLE_API_KEY')
            if api_key:
                vision_items = _extract_items_from_google_vision_images(page_images, api_key)
        except Exception:
            vision_items = []
    # If still empty and OCR.space configured, try it
    if not (layout_items or tesseract_items or vision_items) and page_images:
        try:
            ocrspace_key = os.environ.get('OCRSPACE_API_KEY')
            if ocrspace_key:
                ocrspace_items = _extract_items_from_ocrspace(page_images, ocrspace_key)
        except Exception:
            ocrspace_items = []
    items_hint = (plumber_items or []) or (layout_items or []) or (tesseract_items or []) or (vision_items or []) or (ocrspace_items or [])
    result: Dict[str, Any] = { 'text': extracted_text.strip(), 'layout_items': items_hint }
    try:
        if ext == ".pdf":
            # Attach font hints if available
            result['font_hints'] = { 'bold_total_lines': bold_total_lines }
    except Exception:
        pass
    return result


def _extract_structured(text: str, layout_items: Optional[List[Dict[str, Any]]] = None, font_hints: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Lightweight heuristic parsing of common invoice/receipt fields.

    This is intentionally simple (regex & line scanning) so it works without
    external ML dependencies. Improves over previous behavior where the UI
    only received one big text blob. Currency amounts are only taken when a
    currency symbol or code is present (₱, $, €, £, ¥, etc.).
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Patterns
    date_patterns = [
        re.compile(r"\b(\d{4}[\-/](?:0?[1-9]|1[0-2])[\-/](?:0?[1-9]|[12]\d|3[01]))\b"),  # YYYY-MM-DD
        re.compile(r"\b((?:0?[1-9]|[12]\d|3[01])[\-/](?:0?[1-9]|1[0-2])[\-/]\d{2,4})\b"),   # DD-MM-YYYY or DD/MM/YY
        re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b", re.I),
    ]

    # Include plain 'P' as fallback when the Peso sign '₱' is OCR'd as 'P'
    currency_symbols = ['₱', 'P', '$', '€', '£', '¥', '₹', '₽']
    currency_codes = ['USD','EUR','GBP','JPY','PHP','INR','CNY','RMB','CAD','AUD']
    currency_regex = re.compile(r"(" + '|'.join([re.escape(c) for c in currency_symbols + currency_codes]) + r")")
    amount_number = r"[0-9]{1,3}(?:[0-9,]*)(?:\.[0-9]{2})?"
    amount_regex = re.compile(rf"({amount_number})")

    invoice_regex = re.compile(r"\b(?:Invoice|Order|Order\s+Summary|Bill|Statement)\s*(?:ID|No\.?|Number|#)?[:\s-]*([A-Z0-9\-]{5,})", re.I)
    seller_prefix_regex = re.compile(r"^(?:Seller\s*Name|Seller|Merchant|Sold\s+By|Supplier|Vendor)[:\s-]+(.+)$", re.I)
    # Total related keywords (ordered by priority for scoring)
    total_keyword_regex = re.compile(r"(Grand\s+Total|Total\s+Amount|Amount\s+Due|Amount\s+Payable|Order\s+Total|Invoice\s+Total|TOTAL)", re.I)
    # Words that usually indicate a line is NOT the grand total
    negative_total_context = re.compile(r"(shipping|fee|discount|quantity|subtotal|tax|vat|handling|service|delivery)", re.I)

    found = {
        'date': None,               # generic first detected date
        'invoiceNumber': None,      # invoice / order summary number
        'supplier': None,           # seller / supplier name
    'sellerAddress': None,
    'buyerName': None,
    'buyerAddress': None,
        'total': None,              # numeric total (grand total)
        'currency': None,
        # Extended fields
        'orderSummaryNo': None,
        'orderId': None,
        'dateIssued': None,
        'orderPaidDate': None,
        'paymentMethod': None,
        'merchandiseSubtotal': None,
        'shippingFee': None,
        'shippingDiscount': None,
        'platformVoucher': None,
        'amountInWords': None,
        'items': [],                # parsed line items
    }

    # Extract date (first match wins)
    for line in lines:
        for pat in date_patterns:
            m = pat.search(line)
            if m:
                found['date'] = m.group(0)
                break
        if found['date']:
            break

    # Extract invoice / order numbers and related metadata
    for line in lines:
        if found['invoiceNumber'] is None:
            m = invoice_regex.search(line)
            if m:
                found['invoiceNumber'] = m.group(1).rstrip('.,:')
        if found['orderSummaryNo'] is None:
            m = re.search(r"Order\s+Summary\s+No\.?[:\s]+([A-Z0-9\-]+)", line, re.I)
            if m:
                found['orderSummaryNo'] = m.group(1)
        if found['orderId'] is None:
            m = re.search(r"Order\s+ID[:\s]+([A-Z0-9\-]+)", line, re.I)
            if m:
                found['orderId'] = m.group(1)
        if found['dateIssued'] is None:
            m = re.search(r"Date\s+Issued[:\s]+(.+)$", line, re.I)
            if m:
                found['dateIssued'] = m.group(1).strip()
        if found['orderPaidDate'] is None:
            m = re.search(r"Order\s+Paid\s+Date[:\s]+(.+)$", line, re.I)
            if m:
                found['orderPaidDate'] = m.group(1).strip()
        if found['paymentMethod'] is None:
            m = re.search(r"Payment\s+Method[:\s]+(.+)$", line, re.I)
            if m:
                found['paymentMethod'] = m.group(1).strip()
        # Stop early if most captured
        if all(found.get(k) for k in ['invoiceNumber','orderSummaryNo','orderId','dateIssued','orderPaidDate','paymentMethod']):
            break

    # Extract supplier (explicit prefix preferred)
    for line in lines:
        m = seller_prefix_regex.match(line)
        if m:
            cand = m.group(1).strip()
            # Remove any trailing parenthetical file note e.g. (Order summary (17).pdf)
            cand = re.sub(r"\([^)]*\)$", "", cand).strip()
            found['supplier'] = cand
            break

    # Extract seller address (may span multiple lines after label)
    for i, line in enumerate(lines):
        m = re.match(r"^(Seller\s*Address)[:\s-]+(.*)$", line, re.I)
        if m:
            first = m.group(2).strip()
            addr_parts = [first] if first else []
            # Accumulate following lines until blank or next labeled section
            for j in range(i+1, min(i+6, len(lines))):
                nxt = lines[j]
                if not nxt.strip():
                    break
                if re.match(r"^(Buyer\s*Name|Buyer\s*Address|Order\s+Summary|Order\s+Details)\b", nxt, re.I):
                    break
                addr_parts.append(nxt.strip())
            addr = ' '.join(addr_parts).strip()
            if addr:
                found['sellerAddress'] = addr
            break

    # Extract buyer fields
    for line in lines:
        m = re.match(r"^Buyer\s*Name[:\s-]+(.+)$", line, re.I)
        if m:
            found['buyerName'] = m.group(1).strip()
            break
    for i, line in enumerate(lines):
        m = re.match(r"^Buyer\s*Address[:\s-]+(.+)$", line, re.I)
        if m:
            first = m.group(1).strip()
            parts = [first] if first else []
            for j in range(i+1, min(i+4, len(lines))):
                nxt = lines[j]
                if not nxt.strip():
                    break
                if re.match(r"^(Order\s+Summary|Order\s+Details|Seller\s*Name|Seller\s*Address|Buyer\s*Name)\b", nxt, re.I):
                    break
                parts.append(nxt.strip())
            addr = ' '.join(parts).strip()
            if addr:
                found['buyerAddress'] = addr
            break

    # TikTok-specific block parsing: Delivery Details / Sold By / Order Details
    # Detect presence of TikTok style to trigger additional parsing
    has_tiktok_markers = any(re.search(r"TikTok\s*Shop|Grand\s*total\s*\(includes\s*VAT\)", ln, re.I) for ln in lines)
    if has_tiktok_markers:
        # Delivery Details block: first line is buyer name, following lines until empty/next section are address
        for i, ln in enumerate(lines):
            if re.match(r"^\s*Delivery\s+Details\s*$", ln, re.I):
                # collect next lines until a blank or a known header
                addr_parts = []
                buyer_nm = None
                for j in range(i+1, min(i+8, len(lines))):
                    t = lines[j].strip()
                    if not t:
                        break
                    if re.match(r"^(Sold\s*By|Order\s+Details|Item\s+Description|Order\s+Summary)\b", t, re.I):
                        break
                    if buyer_nm is None:
                        buyer_nm = t
                    else:
                        addr_parts.append(t)
                if buyer_nm and not found.get('buyerName'):
                    found['buyerName'] = buyer_nm
                if addr_parts and not found.get('buyerAddress'):
                    found['buyerAddress'] = ' '.join(addr_parts)
                break
        # Sold By: name can be on same or next line
        for i, ln in enumerate(lines):
            m = re.match(r"^\s*Sold\s*By\s*:?[\s-]*([^].]*)$", ln, re.I)
            if m:
                val = m.group(1).strip()
                if val:
                    found['supplier'] = val
                    break
                # else take next non-empty line
                for j in range(i+1, min(i+4, len(lines))):
                    t = lines[j].strip()
                    if t and not re.match(r"^(Delivery\s+Details|Order\s+Details|Item\s+Description)\b", t, re.I):
                        found['supplier'] = t
                        break
                break
        # Order Details: Order Number and Order Date
        for ln in lines:
            m = re.search(r"Order\s*Number\s*[:\-]\s*([A-Za-z0-9\-]+)", ln, re.I)
            if m and not found.get('orderId'):
                found['orderId'] = m.group(1).strip()
            m2 = re.search(r"Order\s*Date\s*[:\-]\s*(.+)$", ln, re.I)
            if m2 and not found.get('dateIssued'):
                found['dateIssued'] = m2.group(1).strip()
        # Receipt Number / Receipt Date -> summary no / date issued if still missing
        for ln in lines:
            if not found.get('orderSummaryNo'):
                m = re.search(r"Receipt\s*Number\s*[:\-]\s*([A-Za-z0-9\-]+)", ln, re.I)
                if m:
                    found['orderSummaryNo'] = m.group(1).strip()
            if not found.get('dateIssued'):
                m = re.search(r"Receipt\s*Date\s*[:\-]\s*(.+)$", ln, re.I)
                if m:
                    found['dateIssued'] = m.group(1).strip()
        # Monetary lines: Subtotal / Shipping / Coupons / TikTok shipping coupons / Grand total (includes VAT)
        for ln in lines:
            # Subtotal
            m = re.search(r"^\s*Subtotal\s*[:\-]?\s*([₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\b", ln, re.I)
            if m and found.get('merchandiseSubtotal') is None:
                try:
                    found['merchandiseSubtotal'] = float(m.group(1).replace(',', '').lstrip('₱$P').strip())
                except Exception:
                    pass
            # Shipping Fee (often 'Shipping')
            m = re.search(r"^\s*Shipping\b[^\d]*([₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\b", ln, re.I)
            if m and found.get('shippingFee') is None:
                try:
                    found['shippingFee'] = float(m.group(1).replace(',', '').lstrip('₱$P').strip())
                except Exception:
                    pass
            # Coupons (platform voucher)
            m = re.search(r"^\s*Coupons\b[^\d-]*(-?\s*[₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\b", ln, re.I)
            if m and found.get('platformVoucher') is None:
                try:
                    val = float(m.group(1).replace(',', '').replace(' ', '').lstrip('₱$P'))
                    found['platformVoucher'] = val if val <= 0 else -abs(val)
                except Exception:
                    pass
            # TikTok shipping coupons -> shippingDiscount
            m = re.search(r"TikTok\s*shipping\s*coupons\b[^\d-]*(-?\s*[₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\b", ln, re.I)
            if m and found.get('shippingDiscount') is None:
                try:
                    val = float(m.group(1).replace(',', '').replace(' ', '').lstrip('₱$P'))
                    found['shippingDiscount'] = val if val <= 0 else -abs(val)
                except Exception:
                    pass
            # Grand total (includes VAT)
            m = re.search(r"Grand\s*total\s*\(includes\s*VAT\)\s*[:\-]?\s*([₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\b", ln, re.I)
            if m:
                try:
                    found['total'] = float(m.group(1).replace(',', '').lstrip('₱$P').strip())
                    found['grandTotal'] = found['total']
                except Exception:
                    pass

    # Fallback supplier: first line that is not date/invoice/total line and not all numbers
    if not found['supplier'] and lines:
        for line in lines:
            if found['invoiceNumber'] and found['invoiceNumber'] in line:
                continue
            if found['date'] and found['date'] in line:
                continue
            if total_keyword_regex.search(line):
                continue
            if amount_regex.fullmatch(line.replace(',', '')):  # purely a number
                continue
            # Skip lines that look like column headers
            if re.match(r"(?i)qty|description|price|amount", line):
                continue
            found['supplier'] = line
            break

    # Extract total: prefer bold font lines when available (from PDF hints)
    if font_hints and isinstance(font_hints.get('bold_total_lines'), list):
        bold_lines = [str(x) for x in font_hints.get('bold_total_lines')]
        for bl in bold_lines:
            # Require a currency symbol on bold line for high confidence
            if not re.search(r"[₱$€£]", bl):
                continue
            m = re.search(r"\bgrand\s*total\b(?:[^0-9₱$P]{0,30}|\s*\(includes\s*vat\)\s*[:\-]?)\s*([₱$P]?\s*\d[\d,]*(?:\.\d{2})?)", bl, re.I)
            if m:
                try:
                    found['total'] = float(m.group(1).replace(',', '').lstrip('₱$P').strip())
                    found['grandTotal'] = found['total']
                    # try currency
                    if not found.get('currency'):
                        if '₱' in bl or re.search(r"\bPHP\b|Peso", bl, re.I):
                            found['currency'] = 'PHP'
                        elif '$' in bl or re.search(r"\bUSD\b", bl):
                            found['currency'] = 'USD'
                    # If bold gave us total, we can skip further total detection
                    grand_total_direct = found['total']
                except Exception:
                    pass

    # Extract total: prefer explicit 'Grand Total' lines first (in plain text, allow next-line amount)
    if found.get('total') is None:
        gt_candidates: list[tuple[float,int,int,bool]] = []  # (value, score, idx, has_currency)
        for idx, line in enumerate(lines):
            if not re.search(r"\bGrand\s*Total\b", line, re.I):
                continue
            # same line amount
            m = re.search(r"([₱$P]?\s*\d[\d,]*(?:\.\d{2})?)\s*$", line)
            amt = None
            has_cur = False
            if m and re.search(r"[₱$]", m.group(1)):
                try:
                    amt = float(m.group(1).replace(',', '').lstrip('₱$P').strip())
                    has_cur = True
                except Exception:
                    amt = None
            if amt is None:
                # search next 1-2 lines for currency amount
                for k in range(1,3):
                    if idx + k >= len(lines):
                        break
                    m2 = re.search(r"([₱$] ?\d[\d,]*(?:\.\d{2})?)", lines[idx+k])
                    if m2:
                        try:
                            amt = float(m2.group(1).replace(',', '').lstrip('₱$').strip())
                            has_cur = True
                            break
                        except Exception:
                            pass
                # as a fallback, accept number without currency on same line if unambiguous
                if amt is None:
                    m3 = re.findall(r"\d[\d,]*(?:\.\d{2})?", line)
                    if m3:
                        try:
                            amt = float(m3[-1].replace(',', ''))
                        except Exception:
                            amt = None
            if amt is not None:
                score = 0
                if re.search(r"includes\s*vat", line, re.I):
                    score += 1
                if has_cur:
                    score += 3
                # prefer later lines (near bottom)
                score += int((idx / max(1, len(lines))) * 3)
                gt_candidates.append((amt, score, idx, has_cur))
        if gt_candidates:
            gt_candidates.sort(key=lambda x: (x[1], x[3], x[0]))
            found['total'] = gt_candidates[-1][0]

    # Extract total with prioritization & scoring (fallback)
    candidate_totals: list[tuple[float, str, int]] = []  # (value, currency, score)
    for idx, line in enumerate(lines):
        if not total_keyword_regex.search(line):
            continue
        # Skip lines that clearly reference components (shipping fee, discount, etc.) unless they also contain 'Grand'
        if negative_total_context.search(line) and not re.search(r"grand", line, re.I):
            continue
        # Accept numbers even if currency symbol was OCR-missed
        nums = re.findall(amount_number, line)
        if not nums:
            continue
        # Choose last number as probable total
        try:
            val = float(nums[-1].replace(',', ''))
        except ValueError:
            continue
        cur_match = currency_regex.search(line)
        cur_val = cur_match.group(1) if cur_match else None
        # Score: +5 if contains Grand, +3 if Amount Due, +2 if Total Amount, +1 generic TOTAL, -2 if no currency symbol
        score = 0
        if re.search(r"grand", line, re.I):
            score += 5
        if re.search(r"amount\s+due|amount\s+payable", line, re.I):
            score += 3
        if re.search(r"total\s+amount", line, re.I):
            score += 2
        if re.search(r"invoice\s+total|order\s+total", line, re.I):
            score += 2
        if re.search(r"TOTAL", line):
            score += 1
        if not cur_val:
            score -= 2
        # Slight preference for later lines (often near bottom): add small increment based on position
        score += int((idx / max(1, len(lines))) * 3)
        candidate_totals.append((val, cur_val, score))

    if found['total'] is None and candidate_totals:
        # Pick by highest score; tie-breaker by largest value
        candidate_totals.sort(key=lambda x: (x[2], x[0]))
        chosen_val, chosen_cur, _ = candidate_totals[-1]
        found['total'] = chosen_val
        found['currency'] = chosen_cur

    # Fallback: amount-in-words parsing if still no total
    if found['total'] is None:
        words_total = _parse_amount_in_words(lines)
        if words_total is not None:
            found['total'] = words_total
            found['amountInWords'] = words_total
            # Attempt to guess currency from text (default to PHP if 'peso' present)
            for line in lines:
                if re.search(r"peso", line, re.I):
                    found['currency'] = 'PHP'
                    break
            if not found['currency'] and words_total is not None:
                found['currency'] = None
        else:
            found['amountInWords'] = None

    # Final fallback: largest currency amount excluding obvious non-grand lines
    if found['total'] is None:
        best_val = None
        best_cur = None
        for line in lines:
            if negative_total_context.search(line):
                continue
            if currency_regex.search(line):
                nums = re.findall(amount_number, line)
                for n in nums:
                    try:
                        val = float(n.replace(',', ''))
                    except ValueError:
                        continue
                    if best_val is None or val > best_val:
                        best_val = val
                        cur_match = currency_regex.search(line)
                        if cur_match:
                            best_cur = cur_match.group(1)
        if best_val is not None:
            found['total'] = best_val
            found['currency'] = best_cur

    # Monetary breakdown lines with fuzzy label matching
    canonical_money_labels: Dict[str, List[str]] = {
        'merchandiseSubtotal': [
            'merchandise subtotal','subtotal','item subtotal','items subtotal','product subtotal','merch subtotal'
        ],
        'shippingFee': [
            'shipping fee','delivery fee','ship fee','shipping cost','delivery charge','delivery charges','shipping'
        ],
        'shippingDiscount': [
            'shipping discount','delivery discount','ship discount','shipping disc','shipping voucher','tiktok shipping coupons','shipping coupons'
        ],
        'platformVoucher': [
            'platform voucher','voucher applied','platform voucher applied','voucher discount','total platform voucher applied','voucher','coupon','coupons','coupons applied'
        ],
    }

    def _normalize_label(txt: str) -> str:
        # Remove amounts & currency, punctuation, collapse spaces
        txt = currency_regex.sub(' ', txt)
        txt = re.sub(amount_number, ' ', txt)
        txt = re.sub(r"[^a-zA-Z ]+", ' ', txt)
        txt = re.sub(r"\s+", ' ', txt).strip().lower()
        return txt

    def _fuzzy_match_label(line_norm: str) -> Optional[Tuple[str,float]]:
        best_key = None
        best_score = 0.0
        for key, variants in canonical_money_labels.items():
            for v in variants:
                score = SequenceMatcher(None, line_norm, v).ratio()
                if score > best_score:
                    best_score = score
                    best_key = key
        if best_key and best_score >= 0.78:  # threshold tuned heuristically
            return best_key, best_score
        return None

    exclusion_noise = re.compile(r"receipt\s*number|tracking|awb|waybill|barcode|order\s*id|reference|ref\.?\s*no|date\b|time\b", re.I)
    for raw_line in lines:
        line_norm = _normalize_label(raw_line)
        if not line_norm:
            continue
        # Skip if clearly a grand total line to avoid overwriting
        if re.search(r"grand\s+total", raw_line, re.I):
            continue
        # Skip obvious metadata/receipt lines to avoid picking huge IDs as amounts
        if exclusion_noise.search(raw_line):
            continue
        match_res = _fuzzy_match_label(line_norm)
        if not match_res:
            continue
        key, _score = match_res
        if found.get(key) is not None:
            continue
        nums = re.findall(amount_number, raw_line)
        if not nums:
            continue
        # Require currency for very large numbers to avoid capturing order/receipt IDs
        has_currency = bool(currency_regex.search(raw_line))
        try:
            candidate_val = float(nums[-1].replace(',', ''))
        except ValueError:
            continue
        if not has_currency and candidate_val > 10000000:  # >10M without currency is suspicious
            continue
        sign = -1 if (re.search(r"[-(]", raw_line) or 'discount' in key or 'voucher' in key) else 1
        val = candidate_val * sign
        found[key] = val
        if not found['currency']:
            cm = currency_regex.search(raw_line)
            if cm:
                found['currency'] = cm.group(1)

    # Existing exact pattern fallback (only fill still-missing fields)
    if any(found[k] is None for k in ['merchandiseSubtotal','shippingFee','shippingDiscount','platformVoucher']):
        money_patterns = [
            ('merchandiseSubtotal', r"(Merchandise\s+Subtotal|Subtotal)"),
            ('shippingFee', r"Shipping\s+Fee"),
            ('shippingDiscount', r"Shipping\s+Discount"),
            ('platformVoucher', r"Total\s+Platform\s+Voucher\s+Applied"),
        ]
        for key, label_pat in money_patterns:
            if found[key] is not None:
                continue
            label_re = re.compile(label_pat, re.I)
            for line in lines:
                if label_re.search(line):
                    if exclusion_noise.search(line):
                        continue
                    sign = -1 if re.search(r"[-(]", line) or 'discount' in key or 'voucher' in key else 1
                    nums = re.findall(amount_number, line)
                    if nums:
                        try:
                            val = float(nums[-1].replace(',', '')) * sign
                            if not currency_regex.search(line) and abs(val) > 10000000:
                                # Skip absurdly large values without currency
                                continue
                            found[key] = val
                            if not found['currency']:
                                cm = currency_regex.search(line)
                                if cm:
                                    found['currency'] = cm.group(1)
                        except ValueError:
                            pass
                    break

    # Parse items (enhanced heuristic with multi-line support & alternative formats)
    header_idx = None
    # Accept headers that contain at least Product and Qty columns, even without explicit No/Subtotal
    header_regex = re.compile(r"^(?=.*\bProduct\b)(?=.*\bQty\b).*", re.I)
    for i, line in enumerate(lines):
        if header_regex.search(line):
            header_idx = i
            break

    def _parse_price(val: str) -> Optional[float]:
        try:
            return float(val.replace('₱','').replace('$','').replace(',',''))
        except Exception:
            return None

    if header_idx is not None:
        items: List[Dict[str, Any]] = []
        current_item: Optional[Dict[str, Any]] = None
        item_no = 0
        for j in range(header_idx + 1, len(lines)):
            line = lines[j].strip()
            if not line:
                # blank line ends items section
                break
            if re.search(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", line, re.I):
                break
            # Full pattern original
            m_full = re.match(r"^(\d+)\s+(.+?)\s+([₱$]?\d[\d,]*(?:\.\d{2})?)\s+(\d+)\s+([₱$]?\d[\d,]*(?:\.\d{2})?)$", line)
            # Alternative pattern: No Product ... Qty x UnitPrice = Subtotal
            m_alt = re.match(r"^(\d+)\s+(.+?)\s+(\d+)\s*[xX]\s*([₱$]?\d[\d,]*(?:\.\d{2})?)\s*=\s*([₱$]?\d[\d,]*(?:\.\d{2})?)$", line)
            if m_full or m_alt:
                g = m_full.groups() if m_full else m_alt.groups()
                no = int(g[0])
                desc = g[1].strip()
                if m_full:
                    price_val = _parse_price(g[2])
                    qty_val = int(g[3])
                    subtotal_val = _parse_price(g[4])
                else:
                    qty_val = int(g[2])
                    price_val = _parse_price(g[3])
                    subtotal_val = _parse_price(g[4])
                variation = None
                if ' - ' in desc:
                    parts = desc.split(' - ',1)
                    product = parts[0].strip()
                    variation = parts[1].strip()
                else:
                    product = desc
                current_item = {
                    'no': no,
                    'product': product,
                    'variation': variation,
                    'productPrice': price_val,
                    'qty': qty_val,
                    'subtotal': subtotal_val,
                    'rawLines': [lines[j]]
                }
                items.append(current_item)
                item_no = max(item_no, no)
                continue
            # Continuation / variation lines (no leading number, not a total, but short)
            if current_item and not re.match(r"^\d+\s+", line):
                if re.search(r"Subtotal|Total", line, re.I):
                    break
                # Variation indicators
                if re.match(r"(?i)(variation|color|size|type)[:\-]", line) or line.startswith('-') or len(line.split()) <= 6:
                    # Append to variation or create one
                    added = line.lstrip('-').strip()
                    if current_item.get('variation'):
                        current_item['variation'] += f" | {added}"
                    else:
                        current_item['variation'] = added
                    current_item['rawLines'].append(lines[j])
                    continue
            # If line starts with a number but not matching patterns, attempt loose parse: No Description ... Qty ... Subtotal at end
            loose = re.match(r"^(\d+)\s+(.+)$", line)
            if loose:
                possible_no = int(loose.group(1))
                remainder = loose.group(2)
                # Try to capture last two monetary values and a quantity
                money_tokens = re.findall(r"[₱$]?\d[\d,]*(?:\.\d{2})?", remainder)
                qty_token = re.findall(r"\b\d+\b", remainder)
                if len(money_tokens) >= 2 and qty_token:
                    qty_guess = None
                    for q in qty_token:
                        if q.isdigit() and int(q) <= 999:
                            qty_guess = int(q)
                            break
                    if qty_guess is not None:
                        price_guess = _parse_price(money_tokens[0])
                        subtotal_guess = _parse_price(money_tokens[-1])
                        desc_part = remainder
                        current_item = {
                            'no': possible_no,
                            'product': desc_part.strip(),
                            'variation': None,
                            'productPrice': price_guess,
                            'qty': qty_guess,
                            'subtotal': subtotal_guess,
                            'rawLines': [lines[j]]
                        }
                        items.append(current_item)
                        item_no = max(item_no, possible_no)
                        continue
            # Stop conditions
            if re.search(r"^\s*(Grand\s+Total|TOTAL)\b", line, re.I):
                break
        if items:
            # Remove helper rawLines before returning
            for it in items:
                it.pop('rawLines', None)
            # Ensure numbering
            for i, it in enumerate(items, start=1):
                if not it.get('no'):
                    it['no'] = i
            found['items'] = items

    # If no items parsed from text but we have layout_items from PDF coordinate parsing, use them
    if (not found.get('items')) and layout_items:
        if isinstance(layout_items, list) and layout_items:
            # Normalize keys if needed
            normed = []
            for it in layout_items:
                normed.append({
                    'no': it.get('no'),
                    'product': it.get('product'),
                    'variation': it.get('variation'),
                    'productPrice': it.get('productPrice') or it.get('price'),
                    'qty': it.get('qty'),
                    'subtotal': it.get('subtotal'),
                })
            found['items'] = normed
    
    # Region-based text parser in 'Order Details' block (no headers/labels) to reconstruct rows
    if not found.get('items'):
        # 1) Find 'Order Details' block boundaries in text lines
        start_idx = None
        for i, ln in enumerate(lines):
            if re.search(r"^\s*Order\s+Details\b", ln, re.I):
                start_idx = i
                break
        if start_idx is not None:
            stop_re = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", re.I)
            block: List[str] = []
            for j in range(start_idx + 1, len(lines)):
                if stop_re.search(lines[j]):
                    break
                if lines[j].strip():
                    block.append(lines[j].strip())
            # 2) Parse rows. Rows begin with an index number; continuation lines append to product.
            items_rb: List[Dict[str, Any]] = []
            cur: Optional[Dict[str, Any]] = None
            money_pat = re.compile(r"[₱$P]?\s*\d[\d,]*(?:\.\d{2})?")
            qty_pat = re.compile(r"\b\d{1,3}\b")
            def to_float(x: str) -> Optional[float]:
                try:
                    return float(x.replace(',', '').replace(' ', '').lstrip('₱$P'))
                except Exception:
                    m = re.search(r"\d[\d,]*(?:\.\d{2})?", x)
                    return float(m.group(0).replace(',', '')) if m else None
            def flush_cur():
                nonlocal cur
                if not cur:
                    return
                name = (cur.get('product') or '').strip()
                if name and (cur.get('qty') is not None or cur.get('price') is not None or cur.get('subtotal') is not None):
                    items_rb.append({
                        'no': cur.get('no') or (len(items_rb)+1),
                        'product': name[:200],
                        'variation': cur.get('variation'),
                        'productPrice': cur.get('price'),
                        'qty': cur.get('qty'),
                        'subtotal': cur.get('subtotal'),
                    })
                cur = None
            unit_like = re.compile(r"(g|kg|ml|l|pcs|piece|pack|set|cm|mm)\b", re.I)
            for ln in block:
                mrow = re.match(r"^(\d{1,3})\s+(.+)$", ln)
                if mrow:
                    # New row
                    flush_cur()
                    cur = {'no': int(mrow.group(1)), 'product': mrow.group(2)}
                    # Extract monies and qty from the remainder
                    monies = money_pat.findall(ln)
                    if monies:
                        sub_v = to_float(monies[-1])
                        pri_v = to_float(monies[-2]) if len(monies) >= 2 else None
                        # Remove money tokens from product text
                        prod_part = mrow.group(2)
                        for tok in monies:
                            prod_part = prod_part.replace(tok, ' ')
                        # Qty: last small integer near the end (exclude the leading No.)
                        qty_v = None
                        # Find integers in the remainder after product (simple heuristic)
                        qts = qty_pat.findall(ln)
                        if qts:
                            try:
                                qty_v = int(qts[-1])
                            except Exception:
                                qty_v = None
                        # Try derive qty if missing
                        if qty_v is None and pri_v is not None and sub_v is not None and pri_v > 0:
                            qcalc = round(sub_v / pri_v)
                            if 1 <= qcalc <= 999:
                                qty_v = qcalc
                        # Variation heuristic: trailing short token or bracketed part
                        var_v = None
                        mparen = re.search(r"\(([^)]{1,40})\)$", prod_part)
                        if mparen:
                            var_v = mparen.group(1).strip()
                            prod_part = re.sub(r"\([^)]{1,40}\)$", "", prod_part).strip()
                        else:
                            trail = prod_part.split()[-1] if prod_part.split() else ''
                            if unit_like.search(trail):
                                var_v = trail
                                prod_part = prod_part[: -len(trail)].strip()
                        # Assign
                        cur['product'] = re.sub(r"\s+", " ", prod_part).strip()
                        if var_v:
                            cur['variation'] = var_v
                        if pri_v is not None:
                            cur['price'] = pri_v
                        if qty_v is not None:
                            cur['qty'] = qty_v
                        if sub_v is not None:
                            cur['subtotal'] = sub_v
                    continue
                # Continuation line: append to product unless it looks like a summary/total line
                if cur and not re.search(r"Subtotal|Total|Grand|Quantity", ln, re.I):
                    cur['product'] = (str(cur.get('product') or '') + ' ' + ln).strip()
            flush_cur()
            if items_rb:
                found['items'] = items_rb

    # Advanced fallback item parsing if still empty: detect a header row with synonyms and tokenize columns.
    if not found.get('items'):
        header_candidates = []
        header_tokens_map = []
        # Potential header synonyms
        prod_syn = r"product|item|description|details?"
        qty_syn = r"qty|quantity"
        price_syn = r"price|unit|unit\s*price|unitprice"
        subtotal_syn = r"subtotal|amount|total"
        header_pattern = re.compile(rf"^(?=.*{prod_syn})(?=.*{qty_syn})(?=.*{price_syn})(?=.*{subtotal_syn}).*$", re.I)
        for idx, line in enumerate(lines):
            norm = re.sub(r"\s+", " ", line.lower())
            if header_pattern.search(norm):
                header_candidates.append(idx)
        chosen_header = header_candidates[0] if header_candidates else None
        if chosen_header is not None:
            # Tokenize header to find column boundaries by splitting on 2+ spaces
            header_line = lines[chosen_header]
            splits = re.split(r"\s{2,}", header_line.strip())
            # Map tokens to logical columns
            cols = []
            for token in splits:
                t = token.lower()
                if re.search(r"^no\b|^#", t):
                    cols.append('no')
                elif re.search(prod_syn, t):
                    cols.append('product')
                elif re.search(qty_syn, t):
                    cols.append('qty')
                elif re.search(price_syn, t):
                    cols.append('price')
                elif re.search(subtotal_syn, t):
                    cols.append('subtotal')
                else:
                    cols.append('other')
            parsed_items: List[Dict[str, Any]] = []
            for line in lines[chosen_header+1:]:
                if re.search(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due", line, re.I):
                    break
                if not line.strip():
                    continue
                parts = re.split(r"\s{2,}", line.strip())
                if len(parts) < 3:  # not enough columns
                    continue
                # Align parts to cols length
                while len(parts) < len(cols):
                    parts.append('')
                data = {k: v for k, v in zip(cols, parts)}
                # Basic filters
                if all(not v.strip() for v in data.values()):
                    continue
                # Extract fields
                try:
                    no_val = int(re.sub(r"[^0-9]", "", data.get('no','')) or 0) if 'no' in data else (len(parsed_items)+1)
                except ValueError:
                    no_val = len(parsed_items)+1
                prod_val = data.get('product') or ''
                if not prod_val:
                    continue
                # Variation heuristic
                variation_val = None
                if ' - ' in prod_val:
                    p_split = prod_val.split(' - ',1)
                    prod_core = p_split[0].strip()
                    variation_val = p_split[1].strip()
                else:
                    prod_core = prod_val.strip()
                def _to_float(x):
                    try:
                        return float(x.lstrip('₱$P').replace(',', ''))
                    except Exception:
                        return None
                price_val = _to_float(data.get('price','')) if 'price' in data else None
                qty_val = None
                if 'qty' in data:
                    try:
                        qty_val = int(re.sub(r"[^0-9]", "", data['qty']) or 0) or None
                    except ValueError:
                        qty_val = None
                subtotal_val = _to_float(data.get('subtotal','')) if 'subtotal' in data else None
                # Accept row if at least product and (qty or subtotal) present
                if prod_core and (qty_val is not None or subtotal_val is not None or price_val is not None):
                    parsed_items.append({
                        'no': no_val,
                        'product': prod_core[:200],
                        'variation': variation_val,
                        'productPrice': price_val,
                        'qty': qty_val,
                        'subtotal': subtotal_val,
                        'inferred': True
                    })
                if len(parsed_items) >= 50:
                    break
            if parsed_items:
                # Deduplicate by product + no
                seen = set()
                unique_items = []
                for it in parsed_items:
                    key = (it['no'], it['product'])
                    if key in seen:
                        continue
                    seen.add(key)
                    unique_items.append(it)
                for i, it in enumerate(unique_items, start=1):
                    if not it.get('no'):
                        it['no'] = i
                found['items'] = unique_items

    # Final conservative fallback: parse label-style rows inside 'Order Details' section
    if not found.get('items'):
        # Locate 'Order Details' block boundaries
        start_idx = None
        for i, ln in enumerate(lines):
            if re.search(r"^\s*Order\s+Details\b", ln, re.I):
                start_idx = i
                break
        if start_idx is not None:
            stop_re = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", re.I)
            block = []
            for j in range(start_idx + 1, len(lines)):
                if stop_re.search(lines[j]):
                    break
                block.append(lines[j])
            # Parse within block using label cues
            items_fb: List[Dict[str, Any]] = []
            cur: Dict[str, Any] = {}
            product_acc: List[str] = []
            no_counter = 1
            price_re = re.compile(r"(product\s*price|unit\s*price)[:\-\s]*([₱$P]?\d[\d,]*(?:\.\d{2})?)", re.I)
            qty_re = re.compile(r"(qty|quantity)[:\-\s]*([0-9]{1,3})", re.I)
            sub_re = re.compile(r"(subtotal|amount)[:\-\s]*([₱$P]?\d[\d,]*(?:\.\d{2})?)", re.I)
            var_re = re.compile(r"variation[:\-\s]*(.+)$", re.I)
            def to_float(val: str) -> Optional[float]:
                try:
                    return float(val.replace(',', '').lstrip('₱$P'))
                except Exception:
                    m = re.search(r"\d[\d,]*(?:\.\d{2})?", val)
                    return float(m.group(0).replace(',', '')) if m else None
            def flush_fb():
                nonlocal cur, product_acc, no_counter
                name = ' '.join([p for p in product_acc if p]).strip()
                if name and (cur.get('qty') is not None or cur.get('price') is not None or cur.get('subtotal') is not None):
                    items_fb.append({
                        'no': no_counter,
                        'product': name[:200],
                        'variation': cur.get('variation'),
                        'productPrice': cur.get('price'),
                        'qty': cur.get('qty'),
                        'subtotal': cur.get('subtotal'),
                    })
                    no_counter += 1
                cur = {}
                product_acc = []
            for ln in block:
                if not ln.strip():
                    continue
                mvar = var_re.search(ln)
                mprice = price_re.search(ln)
                mqty = qty_re.search(ln)
                msub = sub_re.search(ln)
                # Header or separator lines to skip
                if re.search(r"No\b|Product\b|Qty\b|Subtotal\b", ln, re.I):
                    continue
                # Capture labels
                if mvar:
                    cur['variation'] = mvar.group(1).strip()
                    continue
                if mprice:
                    cur['price'] = to_float(mprice.group(2))
                    continue
                if mqty:
                    try:
                        cur['qty'] = int(mqty.group(2))
                    except Exception:
                        pass
                    continue
                if msub:
                    cur['subtotal'] = to_float(msub.group(2))
                    # When we hit a subtotal, assume end of an item
                    flush_fb()
                    continue
                # Accumulate as part of product name if not a label line
                # Avoid lines that look like totals or section titles
                if not re.search(r"Order\s+Details|Grand\s+Total|Subtotal|Shipping|Voucher|Amount\s+Due", ln, re.I):
                    product_acc.append(ln)
            # In case last item had no explicit subtotal line, flush once
            flush_fb()
            if items_fb:
                found['items'] = items_fb

    # Last-chance Order Details parser: within the section, pair product lines with next-line numeric-only qty
    if not found.get('items'):
        # Find Order Details block boundaries
        start_idx = None
        for i, ln in enumerate(lines):
            if re.search(r"^\s*Order\s+Details\b", ln, re.I):
                start_idx = i
                break
        if start_idx is not None:
            stop_re = re.compile(r"Grand\s+Total|Merchandise\s+Subtotal|Shipping\s+Fee|Amount\s+Due|Total\s+Quantity", re.I)
            block: List[str] = []
            for j in range(start_idx + 1, len(lines)):
                if stop_re.search(lines[j]):
                    break
                if lines[j].strip():
                    block.append(lines[j].strip())
            # Skip month/date-only lines like "June" or "June :"
            month_re = re.compile(r"^(Jan|Feb|Mar|Apr|May|Jun|June|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b", re.I)
            dashed_re = re.compile(r"^-{3,}$")
            unit_num_re = re.compile(r"\b(\d{1,4})\s*(pcs|pieces?|packs?|pairs?)\b", re.I)
            leading_unit_num_re = re.compile(r"^\s*(\d{1,4})\s*(pcs|pieces?|packs?|pairs?)\b", re.I)
            simple_items: List[Dict[str, Any]] = []
            i = 0
            while i < len(block):
                ln = block[i].strip()
                if dashed_re.match(ln) or month_re.match(ln):
                    i += 1
                    continue
                # If line ends with a small integer, parse inline item
                m_inline = re.match(r"^(.{6,}?)\s+(\d{1,3})$", ln)
                if m_inline:
                    prod = m_inline.group(1).strip()
                    try:
                        qty = int(m_inline.group(2))
                    except Exception:
                        i += 1
                        continue
                    if len(prod.split()) >= 2:
                        simple_items.append({
                            'no': len(simple_items)+1,
                            'product': prod[:200],
                            'variation': None,
                            'productPrice': None,
                            'qty': qty,
                            'subtotal': None,
                        })
                    i += 1
                    continue
                # If next line is numeric-only qty, pair with current as product (with guards)
                if i + 1 < len(block) and re.fullmatch(r"\d{1,3}", block[i+1].strip()):
                    prod = ln
                    try:
                        qty = int(block[i+1].strip())
                    except Exception:
                        qty = None
                    # Guardrails: avoid treating unit counts in description (e.g., '20 packs', '50 pcs') as qty
                    leading_unit = leading_unit_num_re.search(prod)
                    unit_in_text = unit_num_re.search(prod)
                    if qty is not None and qty <= 100 and len(prod.split()) >= 2 and not month_re.match(prod):
                        # If description starts with a unit-number, and matches the next-line qty, skip pairing
                        if leading_unit and int(leading_unit.group(1)) == qty:
                            i += 2
                            continue
                        # If any unit-number appears in product and equals qty, skip pairing
                        if unit_in_text and int(unit_in_text.group(1)) == qty:
                            i += 2
                            continue
                        simple_items.append({
                            'no': len(simple_items)+1,
                            'product': prod[:200],
                            'variation': None,
                            'productPrice': None,
                            'qty': qty,
                            'subtotal': None,
                        })
                        i += 2
                        continue
                i += 1
            if simple_items:
                found['items'] = simple_items

    # Copy grandTotal alias for clarity
    if found['total'] is not None and 'grandTotal' not in found:
        found['grandTotal'] = found['total']

    # ---------------- Second Pass: Key/Value JSON-style harvesting & fallbacks ----------------
    # Build a quick key->value map from lines that look like labelled pairs for additional recovery.
    kv_map: Dict[str, str] = {}
    for line in lines:
        # Split on first ':' or ' - ' if present.
        m = re.match(r"^\s*([A-Za-z][A-Za-z0-9 ./#]+?)\s*[:\-]\s*(.+?)\s*$", line)
        if m:
            raw_key = m.group(1).strip().lower()
            raw_val = m.group(2).strip()
            # Avoid capturing lines that are just column headers or totals already handled
            if len(raw_key) < 45 and not re.search(r"qty|price|amount|total\\s*$", raw_key, re.I):
                kv_map[raw_key] = raw_val

    # Synonym mapping for monetary components & metadata
    synonym_sets = {
        'merchandiseSubtotal': [
            'merchandise subtotal','subtotal','items subtotal','item subtotal','product subtotal','merch subtotal'
        ],
        'shippingFee': [
            'shipping fee','delivery fee','ship fee','shipping cost','delivery charge','delivery charges','shipping'
        ],
        'shippingDiscount': [
            'shipping discount','delivery discount','ship discount','shipping disc','shipping voucher'
        ],
        'platformVoucher': [
            'platform voucher','platform voucher applied','voucher applied','voucher discount','total platform voucher applied','voucher'
        ],
        'paymentMethod': [
            'payment method','mode of payment','payment mode'
        ],
    }

    # Additional synonyms for common metadata that often vary between platforms
    meta_synonyms: Dict[str, List[str]] = {
        'orderSummaryNo': ['order summary no', 'order summary number', 'summary no', 'receipt number', 'receipt no', 'receipt #', 'invoice no', 'ref no', 'reference no', 'reference number'],
        'orderId': ['order id', 'order number', 'order #'],
        'dateIssued': ['date issued', 'invoice date', 'order date', 'receipt date', 'date'],
        'orderPaidDate': ['order paid date', 'paid date', 'date paid', 'payment date'],
        'buyerName': ['buyer name', 'customer', 'client'],
        'buyerAddress': ['buyer address', 'customer address', 'client address'],
        'sellerAddress': ['seller address', 'merchant address', 'supplier address', 'vendor address'],
    }

    def _parse_amount(val: str) -> Optional[float]:
        val = val.strip()
        # Remove currency symbols and stray letters at ends
        cleaned = re.sub(r"[₱$P]", "", val)
        cleaned = cleaned.replace(',', '')
        mnum = re.search(r"-?\d+(?:\.\d{2})?", cleaned)
        if not mnum:
            return None
        try:
            return float(mnum.group(0))
        except ValueError:
            return None

    # Attempt to fill missing fields from kv_map
    for target, variants in synonym_sets.items():
        if found.get(target):
            continue
        for v in variants:
            if v in kv_map:
                if 'payment' in target:
                    found[target] = kv_map[v]
                else:
                    amt = _parse_amount(kv_map[v])
                    if amt is not None:
                        # Negative for discounts/vouchers
                        if 'discount' in target or 'voucher' in target:
                            amt = -abs(amt)
                        found[target] = amt
                break

    # Attempt to fill common metadata fields from kv_map using broader synonyms
    def _pick_kv(keys: List[str]) -> Optional[str]:
        for key in keys:
            k = key.lower()
            if k in kv_map and kv_map[k]:
                return kv_map[k]
        # substring match fallback
        for key in keys:
            k = key.lower()
            for kk, vv in kv_map.items():
                if k in kk and vv:
                    return vv
        return None

    for meta_key, keys in meta_synonyms.items():
        if not found.get(meta_key):
            picked = _pick_kv(keys)
            if picked:
                found[meta_key] = picked

    # Global text scanning fallback for amounts if still missing
    full_text = ' '.join(lines)
    full_text_norm = re.sub(r"\s+", ' ', full_text)

    def _search_global(label_variants: List[str]) -> Optional[float]:
        for lv in label_variants:
            pat = re.compile(rf"{re.escape(lv)}[^0-9₱$P]{{0,25}}([₱$P]?\d[\d,]*(?:\.\d{{2}})?)", re.I)
            m = pat.search(full_text_norm)
            if m:
                amt = _parse_amount(m.group(1))
                if amt is not None:
                    return amt
        return None

    if found.get('merchandiseSubtotal') is None:
        gv = _search_global(synonym_sets['merchandiseSubtotal'])
        if gv is not None:
            found['merchandiseSubtotal'] = gv

    if found.get('shippingFee') is None:
        gv = _search_global(synonym_sets['shippingFee'])
        if gv is not None:
            found['shippingFee'] = gv

    if found.get('shippingDiscount') is None:
        gv = _search_global(synonym_sets['shippingDiscount'])
        if gv is not None:
            found['shippingDiscount'] = -abs(gv)

    if found.get('platformVoucher') is None:
        gv = _search_global(synonym_sets['platformVoucher'])
        if gv is not None:
            found['platformVoucher'] = -abs(gv)

    # Derive merchandise subtotal from items if still missing
    if found.get('merchandiseSubtotal') is None and found.get('items'):
        subtotals = [it.get('subtotal') for it in found['items'] if isinstance(it.get('subtotal'), (int,float))]
        if subtotals:
            found['merchandiseSubtotal'] = round(sum(subtotals), 2)

    # Derive shipping fee from total arithmetic if still missing
    if (found.get('shippingFee') is None and isinstance(found.get('grandTotal'), (int,float))
            and isinstance(found.get('merchandiseSubtotal'), (int,float))):
        total = found['grandTotal']
        merch = found['merchandiseSubtotal']
        ship_disc = found.get('shippingDiscount') or 0
        plat_v = found.get('platformVoucher') or 0
        derived = total - merch - ship_disc - plat_v  # discounts are negative already
        # sanity bounds: shipping fee shouldn't exceed 50% of total (heuristic)
        if 0 <= derived <= max(total * 0.5, 20_000):  # allow large absolute cap
            found['shippingFee'] = round(derived, 2)

    # Derive platform voucher if missing (ensure arithmetic balances)
    if (found.get('platformVoucher') is None and isinstance(found.get('grandTotal'), (int,float))
            and isinstance(found.get('merchandiseSubtotal'), (int,float))):
        total = found['grandTotal']
        merch = found['merchandiseSubtotal']
        ship_fee = found.get('shippingFee') or 0
        ship_disc = found.get('shippingDiscount') or 0
        derived_plat = total - merch - ship_fee - ship_disc
        # If very close to zero, set explicitly to 0 (no voucher)
        if abs(derived_plat) < 0.01:
            found['platformVoucher'] = 0.0
        else:
            # Otherwise, accept a small negative/positive within plausible bounds
            if -50000 <= derived_plat <= 50000:
                found['platformVoucher'] = round(derived_plat, 2)

    # Currency fallback: inspect any line
    if not found.get('currency'):
        for ln in lines:
            if re.search(r"₱|PHP|Php|Philippine Peso", ln):
                found['currency'] = 'PHP'
                break
            if '$' in ln or re.search(r"USD", ln):
                found['currency'] = 'USD'
                break

    # Treat zero merchandise subtotal as missing if total exists and items exist with non-zero sum
    if (isinstance(found.get('merchandiseSubtotal'), (int,float)) and found['merchandiseSubtotal'] == 0
            and found.get('items')):
        sum_items = sum([it.get('subtotal') or 0 for it in found['items'] if isinstance(it.get('subtotal'), (int,float))])
        if sum_items > 0:
            found['merchandiseSubtotal'] = sum_items

    # Attach raw key-value map for debugging (optional)
    found['rawKeyValue'] = kv_map

    # Final cleanup: remove spurious non-item lines that slipped into items
    def _clean_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cleaned: List[Dict[str, Any]] = []
        ban = re.compile(r"(receipt\s*number|receipt\b|order\s*(summary|id|no|number)|invoice\s*(id|no|number)|buyer|seller|address|delivery|ship\s*to|bill\s*to|tracking|awb|waybill|payment|method|summary|total|voucher|subtotal|fee|discount|amount|due)", re.I)
        for it in items:
            prod = (it.get('product') or '').strip()
            if not prod or ban.search(prod):
                continue
            price = it.get('productPrice') or it.get('price')
            subtotal = it.get('subtotal')
            qty = it.get('qty')
            # Keep only if a monetary value OR an explicit qty is present (some platforms omit unit prices)
            if not isinstance(price, (int,float)) and not isinstance(subtotal, (int,float)) and not isinstance(qty, (int,float)):
                continue
            # Normalize types
            try:
                if isinstance(price, str):
                    price = float(price.replace(',', '').lstrip('₱$P'))
            except Exception:
                price = None
            try:
                if isinstance(subtotal, str):
                    subtotal = float(subtotal.replace(',', '').lstrip('₱$P'))
            except Exception:
                subtotal = None
            new_it = {
                'no': it.get('no'),
                'product': prod[:200],
                'variation': it.get('variation') or None,
                'productPrice': price,
                'qty': it.get('qty'),
                'subtotal': subtotal,
            }
            cleaned.append(new_it)
        return cleaned

    if found.get('items'):
        found['items'] = _clean_items(found['items'])
        # If items became empty, unset to allow downstream fallbacks if any (none at this point)
        if not found['items']:
            found['items'] = []

    # Sanity checks: ensure breakdown components are reasonable relative to grand total
    gt = found.get('grandTotal') or found.get('total')
    if isinstance(gt, (int,float)):
        for k in ['merchandiseSubtotal','shippingFee']:
            v = found.get(k)
            if isinstance(v, (int,float)) and v > gt * 5:
                # If wildly larger than total and has no currency in nearby lines, drop it
                found[k] = None
        for k in ['shippingDiscount','platformVoucher']:
            v = found.get(k)
            if isinstance(v, (int,float)) and abs(v) > gt * 5:
                found[k] = None

    return found


def _parse_amount_in_words(lines: list[str]) -> float | None:
    """Attempt to parse an amount written in words (e.g., 'Three Hundred Forty Four Pesos and 60/100').
    Supports basic English number words up to millions.
    """
    # Join searchable text with line indices
    target_idx = None
    for i, line in enumerate(lines):
        if re.search(r"amount\s+in\s+words", line, re.I):
            target_idx = i
            break
    if target_idx is None:
        return None

    # The amount words may be on same line after colon or next line(s)
    candidate = lines[target_idx]
    # Remove the leading label
    candidate = re.sub(r".*amount\s+in\s+words[:\-]*", "", candidate, flags=re.I).strip()
    if len(candidate.split()) < 2 and target_idx + 1 < len(lines):
        # Append next line if too short
        candidate = candidate + " " + lines[target_idx + 1].strip()

    # Fractional part like 60/100
    frac = 0.0
    mfrac = re.search(r"(\d{1,2})/100", candidate)
    if mfrac:
        try:
            frac = int(mfrac.group(1)) / 100.0
        except ValueError:
            frac = 0.0
        candidate = re.sub(r"\d{1,2}/100", "", candidate)

    # Tokenize words
    tokens = [t.lower() for t in re.split(r"[^A-Za-z]+", candidate) if t]
    if not tokens:
        return None

    units = {
        'zero':0,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,
        'ten':10,'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,'nineteen':19
    }
    tens = {'twenty':20,'thirty':30,'forty':40,'fifty':50,'sixty':60,'seventy':70,'eighty':80,'ninety':90}
    scales = {'hundred':100,'thousand':1000,'million':1000000}
    ignore = {'and','pesos','peso','only','php','philippine'}

    current = 0
    total = 0
    consumed_any = False
    for w in tokens:
        if w in ignore:
            continue
        if w in units:
            current += units[w]
            consumed_any = True
        elif w in tens:
            current += tens[w]
            consumed_any = True
        elif w == 'hundred':
            if current == 0:
                current = 1
            current *= 100
            consumed_any = True
        elif w in ('thousand','million'):
            mult = scales[w]
            if current == 0:
                current = 1
            total += current * mult
            current = 0
            consumed_any = True
        else:
            # Unknown word; stop parsing to reduce false positives
            continue
    total += current
    if not consumed_any:
        return None
    return float(total) + frac if total or frac else None


def _build_standard_overview(found: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize parsed fields into a single, consistent overview structure.

    Output schema:
      Seller Name, Seller Address,
      Buyer Name, Buyer Address,
      Order Summary: { Order Summary No., Date Issued, Order ID, Order Paid Date, Payment Method },
      Order Details: { Items List: [{No., Product, Variation, Product Price, Qty, Subtotal}] },
      Payment Breakdown: { Merchandise Subtotal, Shipping/Delivery Fee, Shipping/Delivery Discount, Voucher Discount, Grand Total }
    """
    kv = { (k or '').strip().lower(): (v or '').strip() for k, v in (found.get('rawKeyValue') or {}).items() }

    # Synonyms to harvest values if primary fields are missing
    syn = {
        'order_id': ['order id', 'invoice no', 'ref no', 'reference no', 'reference number', 'order number'],
        'total_amount': ['grand total', 'total amount', 'total due', 'amount due', 'amount payable', 'total'],
        'date_issued': ['date issued', 'invoice date', 'order date', 'receipt date', 'date'],
        'order_paid_date': ['order paid date', 'paid date', 'date paid', 'payment date'],
        'payment_method': ['payment method', 'paid via', 'mode of payment', 'payment mode'],
        'buyer_name': ['buyer name', 'customer', 'client'],
        'buyer_address': ['buyer address', 'customer address', 'client address'],
        'seller_name': ['seller name', 'merchant', 'supplier', 'vendor', 'sold by'],
        'seller_address': ['seller address', 'merchant address', 'supplier address', 'vendor address'],
        'order_summary_no': ['order summary no', 'order summary number', 'summary no', 'invoice no', 'ref no', 'receipt number', 'receipt no', 'receipt #'],
    }

    def pick_from_kv(keys: List[str]) -> Optional[str]:
        for k in keys:
            k0 = k.lower()
            if k0 in kv and kv[k0]:
                return kv[k0]
        # fallback: substring match to be resilient to OCR variants
        for k in keys:
            k0 = k.lower()
            for kk, vv in kv.items():
                if k0 in kk and vv:
                    return vv
        return None

    def to_float(v: Any) -> Optional[float]:
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        try:
            s = str(v).strip()
            s = s.replace(',', '')
            s = s.lstrip('₱$P')
            m = re.search(r"-?\d+(?:\.\d{2})?", s)
            return float(m.group(0)) if m else None
        except Exception:
            return None

    # Parties
    seller_name = found.get('supplier') or pick_from_kv(syn['seller_name'])
    seller_address = found.get('sellerAddress') or pick_from_kv(syn['seller_address'])
    buyer_name = found.get('buyerName') or pick_from_kv(syn['buyer_name'])
    buyer_address = found.get('buyerAddress') or pick_from_kv(syn['buyer_address'])

    # Order summary
    order_summary_no = found.get('orderSummaryNo') or found.get('invoiceNumber') or pick_from_kv(syn['order_summary_no'])
    order_id = found.get('orderId') or pick_from_kv(syn['order_id'])
    date_issued = found.get('dateIssued') or pick_from_kv(syn['date_issued']) or found.get('date')
    order_paid_date = found.get('orderPaidDate') or pick_from_kv(syn['order_paid_date'])
    payment_method = found.get('paymentMethod') or pick_from_kv(syn['payment_method'])

    # Items
    items_in = found.get('items') or []
    items_list: List[Dict[str, Any]] = []
    for it in items_in:
        if not isinstance(it, dict):
            continue
        items_list.append({
            'No.': it.get('no'),
            'Product': it.get('product'),
            'Variation': it.get('variation'),
            'Product Price': to_float(it.get('productPrice') or it.get('price')),
            'Qty': it.get('qty'),
            'Subtotal': to_float(it.get('subtotal')),
        })

    # Payment breakdown
    merch_sub = to_float(found.get('merchandiseSubtotal'))
    ship_fee = to_float(found.get('shippingFee'))
    ship_disc = to_float(found.get('shippingDiscount'))
    voucher = to_float(found.get('platformVoucher'))
    grand_total = to_float(found.get('grandTotal') if 'grandTotal' in found else found.get('total'))

    # Present discounts as positive amounts in the overview (human-friendly)
    ship_disc_out = abs(ship_disc) if ship_disc is not None else None
    voucher_out = abs(voucher) if voucher is not None else None

    overview = {
        'Seller Name': seller_name,
        'Seller Address': seller_address,
        'Buyer Name': buyer_name,
        'Buyer Address': buyer_address,
        'Order Summary': {
            'Order Summary No.': order_summary_no,
            'Date Issued': date_issued,
            'Order ID': order_id,
            'Order Paid Date': order_paid_date,
            'Payment Method': payment_method,
        },
        'Order Details': {
            'Items List': items_list
        },
        'Payment Breakdown': {
            'Merchandise Subtotal': merch_sub,
            'Shipping/Delivery Fee': ship_fee,
            'Shipping/Delivery Discount': ship_disc_out,
            'Voucher Discount': voucher_out,
            'Grand Total': grand_total,
        }
    }

    return overview

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: process_file.py <file_path>",
            "text": ""
        }))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({
            "success": False,
            "error": f"File not found: {file_path}",
            "text": ""
        }))
        sys.exit(1)

    try:
        poppler_path = _configure_binaries()
        result = process_file(file_path, poppler_path)
        text = result['text'] if isinstance(result, dict) else str(result)
        layout_items = result.get('layout_items') if isinstance(result, dict) else None
        font_hints = result.get('font_hints') if isinstance(result, dict) else None
        structured = _extract_structured(text, layout_items, font_hints)
        standard_overview = _build_standard_overview(structured)
        print(json.dumps({
            "success": True,
            "error": None,
            "text": text,
            "structured": structured,
            "standardOverview": standard_overview
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "text": ""
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()