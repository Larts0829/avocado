@echo off
echo ========================================
echo Simple Icon Setup for Android
echo ========================================
echo.
echo This script will help you manually set up icons.
echo.
echo Your icon is at: public\images\snapocado-icon.png
echo.
echo OPTION 1 - Use Online Tool (Recommended):
echo ----------------------------------------
echo 1. Go to: https://icon.kitchen/
echo 2. Upload: public\images\snapocado-icon.png
echo 3. Select "Android" platform
echo 4. Download the generated icons
echo 5. Extract and copy the 'mipmap-*' folders to:
echo    android\app\src\main\res\
echo.
echo OPTION 2 - Use Photoshop/GIMP:
echo ----------------------------------------
echo Create the following sizes and save to android\app\src\main\res\:
echo   mipmap-mdpi\ic_launcher.png      (48x48px)
echo   mipmap-hdpi\ic_launcher.png      (72x72px)
echo   mipmap-xhdpi\ic_launcher.png     (96x96px)
echo   mipmap-xxhdpi\ic_launcher.png    (144x144px)
echo   mipmap-xxxhdpi\ic_launcher.png   (192x192px)
echo.
echo OPTION 3 - Quick Copy (Single Size):
echo ----------------------------------------
echo Press any key to copy your icon to all mipmap folders as-is...
pause >nul

:: Create directories if they don't exist
mkdir "android\app\src\main\res\mipmap-mdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-hdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xhdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xxhdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xxxhdpi" 2>nul

:: Copy icon to all folders
echo Copying icon...
copy "public\images\snapocado-icon.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" >nul
copy "public\images\snapocado-icon.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" >nul
copy "public\images\snapocado-icon.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" >nul
copy "public\images\snapocado-icon.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" >nul
copy "public\images\snapocado-icon.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" >nul

echo.
echo ✓ Icons copied to all mipmap folders!
echo.
echo Note: This uses the same image for all sizes. For best results,
echo use Option 1 or 2 to create properly sized icons.
echo.
echo Next steps:
echo 1. npm run build
echo 2. npx cap sync android
echo 3. Rebuild your Android app
echo.
pause
