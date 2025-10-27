# Cache Clearing Guide

## Why Charts Still Show Data After Database Deletion

Your application uses a **3-layer caching system** for performance:

```
Database (shopee_analytics) 
    ↓
Backend Cache (JSON files)
    ↓
Frontend Cache (localStorage)
    ↓
Browser Display
```

When you delete data from `shopee_analytics`, the caches still hold the old data.

## Cache Locations

1. **Backend File Cache**
   - Location: `backend/data/analytics/*.json`
   - Files: `sales-2024.json`, `sales-2025.json`, `profit-2024.json`, etc.
   - Status: ✅ **CLEARED** (by running `clear-all-caches.bat`)

2. **Frontend localStorage**
   - Location: Browser localStorage
   - Keys: `sales-analytics:2024`, `sales-analytics:2025`, etc.
   - Status: ⚠️ **NEEDS CLEARING** (see below)

3. **Frontend sessionStorage**
   - Location: Browser sessionStorage
   - Keys: `serverUrl:detected`, etc.
   - Status: ⚠️ **NEEDS CLEARING** (see below)

## How to Clear Frontend Cache

### Method 1: Browser Console (Recommended)

1. Open your app in the browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Paste and run these commands:

```javascript
// Clear all localStorage
localStorage.clear();

// Clear all sessionStorage
sessionStorage.clear();

// Verify
console.log('✅ All caches cleared!');

// Hard reload
location.reload(true);
```

### Method 2: Clear Browser Data

1. Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. Select:
   - ✅ **Cached images and files**
   - ✅ **Cookies and other site data**
3. Click **Clear data**
4. Hard refresh: **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac)

### Method 3: Application Tab (Most Thorough)

1. Open DevTools (**F12**)
2. Go to **Application** tab
3. In the left sidebar:
   - **Local Storage** → Right-click → Clear
   - **Session Storage** → Right-click → Clear
   - **Cache Storage** → Right-click → Delete
4. Hard refresh: **Ctrl+F5**

## Verification

After clearing all caches:

1. Refresh the page (**Ctrl+F5**)
2. The charts should now be empty or show "Import your Shopee data"
3. If data still appears:
   - Check browser console for errors
   - Verify `shopee_analytics` table is actually empty:
     ```sql
     SELECT COUNT(*) FROM shopee_analytics WHERE user_id = 'bf9df707-b8dc-4351-ae67-95c2c5b6e01c';
     ```
   - Try opening in **Incognito/Private** window

## Code Reference

The caching logic is in:

- **Frontend**: `frontend/src/sections/overview/analytics/analytics-sales-analytics.jsx` (lines 50-57)
- **Backend Cache**: `backend/services/analyticsCache.js`
- **Backend API**: `backend/api/analytics/analytics.routes.js` (lines 170-198)
- **Product Forecasting**: `backend/api/analytics/product-forecasting.routes.js` (lines 390-544)

## Future: Disable Caching (Optional)

If you want to disable caching during development, you can:

1. Comment out localStorage caching in `analytics-sales-analytics.jsx`
2. Add a query parameter like `?nocache=1` to bypass cache
3. Or delete cache files before each test

## Quick Commands

```bash
# Clear backend cache
.\clear-all-caches.bat

# Restart backend (to clear memory cache)
npm run dev:backend
```

```javascript
// Clear frontend cache (browser console)
localStorage.clear(); sessionStorage.clear(); location.reload(true);
```

