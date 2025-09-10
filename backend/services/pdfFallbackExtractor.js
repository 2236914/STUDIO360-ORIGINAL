// Lightweight Node PDF text -> line items heuristic fallback
// Used when Python OCR pipeline fails or returns no items.
// Strategy: parse text, locate a header line containing item-ish tokens, then collect subsequent lines
// until a total indicator. Split columns by 2+ spaces and map to schema.

const HEADER_TOKENS = [/item|product|description/i, /qty|quantity/i];
const TOTAL_STOP = /(grand\s*total|amount\s*due|total\s*quantity)/i;

function splitColumns(line) {
  return line.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
}

function scoreHeader(parts) {
  const joined = parts.join(' ').toLowerCase();
  let hit = 0;
  if (/item|product|description/.test(joined)) hit++;
  if (/qty|quantity/.test(joined)) hit++;
  if (/price|unit|amount|subtotal|total/.test(joined)) hit++;
  return hit;
}

function coerceNumber(v) {
  if (!v) return null;
  const c = v.replace(/[^0-9.,-]/g,'').replace(/,(?=\d{3}\b)/g,'');
  if (!c) return null;
  const n = parseFloat(c.replace(/,/g,''));
  return isNaN(n) ? null : n;
}

function parseItemsFromText(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  let headerIdx = -1;
  let headerParts = [];
  for (let i=0;i<lines.length;i++) {
    const parts = splitColumns(lines[i]);
    if (parts.length >= 2 && scoreHeader(parts) >= 2) { headerIdx = i; headerParts = parts; break; }
  }
  if (headerIdx === -1) return [];
  const items = [];
  for (let j = headerIdx + 1; j < lines.length; j++) {
    const ln = lines[j];
    if (TOTAL_STOP.test(ln)) break;
    const cols = splitColumns(ln);
    if (cols.length < 2) continue;
    // Heuristic: last numeric = subtotal, preceding numeric = unit price, one small integer = qty
    let subtotal = null, unit = null, qty = null;
    for (let k = cols.length - 1; k >= 0; k--) {
      const num = coerceNumber(cols[k]);
      if (num != null) { subtotal = num; cols.splice(k,1); break; }
    }
    for (let k = cols.length - 1; k >= 0; k--) {
      const num = coerceNumber(cols[k]);
      if (num != null) { unit = num; cols.splice(k,1); break; }
    }
    for (let k = cols.length - 1; k >= 0; k--) {
      const num = coerceNumber(cols[k]);
      if (num != null && Number.isInteger(num) && num <= 999) { qty = num; cols.splice(k,1); break; }
    }
    const product = cols.join(' ').slice(0,200).trim();
    if (!product) continue;
    if ([subtotal, unit, qty].every(v => v == null)) continue;
    items.push({
      no: items.length + 1,
      product,
      variation: null,
      productPrice: unit,
      qty,
      subtotal
    });
    if (items.length >= 150) break; // safety cap
  }
  return items;
}

module.exports = { parseItemsFromText };
