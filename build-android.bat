@echo off
echo ========================================
echo Avocado Detection App - Android Build
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b %errorlevel%
)
echo.

echo Step 3: Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b %errorlevel%
)
echo.

echo Step 4: Opening Android Studio...
call npx cap open android
echo.

echo ========================================
echo Build process complete!
echo.
echo Next steps:
echo 1. Wait for Android Studio to open
echo 2. Wait for Gradle sync to complete
echo 3. Connect your Android device or start emulator
echo 4. Click Run button (green play icon)
echo ========================================
pause
