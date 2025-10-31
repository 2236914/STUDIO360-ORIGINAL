# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE
## Vercel (Frontend) + Render (Backend) Using GitHub

---

## 📋 BEFORE YOU START

✅ **Make sure:**
1. Your code is pushed to GitHub (all changes committed and pushed)
2. You have accounts on:
   - [Vercel.com](https://vercel.com) (Sign up with GitHub)
   - [Render.com](https://render.com) (Sign up with GitHub)
3. You have your environment variables ready (database URLs, API keys, etc.)

---

## 🔵 PART 1: DEPLOY FRONTEND TO VERCEL

### Step 1: Go to Vercel Dashboard
1. Open your browser
2. Go to **https://vercel.com**
3. Click **"Log in"** button (top right)
4. Click **"Continue with GitHub"** button
5. Authorize Vercel to access your GitHub account

### Step 2: Add New Project
1. Once logged in, you'll see the Vercel dashboard
2. Click the **"Add New..."** button (top right)
3. From the dropdown, click **"Project"**

### Step 3: Import Your Repository
1. You'll see a list of your GitHub repositories
2. **Find and click** on your repository name (e.g., "STUDIO360-ORIGINAL")
3. If you don't see it, click **"Configure GitHub App"** and grant access to the repo
4. Once you see your repo, click the **"Import"** button next to it

### Step 4: Configure Project Settings
You'll now see the "Import Project" page. Configure these settings:

**Project Name:**
- Keep the default or change it to something like "studio360-frontend"

**Framework Preset:**
- This should auto-detect **"Next.js"** - if not, select it from the dropdown

**Root Directory:**
- Click the **"Edit"** button next to Root Directory
- Change it from `/` to **`frontend`**
- Click **"Continue"**

**Build and Output Settings:**
- Build Command: Should show `next build` (leave as is)
- Output Directory: Should show `.next` (leave as is)
- Install Command: Should show `npm install` (leave as is)

**Environment Variables:**
- Click **"Add"** button
- Add these one by one:
  - **Name:** `NEXT_PUBLIC_SERVER_URL`
    **Value:** `https://your-backend-service.onrender.com` (you'll update this after backend is deployed)
  - **Name:** `INTERNAL_API_URL`
    **Value:** `https://your-backend-service.onrender.com` (same as above)
  - Add any other environment variables your frontend needs
- Click **"Add"** for each variable

### Step 5: Deploy
1. Scroll down to the bottom
2. Click the **"Deploy"** button (big blue button)
3. Wait for the build to complete (this takes 2-5 minutes)
4. You'll see build logs in real-time

### Step 6: Get Your Frontend URL
1. Once deployment is complete, you'll see a success message
2. Click the **"Visit"** button or copy the URL shown (looks like `your-project-xyz123.vercel.app`)
3. **Save this URL** - you'll need it for the backend CORS configuration

---

## 🟠 PART 2: DEPLOY BACKEND TO RENDER

### Step 1: Go to Render Dashboard
1. Open your browser (or a new tab)
2. Go to **https://render.com**
3. Click **"Get Started"** or **"Log In"** (top right)
4. Click **"Continue with GitHub"** button
5. Authorize Render to access your GitHub account

### Step 2: Create New Web Service
1. Once logged in, you'll see the Render dashboard
2. Click the **"New +"** button (top right, blue button)
3. From the dropdown menu, click **"Web Service"**

### Step 3: Connect Repository
1. You'll see "Create a new Web Service" page
2. Under "Connect a repository", click **"Connect account"** if not connected
3. Select your GitHub account
4. Find and click on your repository name (e.g., "STUDIO360-ORIGINAL")
5. Click **"Connect"** button

### Step 4: Configure Service Settings
Fill out the form:

**Name:**
- Enter: `studio360-backend` (or any name you prefer)

**Region:**
- Select the region closest to your users (e.g., "Singapore" for Asia, "US East" for US)

**Branch:**
- Should show `main` (or `master`) - leave as is

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Change it from `/` to **`backend`**
- Click **"Save"**

**Runtime:**
- Select **"Node"** from the dropdown

**Build Command:**
- Enter: `npm install`

**Start Command:**
- Enter: `node server.js`

**Instance Type:**
- Select **"Free"** (or upgrade to "Starter" if you need better performance)

### Step 5: Add Environment Variables
1. Scroll down to the "Environment Variables" section
2. Click **"Add Environment Variable"** button
3. Add these variables one by one:

   **Variable 1:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Key: `CORS_ORIGINS`
   - Value: `https://your-frontend-project.vercel.app,https://studio360.dev,https://www.studio360.dev`
     (Replace `your-frontend-project` with your actual Vercel URL from Step 1)
   - Click **"Add"**

   **Variable 3+ (Add all your other backend environment variables):**
   - Database URL, API keys, secrets, etc.
   - Click **"Add"** for each one

### Step 6: Advanced Settings (Optional)
1. Scroll down to "Advanced" section
2. Click to expand it
3. **Health Check Path:** Enter `/api/health` (if your backend has a health endpoint)
4. **Auto-Deploy:** Make sure it's set to **"Yes"** (deploys on every git push)

### Step 7: Deploy Backend
1. Scroll all the way down
2. Click the **"Create Web Service"** button (big blue button at bottom)
3. Render will start building your backend (this takes 3-5 minutes)
4. You'll see build logs in real-time

### Step 8: Get Your Backend URL
1. Once deployment is complete, you'll see your service dashboard
2. At the top, you'll see your service URL (looks like `your-service-name.onrender.com`)
3. **Copy this URL** - it's your backend API URL
4. Test it: Open `https://your-service-name.onrender.com/api/health` in a browser to verify it works

---

## 🔄 PART 3: CONNECT FRONTEND TO BACKEND

### Update Frontend Environment Variables on Vercel

1. Go back to **Vercel Dashboard** (https://vercel.com)
2. Click on your project name
3. Click **"Settings"** tab (in the top navigation)
4. Click **"Environment Variables"** (in the left sidebar)
5. Find these variables and click **"Edit"** on each:
   - `NEXT_PUBLIC_SERVER_URL` - Change value to your Render backend URL: `https://your-service-name.onrender.com`
   - `INTERNAL_API_URL` - Change value to same: `https://your-service-name.onrender.com`
6. Click **"Save"** for each variable
7. Go back to **"Deployments"** tab
8. Click the **"⋯"** (three dots) menu on the latest deployment
9. Click **"Redeploy"**
10. Confirm by clicking **"Redeploy"** in the popup

### Update Backend CORS on Render

1. Go back to **Render Dashboard** (https://render.com)
2. Click on your web service name
3. Click **"Environment"** tab (top navigation)
4. Find `CORS_ORIGINS` variable
5. Click the **"Edit"** icon (pencil icon)
6. Update the value to include your Vercel URL:
   ```
   https://your-frontend-project.vercel.app,https://studio360.dev,https://www.studio360.dev
   ```
7. Click **"Save Changes"**
8. The service will automatically redeploy with the new environment variable

---

## ✅ VERIFICATION CHECKLIST

### Test Frontend:
- [ ] Open your Vercel URL in browser: `https://your-project.vercel.app`
- [ ] Check browser console (F12) - no CORS errors
- [ ] Verify the app loads and connects to backend

### Test Backend:
- [ ] Open your Render URL: `https://your-service.onrender.com/api/health`
- [ ] Should see a success response
- [ ] Check Render logs for any errors

### Test Connection:
- [ ] Frontend makes API calls successfully
- [ ] No `ECONNREFUSED` or `ECONNRESET` errors
- [ ] Data loads correctly in your app

---

## 🔧 TROUBLESHOOTING

### Problem: Frontend can't connect to backend
**Solution:**
1. Verify `NEXT_PUBLIC_SERVER_URL` in Vercel matches your Render URL exactly
2. Check Render service is running (not sleeping)
3. Verify CORS_ORIGINS in Render includes your Vercel URL

### Problem: Build fails on Vercel
**Solution:**
1. Check Root Directory is set to `frontend`
2. Verify `package.json` exists in `frontend/` folder
3. Check build logs for specific error messages

### Problem: Build fails on Render
**Solution:**
1. Check Root Directory is set to `backend`
2. Verify `server.js` exists in `backend/` folder
3. Check all environment variables are set correctly
4. Review build logs for error messages

### Problem: Backend goes to sleep (free tier)
**Solution:**
- First request after idle time takes 30-60 seconds - this is normal
- Consider upgrading to paid plan for always-on service
- Or set up a cron job to ping your service every 5 minutes

---

## 📝 QUICK REFERENCE

### Frontend (Vercel):
- **Dashboard:** https://vercel.com/dashboard
- **Project Settings:** Settings → General
- **Environment Variables:** Settings → Environment Variables
- **Deployments:** Deployments tab

### Backend (Render):
- **Dashboard:** https://dashboard.render.com
- **Service Settings:** Click service → Settings tab
- **Environment Variables:** Click service → Environment tab
- **Logs:** Click service → Logs tab

---

## 🎉 YOU'RE DONE!

Your app should now be live:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-service.onrender.com`

Both services will auto-deploy when you push to GitHub!

---

**Need help?** Check the logs in both Vercel and Render dashboards for detailed error messages.

