"use client";

import React, { useState } from "react";

// Minimal UI using native elements to reduce coupling

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.csv,.xlsx";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export default function InvoiceParserPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // full payload from /api/ai/upload
  const [editable, setEditable] = useState(null); // simplified canonical fields for quick edits

  const onFileChange = (e) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = ACCEPT.split(",").some((ext) => f.name.toLowerCase().endsWith(ext.trim()));
    if (!ok) {
      setError("Unsupported file type. Allowed: PDF, JPG, PNG, CSV, XLSX");
      return;
    }
    setFile(f);
  };

  const toEditableFromCanonical = (canonical) => {
    if (!canonical || typeof canonical !== 'object') return null;
    const fields = canonical.fields || {};
    const amounts = canonical.amounts || canonical.paymentBreakdown || {};
    const items = (canonical.orderDetails?.items || canonical.items || []).map((it) => ({
      name: it.item_name ?? it.product ?? "",
      qty: it.qty ?? null,
      price: it.price ?? it.productPrice ?? null,
      subtotal: it.subtotal ?? null,
    }));
    return {
      doc_no: fields.orderSummaryNo || fields.invoiceNumber || fields.orderId || "",
      buyer_name: fields.buyerName || "",
      buyer_address: fields.buyerAddress || "",
      seller_name: fields.sellerName || "",
      seller_address: fields.sellerAddress || "",
      date_issued: fields.dateIssued || "",
      order_paid_date: fields.orderPaidDate || "",
      payment_method: fields.paymentMethod || "",
      subtotal: amounts.merchandiseSubtotal ?? "",
      total: amounts.grandTotal ?? "",
      grand_total: amounts.grandTotal ?? "",
      items,
    };
  };

  const onUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please choose a file first");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${BACKEND_URL}/api/ai/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || data.error || "Upload failed");
      }
      const payload = data.data || {};
      const canonical = payload.canonical || null;
      setResult(payload);
      if (canonical) {
        setEditable(toEditableFromCanonical(canonical));
      } else if (payload.structured) {
        // Legacy fallback if server didn't return canonical for some reason
        const legacy = {
          doc_no: payload.structured.orderSummaryNo || payload.structured.invoiceNumber || payload.structured.orderId || "",
          buyer_name: payload.structured.buyerName || "",
          buyer_address: payload.structured.buyerAddress || "",
          seller_name: payload.structured.supplier || payload.structured.sellerName || "",
          seller_address: payload.structured.sellerAddress || "",
          date_issued: payload.structured.dateIssued || payload.structured.date || "",
          order_paid_date: payload.structured.orderPaidDate || "",
          payment_method: payload.structured.paymentMethod || "",
          subtotal: payload.structured.merchandiseSubtotal ?? "",
          total: payload.structured.total ?? payload.structured.grandTotal ?? "",
          grand_total: payload.structured.grandTotal ?? payload.structured.total ?? "",
          items: (payload.structured.items || []).map((it) => ({
            name: it.product ?? "",
            qty: it.qty ?? null,
            price: it.productPrice ?? null,
            subtotal: it.subtotal ?? null,
          })),
        };
        setEditable(legacy);
      } else {
        setEditable(null);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (k, v) => {
    setEditable((prev) => ({ ...(prev || {}), [k]: v }));
  };

  const updateItem = (i, field, value) => {
    setEditable((prev) => {
      const items = Array.isArray(prev?.items) ? [...prev.items] : [];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setEditable((prev) => ({ ...(prev || {}), items: [...(prev?.items || []), { name: "", qty: null, price: null, subtotal: null }] }));
  };

  const removeItem = (i) => {
    setEditable((prev) => ({ ...(prev || {}), items: (prev?.items || []).filter((_, idx) => idx !== i) }));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(editable || {}, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-parsed-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Field = ({ label, value, onChange, type = "text" }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
      />
    </label>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Invoice OCR & Parser</h1>
      <p style={{ marginTop: 0, color: "#666" }}>Upload an invoice (PDF/JPG/PNG/CSV/XLSX), then review and edit the extracted JSON.</p>

      <form onSubmit={onUpload} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input type="file" accept={ACCEPT} onChange={onFileChange} />
        <button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
          {loading ? "Processing…" : "Upload & Parse"}
        </button>
      </form>
      {error ? (
        <div style={{ color: "#c62828", marginBottom: 12 }}>Error: {error}</div>
      ) : null}

      {editable && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Order / Invoice Number" value={editable.doc_no} onChange={(v) => updateField("doc_no", v)} />
            <Field label="Buyer Name" value={editable.buyer_name} onChange={(v) => updateField("buyer_name", v)} />
            <Field label="Buyer Address" value={editable.buyer_address} onChange={(v) => updateField("buyer_address", v)} />
            <Field label="Seller Name" value={editable.seller_name} onChange={(v) => updateField("seller_name", v)} />
            <Field label="Seller Address" value={editable.seller_address} onChange={(v) => updateField("seller_address", v)} />
            <Field label="Date Issued" value={editable.date_issued} onChange={(v) => updateField("date_issued", v)} />
            <Field label="Order Paid Date" value={editable.order_paid_date} onChange={(v) => updateField("order_paid_date", v)} />
            <Field label="Payment Method" value={editable.payment_method} onChange={(v) => updateField("payment_method", v)} />
            <Field label="Subtotal" value={editable.subtotal} onChange={(v) => updateField("subtotal", v)} />
            <Field label="Total" value={editable.total} onChange={(v) => updateField("total", v)} />
            <Field label="Grand Total" value={editable.grand_total} onChange={(v) => updateField("grand_total", v)} />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button type="button" onClick={downloadJson} style={{ padding: "8px 14px" }}>Download JSON</button>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Items</h3>
              <button type="button" onClick={addItem} style={{ padding: "6px 10px" }}>Add item</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>Name</th>
                    <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 6 }}>Qty</th>
                    <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 6 }}>Price</th>
                    <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 6 }}>Subtotal</th>
                    <th style={{ borderBottom: "1px solid #ddd" }} />
                  </tr>
                </thead>
                <tbody>
                  {(editable.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 6 }}>
                        <input
                          type="text"
                          value={it.name ?? ""}
                          onChange={(e) => updateItem(idx, "name", e.target.value)}
                          style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        <input
                          type="number"
                          value={it.qty ?? ""}
                          onChange={(e) => updateItem(idx, "qty", e.target.value === "" ? null : Number(e.target.value))}
                          style={{ width: 100, padding: 6, border: "1px solid #ccc", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={it.price ?? ""}
                          onChange={(e) => updateItem(idx, "price", e.target.value === "" ? null : Number(e.target.value))}
                          style={{ width: 120, padding: 6, border: "1px solid #ccc", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={it.subtotal ?? ""}
                          onChange={(e) => updateItem(idx, "subtotal", e.target.value === "" ? null : Number(e.target.value))}
                          style={{ width: 120, padding: 6, border: "1px solid #ccc", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: 6 }}>
                        <button type="button" onClick={() => removeItem(idx)} style={{ padding: "6px 10px" }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <details>
            <summary>Raw OCR payload</summary>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 6 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
          {result?.canonical ? (
            <details style={{ marginTop: 8 }}>
              <summary>Canonical JSON</summary>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 6 }}>
                {JSON.stringify(result.canonical, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
