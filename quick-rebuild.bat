@echo off
echo ===============================================
echo    Snapocado - Quick Rebuild Script
echo ===============================================
echo.

echo [1/3] Building web assets...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Syncing Capacitor with Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Opening Android Studio...
call npx cap open android
echo.

echo ===============================================
echo    Quick rebuild completed successfully!
echo    Build your APK in Android Studio.
echo ===============================================
echo.
pause
