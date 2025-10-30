# Snapocado Build Instructions

## Batch Files Overview

### 1. `clean-install.bat` - Full Clean Installation
**When to use:**
- First time setup
- After major code changes
- When app doesn't update on phone
- When experiencing build issues

**What it does:**
1. Removes `node_modules` folder
2. Clears `dist` build folder
3. Cleans Android build cache folders
4. Reinstalls all npm dependencies
5. Builds fresh web assets
6. Syncs with Capacitor Android
7. Opens Android Studio

**How to run:**
```bash
Double-click clean-install.bat
```
Or from terminal:
```bash
clean-install.bat
```

---

### 2. `quick-rebuild.bat` - Quick Rebuild (Recommended)
**When to use:**
- After making code changes
- Regular development builds
- When you want faster rebuilds

**What it does:**
1. Builds web assets
2. Syncs with Capacitor Android
3. Opens Android Studio

**How to run:**
```bash
Double-click quick-rebuild.bat
```
Or from terminal:
```bash
quick-rebuild.bat
```

---

## Building APK in Android Studio

After running either batch file, Android Studio will open:

1. Wait for Gradle sync to complete
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete (notification will appear)
4. Click **locate** in the notification to find your APK
5. Transfer APK to your phone and install

**APK Location:** 
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Troubleshooting

### App not updating on phone?
1. Uninstall old app from phone completely
2. Run `clean-install.bat`
3. Build fresh APK in Android Studio
4. Install new APK on phone

### Build errors?
1. Make sure Node.js is installed
2. Run `clean-install.bat`
3. Check for error messages in the console

### Gradle errors?
1. Delete `android/.gradle` folder manually
2. Run `clean-install.bat`
3. In Android Studio: **File** → **Invalidate Caches** → **Invalidate and Restart**

---

## Manual Commands (if batch files don't work)

```bash
# Clean install
rmdir /s /q node_modules
rmdir /s /q dist
rmdir /s /q android\app\build
rmdir /s /q android\build
npm install
npm run build
npx cap sync android
npx cap open android

# Quick rebuild
npm run build
npx cap sync android
npx cap open android
```

---

## Version Bumping (Before Release)

Update version in `package.json`, then update Android version:

1. Open `android/app/build.gradle`
2. Update `versionCode` (increment by 1)
3. Update `versionName` (e.g., "1.0.1")
4. Run `clean-install.bat`
5. Build release APK
