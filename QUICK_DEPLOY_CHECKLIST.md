# ✅ QUICK DEPLOYMENT CHECKLIST

Print this page and check off each step as you complete it!

---

## 🔵 VERCEL (Frontend) - 6 Steps

- [ ] **Step 1:** Go to vercel.com → Click "Log in" → Click "Continue with GitHub"
- [ ] **Step 2:** Click "Add New..." → Click "Project"
- [ ] **Step 3:** Find your repo → Click "Import"
- [ ] **Step 4:** Set Root Directory to `frontend` → Click "Edit" → Type `frontend` → Click "Continue"
- [ ] **Step 5:** Add env vars → Click "Add" → Add `NEXT_PUBLIC_SERVER_URL` and `INTERNAL_API_URL` (use placeholder URL for now)
- [ ] **Step 6:** Click "Deploy" button → Wait → Copy your Vercel URL (save it!)

**Your Vercel URL:** `https://_____________________.vercel.app`

---

## 🟠 RENDER (Backend) - 8 Steps

- [ ] **Step 1:** Go to render.com → Click "Get Started" → Click "Continue with GitHub"
- [ ] **Step 2:** Click "New +" → Click "Web Service"
- [ ] **Step 3:** Connect your repo → Click "Connect account" → Select repo → Click "Connect"
- [ ] **Step 4:** Fill form:
  - Name: `studio360-backend`
  - Region: Choose closest
  - Root Directory: `backend` (click "Edit" to change)
  - Build Command: `npm install`
  - Start Command: `node server.js`
- [ ] **Step 5:** Add env vars → Click "Add Environment Variable":
  - `NODE_ENV` = `production`
  - `CORS_ORIGINS` = `https://YOUR-VERCEL-URL.vercel.app` (paste your Vercel URL from above!)
- [ ] **Step 6:** Health Check Path: `/api/health` (optional)
- [ ] **Step 7:** Click "Create Web Service" → Wait → Copy your Render URL (save it!)
- [ ] **Step 8:** Test backend → Open `https://YOUR-RENDER-URL.onrender.com/api/health` in browser

**Your Render URL:** `https://_____________________.onrender.com`

---

## 🔄 CONNECT THEM - 3 Steps

- [ ] **Step 1:** Go back to Vercel → Your Project → "Settings" tab → "Environment Variables"
- [ ] **Step 2:** Edit `NEXT_PUBLIC_SERVER_URL` → Change to your Render URL → Click "Save"
- [ ] **Step 3:** Edit `INTERNAL_API_URL` → Change to your Render URL → Click "Save"
- [ ] **Step 4:** Go to "Deployments" tab → Click "⋯" menu → Click "Redeploy"

---

## ✅ FINAL TEST - 3 Checks

- [ ] Frontend loads: Open your Vercel URL → App should load
- [ ] Backend works: Open your Render URL/api/health → Should see success
- [ ] Connection works: Use your app → No errors in browser console (F12)

---

## 🆘 IF SOMETHING BREAKS

**Frontend Issues:**
- Check Root Directory = `frontend` ✅
- Check build logs in Vercel
- Verify env vars are set

**Backend Issues:**
- Check Root Directory = `backend` ✅
- Check Start Command = `node server.js` ✅
- Check Render logs tab
- Verify all env vars are added

**Connection Issues:**
- Make sure CORS_ORIGINS includes your Vercel URL
- Make sure NEXT_PUBLIC_SERVER_URL points to Render URL
- Redeploy both after changing env vars

---

**💡 TIP:** Both services auto-deploy when you push to GitHub! Just push your code and they'll update automatically.

