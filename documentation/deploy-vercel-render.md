## Deploy to Vercel (Frontend) + Render (Backend) with Custom Domains

This guide sets up the production stack that eliminates local proxy issues and wires your domains:

- Frontend: Next.js on Vercel
- Backend: Express API on Render
- Custom domains: `studio360.dev`, `kitschstudio.page`, optional `api.studio360.dev`

---

### 1) Backend on Render (Web Service)

1. Create a new Web Service in Render, pointing to the `backend/` directory.
2. Build command: `npm install` (or `yarn install`)
3. Start command: `node server.js`
4. Region: pick closest to your users.
5. Health check path: `/api/health`.
6. Add environment variables:

```
NODE_ENV=production
# Add all production frontend origins (Vercel preview + final domains)
CORS_ORIGINS=https://studio360.dev,https://www.studio360.dev,https://kitschstudio.page,https://www.kitschstudio.page,https://<your-vercel-project>.vercel.app

# Database and third‑party secrets as required by your app...
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...
```

Notes:
- Render automatically sets `PORT`. The server reads `process.env.PORT || 3001`, so no change needed.
- Free tier sleeps when idle; first request after sleep can be slow. This is not an error.

Optional: attach `api.studio360.dev` to the Render service (Settings → Custom Domains). Render will provide a CNAME target; create the DNS record as described in section 3.

Verify backend:
- Open `https://<render-service>.onrender.com/api/health` and ensure it returns OK.

---

### 2) Frontend on Vercel (Next.js)

1. Import the repository in Vercel and set the project root to `frontend/`.
2. Build settings: defaults are fine for Next.js.
3. Environment variables (Project → Settings → Environment Variables):

```
# Point to your backend (use your Render custom domain if set, else the .onrender.com URL)
NEXT_PUBLIC_SERVER_URL=https://api.studio360.dev
INTERNAL_API_URL=https://api.studio360.dev

# Optional/leave empty unless you intentionally use basePath
NEXT_PUBLIC_BASE_PATH=
```

Why both? The app uses `INTERNAL_API_URL` for Next rewrites and `NEXT_PUBLIC_SERVER_URL` for client config. Having both set avoids accidental localhost defaults.

Deploy the project. After the first deployment, Vercel will provide a preview URL like `https://<project>-<hash>.vercel.app`.

Quick production test before DNS:
- Visit `https://<preview>.vercel.app/` and ensure the dashboard loads.
- The connectivity test in the app should succeed.

---

### 3) DNS for your domains

You own: `studio360.dev` and `kitschstudio.page`.

Recommended routing:
- `studio360.dev` (apex) → Vercel (frontend)
- `www.studio360.dev` → Vercel (frontend)
- `kitschstudio.page` (apex) → Vercel (frontend)
- `www.kitschstudio.page` → Vercel (frontend)
- `api.studio360.dev` → Render (backend) [optional but recommended]

Steps:
1. In Vercel → Project → Settings → Domains, add both domains `studio360.dev` and `kitschstudio.page`.
2. Choose either:
   - Use Vercel DNS (simplest): point your registrar nameservers to Vercel and accept the auto‑created records; or
   - Keep your registrar DNS: Vercel will show the exact records to create (usually an A/ALIAS/ANAME for apex and CNAME for `www`). Create those records at your registrar.
3. For the backend domain `api.studio360.dev` (optional): in Render → Service → Custom Domains, add `api.studio360.dev`. Render will show a CNAME target like `your-service.onrender.com`. Create a CNAME record for `api` pointing to that target in your DNS provider.

Propagation usually takes a few minutes (up to 24 hours in rare cases).

---

### 4) Final environment variable alignment

After DNS is live, switch Vercel envs to the pretty backend domain (if you used it):

```
NEXT_PUBLIC_SERVER_URL=https://api.studio360.dev
INTERNAL_API_URL=https://api.studio360.dev
```

On Render, keep `CORS_ORIGINS` updated with all live frontend origins:

```
CORS_ORIGINS=https://studio360.dev,https://www.studio360.dev,https://kitschstudio.page,https://www.kitschstudio.page,https://<your-vercel-project>.vercel.app
```

Redeploy both services after changing env vars.

---

### 5) Verification checklist

- Backend health: `https://api.studio360.dev/api/health` (or the Render URL) returns OK.
- Frontend status: app loads without `ECONNRESET/ECONNREFUSED` in the browser console/network tab.
- CORS: no `CORS` errors in browser devtools when calling `/api/...` endpoints.
- Supabase/db endpoints return data as expected.

---

### 6) Troubleshooting

- ECONNREFUSED/ECONNRESET only from frontend:
  - Confirm `INTERNAL_API_URL` and `NEXT_PUBLIC_SERVER_URL` point to your Render/`api.*` domain (not localhost).
  - Ensure `next.config.mjs` rewrite picks up `INTERNAL_API_URL` (it does in this repo).
  - Check Render logs for cold‑start or rate limits (free tier delays are normal on first hit).

- CORS errors:
  - Add your Vercel preview URL and both `www` and apex domains to `CORS_ORIGINS` in Render.
  - Redeploy backend after changes.

- SSL/redirect loops:
  - Remove any hardcoded `http://` URLs in envs; always use `https://` in production.

- Slow first request after idle:
  - Optional: set a Render Cron Job to hit `/api/health` every 5 minutes.

---

### 7) Copy‑paste env matrices

Backend (Render):
```
NODE_ENV=production
CORS_ORIGINS=https://studio360.dev,https://www.studio360.dev,https://kitschstudio.page,https://www.kitschstudio.page,https://<your-vercel-project>.vercel.app
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...
```

Frontend (Vercel):
```
NEXT_PUBLIC_SERVER_URL=https://api.studio360.dev
INTERNAL_API_URL=https://api.studio360.dev
NEXT_PUBLIC_BASE_PATH=
```

You can keep the app running locally with production backend by setting the same envs in `.env.local` during testing.


