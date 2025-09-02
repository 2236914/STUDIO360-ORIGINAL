/**
 * Thin OCR Adapter
 * Orchestrates: backend Python OCR (Paddle for tables & grand total currency) + local Tesseract.js for general text
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const OCRService = require('./ocr-service');

class OCRAdapter {
  /**
   * @param {Object} opts
   * @param {string} [opts.backendBaseUrl] - e.g., http://localhost:3001
   * @param {number} [opts.timeoutMs] - upload timeout
   */
  constructor(opts = {}) {
    this.backend = (opts.backendBaseUrl || process.env.BACKEND_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
    this.timeoutMs = Number(opts.timeoutMs || process.env.OCR_ADAPTER_TIMEOUT_MS || 60000);
    this.ocr = new OCRService();
  }

  /**
   * Recognize text and structured data using both engines.
   * - Tables & grand total currency: backend /api/ai/upload (Paddle-first)
   * - General text: local Tesseract.js
   * Returns unified shape.
   *
   * @param {Buffer|string} fileOrBuffer
   * @param {Object} [options]
   */
  async recognize(fileOrBuffer, options = {}) {
    // Prepare a temp file for upload (backend expects multipart form-data)
    const tmpPath = await this._toTempFile(fileOrBuffer);

    // Fire both in parallel
    const [pyRes, tessRes] = await Promise.allSettled([
      this._callBackendUpload(tmpPath),
      this._callTesseract(fileOrBuffer, options)
    ]);

    // Clean temp file
    try { fs.unlinkSync(tmpPath); } catch (_) {}

    const py = pyRes.status === 'fulfilled' ? pyRes.value : null;
    const te = tessRes.status === 'fulfilled' ? tessRes.value : null;

    // Compose unified result
    const items = (py?.canonical?.order_details?.length ? py.canonical.order_details.map(it => ({
      no: it.no ?? null,
      product: it.product ?? null,
      variation: it.variation ?? null,
      productPrice: it.product_price ?? null,
      qty: it.qty ?? null,
      subtotal: it.subtotal ?? null,
    })) : (py?.structured?.items || []));

    const currency = py?.canonical?.fields?.currency || py?.structured?.currency || null;
    const grandTotal = (py?.canonical?.amounts?.grandTotal ?? py?.structured?.grandTotal ?? py?.structured?.total) ?? null;

    return {
      success: Boolean(py && py.success !== false) || Boolean(te && te.success),
      text: te?.text || py?.text || '',
      currency,
      grandTotal,
      items,
      structured: py?.structured || null,
      canonical: py?.canonical || null,
      warnings: py?.warnings || [],
      diagnostics: py?.diagnostics || null,
      tesseract: te || null,
      backend: py || null,
    };
  }

  async _callBackendUpload(tmpPath) {
    const url = `${this.backend}/api/ai/upload`;
    const form = new FormData();
    form.append('file', fs.createReadStream(tmpPath), path.basename(tmpPath));
    const resp = await axios.post(url, form, {
      timeout: this.timeoutMs,
      headers: form.getHeaders()
    });
    if (!resp?.data?.success) return null;
    return resp.data.data;
  }

  async _callTesseract(fileOrBuffer, options) {
    try {
      if (Buffer.isBuffer(fileOrBuffer)) {
        return await this.ocr.extractText(fileOrBuffer, options);
      }
      if (typeof fileOrBuffer === 'string') {
        const buf = fs.readFileSync(fileOrBuffer);
        return await this.ocr.extractText(buf, options);
      }
      return { success: false, text: '', error: 'unsupported_input' };
    } catch (e) {
      return { success: false, text: '', error: String(e?.message || e) };
    }
  }

  async _toTempFile(fileOrBuffer) {
    const dir = path.join(process.cwd(), 'tmp');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
    const name = `ocr-${Date.now()}-${Math.round(Math.random()*1e9)}`;
    const filePath = path.join(dir, name);
    if (Buffer.isBuffer(fileOrBuffer)) {
      fs.writeFileSync(filePath, fileOrBuffer);
      return filePath;
    }
    if (typeof fileOrBuffer === 'string') {
      // Copy to tmp to ensure streamable path
      fs.copyFileSync(fileOrBuffer, filePath);
      return filePath;
    }
    throw new Error('Unsupported input type');
  }
}

module.exports = OCRAdapter;
