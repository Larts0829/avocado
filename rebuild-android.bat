@echo off
echo ========================================
echo Rebuilding Android App
echo ========================================
echo.

cd android

echo Step 1: Cleaning...
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Building APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

cd ..

echo ========================================
echo BUILD SUCCESSFUL!
echo.
echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now:
echo 1. Install the APK on your device
echo 2. Or open Android Studio and click Run
echo ========================================
pause
