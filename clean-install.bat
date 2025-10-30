@echo off
echo ===============================================
echo    Snapocado - Clean Installation Script
echo ===============================================
echo.

echo [1/7] Cleaning node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo Node modules removed.
) else (
    echo No node_modules found.
)
echo.

echo [2/7] Cleaning dist folder...
if exist dist (
    rmdir /s /q dist
    echo Dist folder removed.
) else (
    echo No dist folder found.
)
echo.

echo [3/7] Cleaning Android build folders...
if exist android\app\build (
    rmdir /s /q android\app\build
    echo Android app build folder removed.
)
if exist android\build (
    rmdir /s /q android\build
    echo Android build folder removed.
)
if exist android\.gradle (
    rmdir /s /q android\.gradle
    echo Android gradle cache removed.
)
echo.

echo [4/7] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [5/7] Building web assets...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [6/7] Syncing Capacitor with Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo.

echo [7/7] Opening Android Studio...
call npx cap open android
echo.

echo ===============================================
echo    Clean installation completed successfully!
echo    Build your APK in Android Studio.
echo ===============================================
echo.
pause
