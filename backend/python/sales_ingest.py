import os
import sys
import json
import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

import pandas as pd

# Column alias maps per platform
TIKTOK_ALIASES = {
    'total_revenue': ['total revenue', 'sales (after seller discounts)', 'net sales', 'net item amount'],
    'fees': ['total fees', 'platform charges', 'commission', 'service fee', 'total platform fee'],
    'withholding_tax': ['adjustment amount', 'withholding tax', 'tax withheld'],
    'cash_received': ['total settlement amount', 'settlement', 'payout amount', 'released amount'],
    'date': ['date', 'transaction date', 'settlement date']
}

SHOPEE_ALIASES = {
    'total_revenue': ['original price', 'gross sales', 'item original amount'],
    'fees': ['platform fees', 'fees & charges', 'seller fees', 'total fees', 'blue column'],
    'withholding_tax': ['withholding tax', 'tax withheld', 'orange column'],
    'cash_received': ['total released amount', 'released amount', 'net payout', 'green column'],
    'date': ['date', 'order date', 'transaction date']
}

COMMON_SCHEMA_KEYS = ['date','platform','order_id','total_revenue','fees','withholding_tax','cash_received']

@dataclass
class NormalizedSale:
    date: str
    platform: str
    order_id: str
    total_revenue: float
    fees: float
    withholding_tax: float
    cash_received: float

    def to_journal_entries(self) -> List[Dict[str, Any]]:
        entries: List[Dict[str, Any]] = []
        cash = round(self.cash_received or 0, 2)
        fees = round(self.fees or 0, 2)
        tax = round(self.withholding_tax or 0, 2)
        revenue = round(self.total_revenue or 0, 2)
        # Platform specific credit logic:
        # TikTok: revenue = settlement + fees + withholding_tax
        # Shopee: revenue provided is gross; cash = gross - fees - tax
        # Since normalization already maps fields, we reconstruct Sales credit generically:
        credit_sales = round(cash + fees + tax, 2) if self.platform.lower() == 'tiktok' else revenue
        # Debits
        entries.append({'account': 'Cash', 'side': 'Dr', 'amount': cash})
        if tax > 0:
            entries.append({'account': 'Withholding Tax', 'side': 'Dr', 'amount': tax})
        if fees > 0:
            entries.append({'account': 'Fees & Charges', 'side': 'Dr', 'amount': fees})
        # Credit
        entries.append({'account': 'Sales', 'side': 'Cr', 'amount': credit_sales})
        return entries

    def remarks(self) -> str:
        return f"To record sales for the day - {self.platform}" if self.platform else "To record sales"


def detect_platform(df: pd.DataFrame) -> str:
    joined_cols = ' '.join(df.columns.str.lower())
    if any('tiktok' in str(v).lower() for v in df.columns):
        return 'TikTok'
    if 'settlement amount' in joined_cols or 'adjustment amount' in joined_cols:
        return 'TikTok'
    if 'original price' in joined_cols or 'total released amount' in joined_cols:
        return 'Shopee'
    # Fallback: heuristic by presence of distinctive columns
    if 'total settlement amount' in joined_cols:
        return 'TikTok'
    return 'Shopee'


def _find_column(df: pd.DataFrame, aliases: List[str]) -> Optional[str]:
    for col in df.columns:
        norm = col.strip().lower().replace('\n',' ').replace('  ',' ')
        for a in aliases:
            pattern = a.lower()
            if pattern in norm:
                return col
    return None


def normalize_rows(df: pd.DataFrame, platform: str) -> List[NormalizedSale]:
    alias_map = TIKTOK_ALIASES if platform.lower() == 'tiktok' else SHOPEE_ALIASES
    col_map: Dict[str, Optional[str]] = {}
    for key, names in alias_map.items():
        col_map[key] = _find_column(df, names)

    sales: List[NormalizedSale] = []
    # Order ID aliases common across exports
    order_aliases = ['order id','order_id','orderid','order no','order number','transaction id','txn id','ref','reference']
    for _, row in df.iterrows():
        def parse_float(val) -> float:
            if val is None: return 0.0
            try:
                s = str(val).strip()
                if s == '': return 0.0
                s = re.sub(r'[^0-9.-]', '', s)
                return float(s) if s not in ('', '-', None) else 0.0
            except Exception:
                return 0.0
        date_raw = row[col_map['date']] if col_map.get('date') else ''
        # Normalize date to YYYY-MM-DD with defensive parsing
        date_norm = ''
        if date_raw is not None and str(date_raw).strip() != '':
            try:
                d = pd.to_datetime(str(date_raw).strip(), errors='coerce', dayfirst=False)
                if pd.notna(d):
                    date_norm = d.strftime('%Y-%m-%d')
            except Exception:
                # final fallback: regex YYYY-MM-DD inside string
                m = re.search(r'(20[0-9]{2})[-/.](0[1-9]|1[0-2])[-/.]([0-3][0-9])', str(date_raw))
                if m:
                    date_norm = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        # Order ID detection per row: scan columns for first non-empty alias
        order_id_val = ''
        for col in df.columns:
            normc = col.strip().lower()
            if any(a in normc for a in order_aliases):
                rawv = row[col]
                if rawv not in (None, ''):
                    order_id_val = str(rawv).strip()[:80]
                    break
        sale = NormalizedSale(
            date=date_norm or '',
            platform=platform,
            order_id=order_id_val,
            total_revenue=parse_float(row[col_map['total_revenue']]) if col_map.get('total_revenue') else 0.0,
            fees=parse_float(row[col_map['fees']]) if col_map.get('fees') else 0.0,
            withholding_tax=parse_float(row[col_map['withholding_tax']]) if col_map.get('withholding_tax') else 0.0,
            cash_received=parse_float(row[col_map['cash_received']]) if col_map.get('cash_received') else 0.0,
        )
        # Skip empty lines
        if not any([sale.total_revenue, sale.fees, sale.withholding_tax, sale.cash_received]):
            continue
        sales.append(sale)
    return sales


def load_excel(path: str) -> pd.DataFrame:
    return pd.read_excel(path, engine='openpyxl')


def ingest_sales(path: str) -> Dict[str, Any]:
    df = load_excel(path)
    platform = detect_platform(df)
    sales = normalize_rows(df, platform)
    normalized = [asdict(s) for s in sales]
    journal_batches: List[Dict[str, Any]] = []
    for s in sales:
        journal_batches.append({
            'date': s.date,
            'remarks': s.remarks(),
            'order_id': s.order_id,
            'lines': s.to_journal_entries(),
            'platform': s.platform,
        })
    return {
        'platform': platform,
        'count': len(sales),
        'normalized': normalized,
        'journalEntries': journal_batches,
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Usage: python sales_ingest.py <excel_path>'}))
        sys.exit(1)
    path = sys.argv[1]
    if not os.path.exists(path):
        print(json.dumps({'success': False, 'error': 'File not found'}))
        sys.exit(1)
    try:
        result = ingest_sales(path)
        print(json.dumps({'success': True, 'data': result}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
