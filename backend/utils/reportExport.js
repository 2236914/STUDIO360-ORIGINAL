const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

function toCSV(rows = [], headers = []) {
  const lines = [];
  if (headers.length) lines.push(headers.join(','));
  for (const r of rows) {
    const vals = headers.map((h) => {
      const v = r[h];
      const s = v == null ? '' : String(v);
      return s.replace(/,/g, ' ');
    });
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

function toXLSX(sheets) {
  // sheets: [{ name, rows, headers }]
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const data = s.headers ? [s.headers, ...s.rows.map((r) => s.headers.map((h) => r[h]))] : s.rows;
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, s.name || 'Sheet1');
  }
  // return Buffer
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function toPDFStream({ title = 'Report', sections = [] } = {}) {
  // sections: [{ heading, table: { headers, rows } }]
  const doc = new PDFDocument({ margin: 36, size: 'A4' });
  doc.fontSize(16).text(title, { align: 'center' });
  doc.moveDown();
  for (const sec of sections) {
    if (sec.heading) {
      doc.fontSize(13).text(sec.heading, { underline: true });
    }
    if (sec.table) {
      const { headers = [], rows = [] } = sec.table;
      doc.moveDown(0.5);
      // header
      doc.fontSize(10).text(headers.join('  |  '));
      doc.moveDown(0.25);
      doc.text('-'.repeat(80));
      for (const r of rows) {
        const vals = headers.map((h) => r[h] == null ? '' : String(r[h]));
        doc.text(vals.join('  |  '));
      }
    }
    doc.moveDown();
  }
  return doc;
}

module.exports = { toCSV, toXLSX, toPDFStream };


