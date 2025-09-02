const request = require('supertest');
const app = require('../server');

// Helpers
const today = () => new Date().toISOString().slice(0, 10);

describe('Bookkeeping idempotency and dedupe', () => {
  beforeEach(async () => {
    // Reset in-memory store
    await request(app).post('/api/bookkeeping/reset').send({}).expect(200);
  });

  test('POST /journal is idempotent by ref', async () => {
    const date = today();
    const ref = 'R1';
    const lines = [
      { code: '501', description: 'Purchases', debit: 150, credit: 0 },
      { code: '101', description: 'Cash', debit: 0, credit: 150 },
    ];
    const res1 = await request(app).post('/api/bookkeeping/journal').send({ date, ref, particulars: 'Test', lines }).expect(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.entry).toBeTruthy();

    const res2 = await request(app).post('/api/bookkeeping/journal').send({ date, ref, particulars: 'Test again', lines }).expect(200);
    expect(res2.body.success).toBe(true);
    // second post should be flagged duplicate and not create new
    expect(res2.body.data.duplicate).toBe(true);

    const list = await request(app).get('/api/bookkeeping/journal').expect(200);
    expect(list.body.data.journal.length).toBe(1);
  });

  test('POST /journal is idempotent by line signature (ignores description)', async () => {
    const date = today();
    const linesA = [
      { code: '501', description: 'A desc', debit: 150, credit: 0 },
      { code: '101', description: 'B desc', debit: 0, credit: 150 },
    ];
    const linesB = [
      { code: '501', description: 'Different text here', debit: 150, credit: 0 },
      { code: '101', description: 'Another text', debit: 0, credit: 150 },
    ];

    const res1 = await request(app).post('/api/bookkeeping/journal').send({ date, particulars: 'LHS-1', lines: linesA }).expect(200);
    expect(res1.body.success).toBe(true);

    const res2 = await request(app).post('/api/bookkeeping/journal').send({ date, particulars: 'LHS-2', lines: linesB }).expect(200);
    expect(res2.body.success).toBe(true);
    // should be duplicate due to same amounts/codes even if descriptions differ
    expect(res2.body.data.duplicate).toBe(true);

    const list = await request(app).get('/api/bookkeeping/journal').expect(200);
    expect(list.body.data.journal.length).toBe(1);
  });

  test('CRJ auto-posts to Journal only once and skips if Journal already has equivalent lines', async () => {
    const date = today();
    const ref = 'CRJ-REF-1';

    // First, post CRJ entry
    const crj = await request(app).post('/api/bookkeeping/cash-receipts').send({
      date,
      referenceNo: ref,
      customer: 'Test Customer',
      cashDebit: 200,
      netSalesCredit: 200,
      remarks: 'Sale',
    }).expect(200);
    expect(crj.body.success).toBe(true);

    // Then, attempt to post equivalent Journal lines with same ref
    const lines = [
      { code: '101', debit: 200, credit: 0, description: 'Cash received' },
      { code: '401', debit: 0, credit: 200, description: 'Net Sales' },
    ];
    const gj = await request(app).post('/api/bookkeeping/journal').send({ date, ref, particulars: 'Sale again', lines }).expect(200);
    expect(gj.body.success).toBe(true);
    expect(gj.body.data.duplicate).toBe(true);

    // Journal should have exactly one entry from the CRJ auto-post
    const list = await request(app).get('/api/bookkeeping/journal').expect(200);
    expect(list.body.data.journal.length).toBe(1);
  });

  test('CDJ auto-posts to Journal only once and skips if Journal already has equivalent lines', async () => {
    const date = today();
    const ref = 'CDJ-REF-1';

    // Manually post Journal first with a cash disbursement structure
    const j1 = await request(app).post('/api/bookkeeping/journal').send({
      date,
      ref,
      particulars: 'Expense',
      lines: [
        { code: '503', debit: 300, credit: 0, description: 'Rent Expense' },
        { code: '101', debit: 0, credit: 300, description: 'Cash/Bank/eWallet' },
      ],
    }).expect(200);
    expect(j1.body.success).toBe(true);

    // Now post CDJ which would try to auto-post to Journal; should skip due to existing ref/lines
    const cdj = await request(app).post('/api/bookkeeping/cash-disbursements').send({
      date,
      referenceNo: ref,
      payee: 'Landlord',
      cashCredit: 300,
      rentDebit: 300,
      remarks: 'Rent'
    }).expect(200);
    expect(cdj.body.success).toBe(true);

    // Journal must still have only one entry
    const list = await request(app).get('/api/bookkeeping/journal').expect(200);
    expect(list.body.data.journal.length).toBe(1);
  });
});
