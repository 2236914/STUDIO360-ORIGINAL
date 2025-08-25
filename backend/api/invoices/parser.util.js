// Parser utilities with regex mappings and proximity-based amount extraction

const REGEX = {
  order_number: /\b(?:order|ord|invoice|inv)[\s:]*([A-Za-z0-9-]+)/i,
  date1: /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/, // DD/MM/YYYY or MM/DD/YYYY (ambiguous)
  date2: /\b\d{4}[\/\-]\d{2}[\/\-]\d{2}\b/, // YYYY/MM/DD
  payment_method: /\b(?:cash on delivery|cod|credit card|paypal|bank transfer|gcash)\b/i,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  phone: /\+?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/,
  address: /\d{1,5}\s+\w+(\s+\w+){1,5},?\s+\w+/,
  name: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/,
  amounts: /(?:(subtotal|grand total|total|balance due)\s*[:\-]?\s*)(₱|\$|€)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/ig,
};

function firstMatch(regex, text) {
  const m = text.match(regex);
  return m ? (m[1] || m[0]) : null;
}

function extractRegexFields(text) {
  const order_number = firstMatch(REGEX.order_number, text);
  const date = firstMatch(REGEX.date2, text) || firstMatch(REGEX.date1, text);
  const payment_method = firstMatch(REGEX.payment_method, text);
  const email = firstMatch(REGEX.email, text);
  const phone = firstMatch(REGEX.phone, text);
  const address = firstMatch(REGEX.address, text);
  const name = firstMatch(REGEX.name, text);
  return { order_number, date, payment_method, email, phone, address, name };
}

function deriveAmountsFromText(text) {
  // Scan all labeled amounts and choose by label proximity/priority
  const res = { subtotal: null, total: null, grand_total: null };
  const matches = [...text.matchAll(REGEX.amounts)];
  for (const m of matches) {
    const label = (m[1] || '').toLowerCase();
    const value = parseFloat((m[3] || '').replace(/,/g, ''));
    if (Number.isNaN(value)) continue;
    if (label.includes('grand')) {
      res.grand_total = value;
    } else if (label.includes('subtotal')) {
      res.subtotal = value;
    } else if (label.includes('balance')) {
      // balance due usually equals grand total to pay
      res.grand_total = res.grand_total ?? value;
    } else if (label === 'total') {
      // Only fill plain total if we don't already have a grand total
      if (res.total == null) res.total = value;
    }
  }
  return res;
}

function toUnknown(v) {
  return v === undefined || v === null || v === '' ? 'unknown' : v;
}

function mapToExpected(structured, regexFields, amountCandidates) {
  // Map Python structure to expected keys, fallback to regex and unknown
  const order_number = structured?.invoiceNumber || structured?.orderSummaryNo || structured?.orderId || regexFields.order_number;
  const buyer_name = structured?.buyerName || regexFields.name;
  const buyer_address = structured?.buyerAddress || null;
  const seller_name = structured?.supplier || regexFields.name;
  const seller_address = structured?.sellerAddress || null;
  const order_date = structured?.date || structured?.dateIssued || regexFields.date;
  const payment_method = structured?.paymentMethod || regexFields.payment_method;
  const subtotal = structured?.merchandiseSubtotal ?? amountCandidates.subtotal;
  const grand_total = (structured?.grandTotal ?? structured?.total) ?? amountCandidates.grand_total;
  const total = amountCandidates.total; // keep separate if present

  const items = Array.isArray(structured?.items)
    ? structured.items.map((it) => ({
        name: it.product ?? it.name ?? '',
        qty: it.qty ?? null,
        price: it.productPrice ?? it.price ?? null,
        subtotal: it.subtotal ?? null,
      }))
    : [];

  return {
    order_number: toUnknown(order_number),
    buyer_name: toUnknown(buyer_name),
    buyer_address: toUnknown(buyer_address),
    seller_name: toUnknown(seller_name),
    seller_address: toUnknown(seller_address),
    order_date: toUnknown(order_date),
    payment_method: toUnknown(payment_method),
    subtotal: toUnknown(subtotal),
    total: toUnknown(total),
    grand_total: toUnknown(grand_total),
    items,
  };
}

module.exports = {
  REGEX,
  extractRegexFields,
  deriveAmountsFromText,
  mapToExpected,
};
