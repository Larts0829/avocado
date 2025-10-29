@echo off
echo ================================================
echo    Snapocado - Android Build Script
echo ================================================
echo.

echo [1/5] Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist android\app\build rmdir /s /q android\app\build
echo Done!
echo.

echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/5] Building React application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [4/5] Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [5/5] Opening Android Studio...
call npx cap open android
if errorlevel 1 (
    echo ERROR: Could not open Android Studio!
    pause
    exit /b 1
)
echo.

echo ================================================
echo    Build Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Wait for Android Studio to open
echo 2. Wait for Gradle sync to complete
echo 3. Connect your Android phone via USB
echo 4. Enable USB Debugging on your phone
echo 5. Select your device in Android Studio
echo 6. Click the Run button (green play icon)
echo.
echo Your Snapocado app will install on your phone!
echo ================================================

pause
