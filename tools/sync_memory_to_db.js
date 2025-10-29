#!/usr/bin/env node
// Sync in-memory journal entries (from running server) into DB by posting to the server's /api/bookkeeping/journal endpoint.
// Usage: node tools/sync_memory_to_db.js

(async function main(){
  try {
    const base = process.env.BE_URL || 'http://localhost:3001';
    console.log('Using backend URL:', base);
    const fetchJson = async (url, opts) => {
      const r = await fetch(url, opts);
      const t = await r.text();
      try { return JSON.parse(t); } catch (e) { throw new Error('Invalid JSON from ' + url + ' -> ' + t); }
    };

    console.log('Fetching in-memory journal from /api/bookkeeping/journal');
    const mem = await fetchJson(base + '/api/bookkeeping/journal');
    if (!mem || !mem.data || !Array.isArray(mem.data.journal)) {
      console.error('Unexpected memory journal response', mem);
      process.exit(1);
    }
    const memoryEntries = mem.data.journal;

    console.log('Fetching DB journal from /api/bookkeeping/db/journal');
    const db = await fetchJson(base + '/api/bookkeeping/db/journal');
    const dbRefs = new Set((db?.data?.entries || []).map(e => String(e.ref || '').trim()).filter(Boolean));

    const missing = memoryEntries.filter(e => !(String(e.ref||'').trim() && dbRefs.has(String(e.ref||'').trim())));
    console.log('Memory entries:', memoryEntries.length, 'DB entries:', db?.data?.entries?.length || 0, 'Missing to POST:', missing.length);
    if (!missing.length) return console.log('Nothing to sync.');

    for (const e of missing) {
      console.log('Posting missing entry ref=', e.ref, 'date=', e.date);
      const payload = {
        date: e.date,
        ref: e.ref,
        particulars: e.particulars || '',
        lines: (e.lines || []).map(l => ({ code: l.code, description: l.description || '', debit: Number(l.debit||0), credit: Number(l.credit||0) }))
      };
      try {
        const resp = await fetchJson(base + '/api/bookkeeping/journal', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
        console.log(' -> Response:', resp.message || resp.success, resp.warning ? '(warning: '+String(resp.warning)+')' : '');
      } catch (err) {
        console.error(' -> Failed to POST', e.ref, err && err.message ? err.message : err);
      }
    }
    console.log('Done. After running, re-check /api/bookkeeping/db/journal and /api/bookkeeping/db/ledger/summary');
  } catch (err) {
    console.error('Sync script error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
