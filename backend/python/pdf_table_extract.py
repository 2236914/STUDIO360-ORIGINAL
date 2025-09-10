"""PDF table extraction utilities for invoice line items.

Strategy:
1. Try pdfplumber to extract tables (fast, pure Python)
2. Fallback to camelot (if installed) using lattice then stream
3. Choose best table via heuristic keyed on presence of item/qty/price columns
4. Normalize columns to: description, quantity, unit_price, line_total (others kept raw_* )
5. Return list[dict]

All functions are defensive: failures return [] and never raise.
"""
from __future__ import annotations
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Sequence

import pandas as pd

# camelot is optional
try:
    import camelot  # type: ignore
    _HAS_CAMELOT = True
except Exception:  # pragma: no cover
    _HAS_CAMELOT = False

try:
    import pdfplumber  # type: ignore
    _HAS_PDFPLUMBER = True
except Exception:  # pragma: no cover
    _HAS_PDFPLUMBER = False

ITEM_COL_HINTS = ["item", "description", "product", "part", "details"]
QTY_COL_HINTS = ["qty", "quantity", "q'ty", "pcs"]
UNIT_COL_HINTS = ["unit price", "unit amt", "price", "unit cost", "cost"]
TOTAL_COL_HINTS = ["amount", "line total", "total", "extended", "net"]

NUM_CLEAN_RE = re.compile(r"[^0-9.,-]")


def _clean_header_cell(text: Any) -> str:
    t = str(text or "").strip().lower()
    t = re.sub(r"\s+", " ", t)
    return t


def _score_table(df: pd.DataFrame) -> tuple:
    headers = [_clean_header_cell(c) for c in df.iloc[0].tolist()] if df.shape[0] else []
    joined = "|".join(headers)
    hits = 0
    for bucket in (ITEM_COL_HINTS, QTY_COL_HINTS, UNIT_COL_HINTS, TOTAL_COL_HINTS):
        if any(h in joined for h in bucket):
            hits += 1
    return (hits, df.shape[1], df.shape[0])


def _coerce_numeric(val: Any) -> Optional[float]:
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    s = NUM_CLEAN_RE.sub("", s)
    # handle comma as thousand
    if s.count('.') > 1:
        # remove all dots except last
        parts = s.split('.')
        s = ''.join(parts[:-1]) + '.' + parts[-1]
    try:
        s = s.replace(',', '')
        return float(s)
    except Exception:
        return None


def _normalize_table(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if df.empty:
        return []
    # Assume first row is header
    header = [_clean_header_cell(c) for c in df.iloc[0].tolist()]
    body = df.iloc[1:].reset_index(drop=True)
    body.columns = header

    # Map columns
    col_map: Dict[str, str] = {}
    for col in header:
        lc = col
        if any(h in lc for h in ITEM_COL_HINTS) and 'description' not in col_map.values():
            col_map[col] = 'description'
        elif any(h in lc for h in QTY_COL_HINTS) and 'quantity' not in col_map.values():
            col_map[col] = 'quantity'
        elif any(h in lc for h in UNIT_COL_HINTS) and 'unit_price' not in col_map.values():
            col_map[col] = 'unit_price'
        elif any(h in lc for h in TOTAL_COL_HINTS) and 'line_total' not in col_map.values():
            col_map[col] = 'line_total'
        else:
            # keep raw
            col_map[col] = f"raw_{lc.replace(' ', '_')[:40]}"

    norm_rows: List[Dict[str, Any]] = []
    for _, row in body.iterrows():
        rec: Dict[str, Any] = {}
        for col, v in row.items():
            tgt = col_map.get(col, col)
            rec[tgt] = (str(v).strip() if isinstance(v, str) else v)
        # numeric conversions
        if 'quantity' in rec:
            rec['quantity'] = _coerce_numeric(rec['quantity'])
        if 'unit_price' in rec:
            rec['unit_price'] = _coerce_numeric(rec['unit_price'])
        if 'line_total' in rec:
            rec['line_total'] = _coerce_numeric(rec['line_total'])
        norm_rows.append(rec)

    return [r for r in norm_rows if any(str(r.get(k,'')) for k in ('description','line_total','unit_price'))]


def extract_invoice_items(pdf_path: str | Path, max_pages: Optional[int] = None) -> List[Dict[str, Any]]:
    """Extract probable invoice line items as list of dict.

    Returns [] if unsupported / nothing found. Non-throwing.
    """
    path = Path(pdf_path)
    if not path.exists() or path.suffix.lower() != '.pdf':
        return []

    candidate_tables: List[pd.DataFrame] = []

    # 1. pdfplumber
    if _HAS_PDFPLUMBER:
        try:
            import pdfplumber  # local import for mypy
            with pdfplumber.open(path) as pdf:
                for pi, page in enumerate(pdf.pages):
                    if max_pages and pi >= max_pages:
                        break
                    tables = page.extract_tables()
                    for t in tables:
                        if t and len(t) > 1 and len(t[0]) > 1:
                            df = pd.DataFrame(t)
                            candidate_tables.append(df)
        except Exception:
            pass

    # 2. camelot fallback
    if not candidate_tables and _HAS_CAMELOT:
        for flavor in ("lattice", "stream"):
            try:
                tables = camelot.read_pdf(str(path), flavor=flavor, pages='1-{}'.format(max_pages or 1))
                for t in tables:  # type: ignore
                    if t.df.shape[0] > 1 and t.df.shape[1] > 1:
                        candidate_tables.append(t.df.copy())
                if candidate_tables:
                    break
            except Exception:
                continue

    if not candidate_tables:
        return []

    # choose best
    best = sorted(candidate_tables, key=_score_table, reverse=True)[0]
    return _normalize_table(best)

__all__ = ["extract_invoice_items"]
