@echo off
echo =====================================
echo 🥑 Snapocado App - Fresh Install Script
echo =====================================

REM Change directory to project root
cd /d "%~dp0"

REM 1. Build the Ionic app
echo 🏗️ Building Ionic app...
call npm run build

REM 2. Sync with Capacitor Android project
echo 🔗 Syncing Capacitor files...
call npx cap sync android

REM 3. Go to Android folder
cd android

REM 4. Get your app package name (change this if needed)
set APP_ID=io.ionic.starter

REM 5. Uninstall old app from connected Android device
echo 🧹 Uninstalling old app version from device...
adb uninstall %APP_ID%

REM 6. Clean Gradle build cache
echo 🧽 Cleaning Gradle build...
call gradlew clean

REM 7. Build and install new app
echo 🚀 Building and installing new version...
call gradlew assembleDebug
call adb install -r app\build\outputs\apk\debug\app-debug.apk

echo ✅ Done! The latest Snapocado app has been freshly installed on your device.
pause
