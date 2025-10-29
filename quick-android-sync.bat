@echo off
echo ================================================
echo    Quick Android Sync (No Clean Build)
echo ================================================
echo.

echo [1/3] Building React application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/3] Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/3] Opening Android Studio...
call npx cap open android
echo.

echo ================================================
echo    Quick Sync Complete!
echo ================================================
echo.
echo Android Studio is opening...
echo Run the app from Android Studio to see changes.
echo.

pause
