# Simple Icon Setup (No Build Tools Required)

Since `@capacitor/assets` requires Visual Studio C++ build tools, here are easier alternatives:

## ✅ Recommended: Use Icon.Kitchen (Online Tool)

1. **Go to:** https://icon.kitchen/ or https://easyappicon.com/
2. **Upload:** `public\images\snapocado-icon.png`
3. **Select Platform:** Android
4. **Download** the generated icon pack
5. **Extract** and copy the `mipmap-*` folders to `android\app\src\main\res\`
6. **Sync:** Run `npm run sync-android`

## Option 2: Quick Manual Setup

Run the provided batch file:
```bash
generate-icons-simple.bat
```

This copies your icon to all mipmap folders (not ideal but works for testing).

## Option 3: Resize Manually

Use any image editor (Photoshop, GIMP, Paint.NET) to create:

- `android\app\src\main\res\mipmap-mdpi\ic_launcher.png` (48x48px)
- `android\app\src\main\res\mipmap-hdpi\ic_launcher.png` (72x72px)
- `android\app\src\main\res\mipmap-xhdpi\ic_launcher.png` (96x96px)
- `android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png` (144x144px)
- `android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png` (192x192px)

## After Icon Setup

```bash
npm run sync-android
```

Then rebuild your Android app in Android Studio or via command line.

---

## If You Want to Install @capacitor/assets

You need to install Visual Studio Build Tools:

1. Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Install with "Desktop development with C++" workload
3. Then run: `npm install @capacitor/assets --save-dev`

**Warning:** This is ~7GB download and not necessary for icon generation!
