@echo off
echo ========================================
echo Snapocado Icon Setup Script
echo ========================================
echo.

:: Create resources folder if it doesn't exist
if not exist "resources" mkdir resources

:: Copy the icon
echo Copying snapocado-icon.png to resources folder...
copy "public\images\snapocado-icon.png" "resources\icon.png"

if %ERRORLEVEL% EQU 0 (
    echo ✓ Icon copied successfully!
    echo.
    echo Next steps:
    echo 1. Install @capacitor/assets: npm install @capacitor/assets --save-dev
    echo 2. Generate icons: npm run generate-icons
    echo 3. Sync to Android: npm run sync-android
    echo.
) else (
    echo ✗ Failed to copy icon. Please check if the file exists.
    echo Expected location: public\images\snapocado-icon.png
)

pause
