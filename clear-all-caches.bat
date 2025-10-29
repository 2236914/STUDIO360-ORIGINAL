@echo off
echo ========================================
echo Clearing All Analytics Caches
echo ========================================
echo.

REM Clear backend cache files
echo [1/3] Clearing backend cache files...
if exist "backend\data\analytics\sales-*.json" (
    del /Q "backend\data\analytics\sales-*.json"
    echo       - Deleted sales cache files
) else (
    echo       - No sales cache files found
)

if exist "backend\data\analytics\profit-*.json" (
    del /Q "backend\data\analytics\profit-*.json"
    echo       - Deleted profit cache files
) else (
    echo       - No profit cache files found
)

if exist "backend\data\analytics\sales-default.json" (
    del /Q "backend\data\analytics\sales-default.json"
    echo       - Deleted default sales cache
) else (
    echo       - No default sales cache found
)

echo.
echo [2/3] Backend cache cleared successfully!
echo.
echo [3/3] Next steps to clear frontend cache:
echo ========================================
echo 1. Open your browser (where the app is running)
echo 2. Press F12 to open DevTools
echo 3. Go to Console tab
echo 4. Paste and run these commands:
echo.
echo    localStorage.clear();
echo    sessionStorage.clear();
echo    console.log('Frontend caches cleared!');
echo    location.reload(true);
echo.
echo OR alternatively:
echo - Press Ctrl+Shift+Delete
echo - Select "Cached images and files" and "Cookies and other site data"
echo - Click "Clear data"
echo - Refresh page with Ctrl+F5
echo.
echo ========================================
echo Backend cache cleared! Now clear frontend cache using the steps above.
echo ========================================
pause

