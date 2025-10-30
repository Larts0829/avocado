# How to Replace Android App Icon

Your custom icon is located at: `C:\Users\Acer\Documents\avocado\public\images\snapocado-icon.png`

## Option 1: Using @capacitor/assets (Recommended - Automatic)

1. **Install the assets package:**
   ```bash
   npm install @capacitor/assets --save-dev
   ```

2. **Copy your icon to the resources folder:**
   - Create a `resources` folder in the project root if it doesn't exist
   - Copy `snapocado-icon.png` to: `C:\Users\Acer\Documents\avocado\resources\icon.png`
   - Make sure the icon is at least 1024x1024px (preferably with transparency)

3. **Generate all icon sizes:**
   ```bash
   npx capacitor-assets generate --android
   ```

4. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

## Option 2: Manual Replacement (For each density)

Copy and resize your icon to these folders:

- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48px)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72px)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96px)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144px)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192px)

Also create rounded versions:
- `ic_launcher_round.png` in each folder (same sizes)

## After Replacement

1. **Clean and rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android
   ```

2. **Build the app:**
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Test on device or emulator**

---

## Current Status
✅ Header shadows removed - all toolbars now blend seamlessly
⚠️ Icon replacement - follow steps above to complete
