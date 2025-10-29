@echo off
echo ========================================
echo Force Rebuild with Plugin
echo ========================================
echo.

echo Step 1: Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b %errorlevel%
)
echo.

echo Step 3: Cleaning Android build...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo Step 4: Building APK...
call gradlew assembleDebug --rerun-tasks
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

cd ..

echo Step 5: Uninstalling old app...
adb uninstall io.ionic.avocado
echo.

echo Step 6: Installing new app...
adb install android\app\build\outputs\apk\debug\app-debug.apk
if %errorlevel% neq 0 (
    echo ERROR: Installation failed
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo SUCCESS!
echo.
echo App rebuilt and installed.
echo Now check logcat for TFLiteNative registration.
echo ========================================
pause
