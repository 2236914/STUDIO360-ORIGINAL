## ✨ STUDIO360 — AI-Powered Bookkeeping Platform

All-in-one bookkeeping with AI categorization, OCR receipt processing, forecasting, invoices, inventory, payments, and analytics.

---

## 🚀 Features

- **AI Bookkeeper**: OCR for receipts/invoices, auto-categorization, review + corrections
- **Book of Accounts**: General Journal, General Ledger, Cash Receipts/Disbursements
- **Invoices & Orders**: CRUD, status tracking, exports
- **Analytics & Forecasting**: Financial and product forecasts (Prophet optional)
- **Payments**: Xendit support (QRPH, GCash, Cards)
- **Media & Uploads**: Cloudinary integration for product images
- **Assistant**: Chatbot API for help and automations

---

## 🏗️ Architecture

```
STUDIO360/
├── frontend/         # Next.js app (dashboard & storefront)
├── backend/          # Node/Express API + analytics services
├── ai/               # OCR, categorization, ML helpers
├── database/         # SQL migrations, schemas, data
├── docs/             # Additional guides
└── tools/            # Scripts & utilities
```

- **Primary DB**: PostgreSQL (via provided SQL in `database/` and backend analytics)  
- **Optional**: MongoDB for some backend modules (see `backend/README.md`)  
- **Optional**: Python 3.9+ for Prophet forecasting path  

---

## 🖥️ System Requirements

- **OS**: Windows 10/11, macOS 12+, or Linux
- **Node.js**: 18.x or 20.x (recommended 20.x)
- **Package Manager**: npm 9+/yarn 1.22+
- **Database**: PostgreSQL 14+ (Supabase compatible)
- **Python (optional)**: 3.9+ for Prophet forecasts
- **Git**: Latest

Verify:
```bash
node -v
npm -v
python --version    # optional
psql --version      # if using local Postgres
```

---

## ⚙️ Environment Variables (Quick Reference)

Create environment files based on examples under each package.

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3001

# Choose one database strategy
DATABASE_URL=postgres://user:pass@host:5432/studio360   # PostgreSQL (recommended)
MONGODB_URI=mongodb://localhost:27017/studio360         # Optional Mongo

JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# AI Assistant (LLM)
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4o-mini
LLM_PROVIDER=openai

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Xendit Payments
XENDIT_SECRET_KEY=your-xendit-secret
XENDIT_WEBHOOK_TOKEN=your-webhook-token
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=STUDIO360
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Python (optional, forecasting)
```bash
pip install prophet pandas
```

---

## 📦 Installation

### 1) Backend API
```bash
cd backend
npm install
npm run dev           # http://localhost:3001
# npm start           # production
```
Health checks: `GET /api/health`, LLM assistant: `GET /api/assistant/health`

Run with Docker (from repo root):
```bash
docker compose up -d --build
```

### 2) Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

### 3) AI Services
Located in `ai/` for OCR and categorization helpers.
```bash
cd ai
npm install
# Optional scripts (see ai/README.md)
```

### 4) Database Setup (PostgreSQL)
Use the SQL under `database/migrations/` and supplied setup scripts:
```bash
# Example using psql
psql "$DATABASE_URL" -f run-financial-forecasting-sql.sql
psql "$DATABASE_URL" -f run-product-forecasting-sql-fixed.sql

# or run individual migrations in database/migrations/
```

Optional guides:
- Financial forecasting: `FINANCIAL_FORECASTING_SETUP.md`
- Product forecasting: `PRODUCT_FORECASTING_SETUP.md`
- Historical import: `HISTORICAL_DATA_IMPORT_GUIDE.md`

---

## 🔌 Key APIs

- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`
- AI Bookkeeper: `POST /api/ai/upload`, `POST /api/ai/categorize`, `GET /api/ai/logs`
- Assistant: `POST /api/assistant/message`, `GET /api/assistant/health`
- Bookkeeping: `GET /api/bookkeeping/journal`, `GET /api/bookkeeping/ledger`
- Analytics: financial + product forecasting endpoints
- Payments (Xendit): see `XENDIT_INTEGRATION_GUIDE.md`

---

## 🧪 Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

---

## 🐳 Docker

Quick start from repo root:
```bash
docker compose up -d --build
```
Services:
- Backend: `http://localhost:3001/api/health`
- Frontend: `http://localhost:3000`

Backend in Docker reads `backend/.env.docker` if present.

---

## 💳 Payments (Xendit)

Follow `XENDIT_INTEGRATION_GUIDE.md` for environment variables, endpoints, and webhook setup.  
Frontend uses dialogs/services under `frontend/src/components/payment` and `frontend/src/services`.

---

## 🖼️ Media (Cloudinary)

See `CLOUDINARY_SETUP.md` to configure credentials and verify uploads from inventory/product flows.

---

## 🧰 Useful Commands

```bash
# Frontend
cd frontend && npm run dev
cd frontend && npm run build

# Backend
cd backend && npm run dev
cd backend && npm start

# Docker
docker compose up -d --build
docker compose down
```

---

## 🛟 Troubleshooting

- Port in use: change ports in `.env` or stop conflicting process
- CORS errors: ensure `CORS_ORIGIN` matches frontend URL
- DB connection: verify `DATABASE_URL` and that migrations ran
- OCR slow/accuracy: ensure clear images; optionally scale resources
- Forecasting disabled: install Python + Prophet or rely on backend fallback
- 401/403: check `JWT_SECRET` and login flow

---

## 📚 More Docs

- `backend/README.md` — API details, health/metrics
- `frontend/README.md` — app setup notes
- `docs/` — API, development, deployment guides
- `database/README.md` — schemas and migrations
- `ai/README.md` — OCR and categorization services

---

## 🤝 Contributing

1) Create a feature branch  
2) Commit with clear messages  
3) Open a PR with screenshots/notes  

---

Made with ❤️ for smarter bookkeeping.
