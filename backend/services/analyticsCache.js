const fs = require('fs');
const path = require('path');

// Resolve to backend/data/analytics regardless of current working directory
const cacheDir = path.join(__dirname, '..', 'data', 'analytics');

function ensureDirSync() {
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (_) {}
}

function filePathForYear(year) {
  return path.join(cacheDir, `sales-${year}.json`);
}

function defaultFilePath() {
  return path.join(cacheDir, 'sales-default.json');
}

function filePathForProfitYear(year) {
  return path.join(cacheDir, `profit-${year}.json`);
}

function readJSON(p) {
  try {
    if (!fs.existsSync(p)) return null;
    const txt = fs.readFileSync(p, 'utf-8');
    return JSON.parse(txt);
  } catch (_) { return null; }
}

function writeAtomic(p, dataObj) {
  try {
    ensureDirSync();
    const tmp = `${p}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(dataObj, null, 2));
    fs.renameSync(tmp, p);
    return true;
  } catch (_) { return false; }
}

function writeSales(year, payload) {
  const p = filePathForYear(year);
  const data = { ...payload, savedAt: new Date().toISOString() };
  return writeAtomic(p, data);
}

function readSales(year) {
  const p = filePathForYear(year);
  return readJSON(p);
}

function readDefault() {
  return readJSON(defaultFilePath());
}

function writeDefault(payload) {
  const p = defaultFilePath();
  return writeAtomic(p, payload);
}

module.exports = {
  writeSales,
  readSales,
  readDefault,
  writeDefault,
  ensureDirSync,
  // profit helpers
  writeProfit(year, payload) {
    const p = filePathForProfitYear(year);
    const data = { ...payload, savedAt: new Date().toISOString() };
    return writeAtomic(p, data);
  },
  readProfit(year) {
    const p = filePathForProfitYear(year);
    return readJSON(p);
  },
};
