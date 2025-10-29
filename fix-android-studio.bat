@echo off
echo ========================================
echo Fixing Android Studio Build Issues
echo ========================================
echo.

echo Step 1: Cleaning Android build...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Building Android project...
call gradlew build --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Build failed - check errors above
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

cd ..

echo Step 3: Re-syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo Fix complete!
echo.
echo Next steps:
echo 1. Close Android Studio completely
echo 2. Delete the .idea folder in android directory
echo 3. Reopen Android Studio
echo 4. File -^> Sync Project with Gradle Files
echo ========================================
pause
