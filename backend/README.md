# STUDIO360 Backend API

This directory contains the backend API services for the STUDIO360 bookkeeping system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── api/              # API routes and controllers
├── config/           # Configuration files
├── middleware/       # Custom middleware
├── services/         # Business logic services
├── utils/            # Utility functions
├── logs/             # Application logs
├── uploads/          # File uploads
├── tests/            # Test files
└── server.js         # Main server file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### AI Bookkeeper (OCR & utilities)
- `POST /api/ai/upload` - Upload files for OCR
- `POST /api/ai/categorize` - Categorize transactions
- `GET /api/ai/categories` - Get categories
- `GET /api/ai/logs` - Get processing logs

### Assistant (chatbot-only, decoupled from OCR)
- `POST /api/assistant/message` - Send a chat message `{ message, sessionId? }`
- `GET /api/assistant/health` - Check LLM configuration
	- Backward-compat: `/api/ai/assistant/*` is still available; prefer `/api/assistant/*` moving forward.

LLM Configuration:

- Set in `backend/.env`:
	- `LLM_API_KEY=your-api-key` (OpenAI, OpenRouter, Groq, etc.)
	- `LLM_MODEL=gpt-4o-mini` (optional, defaults to gpt-4o-mini)
	- `LLM_PROVIDER=openai` (optional, defaults to openai)
- Restart backend. Health will show configured: true, and replies will be LLM-powered with local fallback.

### Invoice Management
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Bookkeeping
- `GET /api/bookkeeping/journal` - Get journal
- `GET /api/bookkeeping/ledger` - Get ledger
- `POST /api/bookkeeping/transactions` - Add transaction
- `GET /api/bookkeeping/reports` - Get reports

Note: The General Ledger is a database view. `public.general_ledger` forwards to `public.v_ledger_presented` and is read-only. All writes go to `general_journal`.

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Winston** - Logging

## 📋 Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/studio360
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **Logs**: Check `logs/` directory

---

**Backend Version**: 1.0.0  
**Last Updated**: December 2024 

## 🐳 Docker Quick Start

From the repo root:

1) Build and start services:

```
docker compose up -d --build
```

2) Services:
- Backend: http://localhost:3001/api/health

3) Backend inside Docker uses `backend/.env.docker` for configuration.

4) Configure LLM API key in `backend/.env.docker` for AI assistant functionality:
	- `LLM_API_KEY=your-api-key`
	- `LLM_MODEL=gpt-4o-mini` (optional)
	- `LLM_PROVIDER=openai` (optional)

5) The frontend chat can call `/api/assistant/message` (chatbot-only) or `/api/ai/assistant/message` (legacy path). The backend uses LLM with local fallback.
