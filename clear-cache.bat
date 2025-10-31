@echo off
echo ========================================
echo  Clearing Snapocado Cache
echo ========================================
echo.

echo [1/6] Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/6] Clearing npm cache...
call npm cache clean --force

echo [3/6] Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    - node_modules removed
) else (
    echo    - node_modules not found
)

echo [4/6] Clearing Ionic cache...
if exist .ionic (
    rmdir /s /q .ionic
    echo    - .ionic cache removed
)

echo [5/6] Clearing Android build cache...
if exist android\app\build (
    rmdir /s /q android\app\build
    echo    - Android build cache removed
)
if exist android\.gradle (
    rmdir /s /q android\.gradle
    echo    - Gradle cache removed
)

echo [6/6] Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo  Cache cleared successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Run: npx cap sync
echo 3. Build Android app
echo.
pause
