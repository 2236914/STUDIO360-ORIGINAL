# n8n Assistant Setup

This project integrates the AI Assistant with an n8n workflow via a webhook. The backend forwards chat messages to your workflow and returns the reply.

## 1) Create an n8n Workflow

Minimal workflow structure:

1. Webhook (POST)
   - Path: `ai-assistant`
   - Respond: `Last node` (JSON)
2. Function (JavaScript)
   - Reads `items[0].json` which contains:
     ```json
     {
       "type": "ai_assistant_message",
       "sessionId": "...",
       "message": "user message",
       "history": [ {"role":"user|assistant","content":"..."} ],
       "context": { "app": "STUDIO360" }
     }
     ```
   - Produce an object like:
     ```js
     return [{ json: { reply: "Hi!" , statsDelta: { processed: 1 } } }];
     ```
3. (Optional) OpenAI / Claude / Custom LLM node to generate the reply based on `message` and `history`.

Return JSON from the last node must at least contain a `reply` string. Optionally include `statsDelta` to live-update KPIs.

## 2) Configure Backend

Copy `backend/env.example` to `backend/.env` and set:

```
N8N_WEBHOOK_URL=https://<your-n8n>/webhook/ai-assistant
# optional auth
N8N_WEBHOOK_HEADER_NAME=X-API-Key
N8N_WEBHOOK_HEADER_VALUE=your-secret
```

Restart the backend. Check health:

- GET http://localhost:3001/api/ai/assistant/health

## 3) Frontend

The AI Bookkeeper page will now send messages to the backend which routes them to n8n.

## Notes

- Session memory is in-memory only. For production, swap to Redis or a DB.
- Timeouts can be tuned via `N8N_GLOBAL_TIMEOUT_MS`.
