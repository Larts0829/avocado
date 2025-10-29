# 🔧 Android Studio Build Errors - Complete Fix Guide

## Current Errors
- "Incompatible types: JSObject cannot be converted to JSObject"
- "TFLiteNative.java is not on the classpath"
- Build failed errors

## Root Cause
Android Studio hasn't properly synced the Capacitor dependencies and project structure.

---

## ✅ Solution: Follow These Steps Exactly

### Step 1: Close Android Studio
- Close Android Studio completely
- Make sure no Android Studio processes are running

### Step 2: Clean the Project
Open Command Prompt in your project folder and run:

```bash
cd c:\Users\Acer\Documents\avocado
```

Then run the fix script:
```bash
fix-android-studio.bat
```

OR manually:
```bash
cd android
gradlew clean
gradlew build --stacktrace
cd ..
npx cap sync android
```

### Step 3: Delete Android Studio Cache
Navigate to:
```
c:\Users\Acer\Documents\avocado\android
```

Delete these folders/files if they exist:
- `.idea` folder
- `.gradle` folder (in android directory)
- `app/build` folder
- `build` folder

### Step 4: Reopen Android Studio
1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to: `c:\Users\Acer\Documents\avocado\android`
4. Click OK

### Step 5: Wait for Gradle Sync
- Android Studio will automatically start syncing
- **Wait for it to complete** (may take 2-5 minutes)
- Watch the bottom status bar for "Gradle Build Running..."

### Step 6: Manual Sync (if needed)
If automatic sync doesn't start:
1. Click **File → Sync Project with Gradle Files**
2. Wait for completion

### Step 7: Rebuild Project
1. Click **Build → Clean Project**
2. Wait for completion
3. Click **Build → Rebuild Project**
4. Wait for completion

---

## 🎯 Expected Result

After following these steps, you should see:
- ✅ No red underlines in TFLiteNative.java
- ✅ "BUILD SUCCESSFUL" in the Build tab
- ✅ Green "Run" button is enabled

---

## 🔍 If Errors Still Persist

### Check 1: Verify Capacitor Version
In `android/app/build.gradle`, you should see:
```gradle
implementation project(':capacitor-android')
```

### Check 2: Verify TensorFlow Lite
In `android/app/build.gradle`, you should see:
```gradle
implementation 'org.tensorflow:tensorflow-lite:2.14.0'
```

### Check 3: Check Gradle Wrapper
Run this command:
```bash
cd android
gradlew --version
```

Should show Gradle 8.x or higher.

### Check 4: Check Java Version
Run:
```bash
java -version
```

Should show Java 11 or higher.

---

## 🚨 Alternative: Nuclear Option

If nothing works, try this complete reset:

### 1. Backup your models
Copy these folders to a safe location:
- `android/app/src/main/assets/public/assets/models/`

### 2. Delete Android folder
```bash
cd c:\Users\Acer\Documents\avocado
rmdir /s /q android
```

### 3. Reinstall Capacitor Android
```bash
npm install @capacitor/android@latest
npx cap add android
```

### 4. Copy models back
Restore the models folder to:
- `android/app/src/main/assets/public/assets/models/`

### 5. Sync again
```bash
npx cap sync android
npx cap open android
```

---

## 📱 Quick Test Build

Once Android Studio shows no errors, try building:

### Option 1: Via Android Studio
1. Click the green **Run** button (▶️)
2. Select your device
3. Wait for build and installation

### Option 2: Via Command Line
```bash
cd android
gradlew assembleDebug
```

APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🎓 Understanding the Errors

### "JSObject cannot be converted to JSObject"
This happens when:
- Multiple JSObject classes are imported
- Android Studio cache is corrupted
- Gradle hasn't synced properly

**Fix:** Clean cache and re-sync

### "Not on classpath"
This happens when:
- Android Studio doesn't recognize the source folder
- Gradle sync failed
- Project structure is corrupted

**Fix:** Delete .idea and re-import project

---

## ✅ Verification Checklist

Before running the app, verify:

- [ ] No red underlines in TFLiteNative.java
- [ ] No errors in "Problems" tab
- [ ] "BUILD SUCCESSFUL" message appears
- [ ] Green Run button is enabled
- [ ] Device is connected and recognized
- [ ] USB debugging is enabled on device

---

## 📞 Still Having Issues?

### Check Build Output
Look at the "Build" tab at the bottom of Android Studio for detailed error messages.

### Check Logcat
1. Open Logcat tab (bottom of Android Studio)
2. Filter by "TFLiteNative"
3. Look for error messages

### Check Gradle Console
1. View → Tool Windows → Gradle
2. Look for sync errors

---

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ TFLiteNative.java has no errors
2. ✅ Build completes successfully
3. ✅ App installs on device
4. ✅ Camera opens when you tap "Capture Image"
5. ✅ Detection results appear after capturing

---

## 💡 Pro Tips

1. **Always clean before building** if you make changes to Java files
2. **Keep Android Studio updated** to latest stable version
3. **Use Gradle wrapper** (gradlew) instead of system Gradle
4. **Check internet connection** - Gradle needs to download dependencies
5. **Be patient** - First build can take 5-10 minutes

---

## 🔄 Daily Development Workflow

When making changes:

1. Edit code in VS Code or Android Studio
2. Save all files
3. In terminal: `npm run build`
4. In terminal: `npx cap sync android`
5. In Android Studio: **Build → Clean Project**
6. In Android Studio: **Build → Rebuild Project**
7. Click **Run** ▶️

---

Good luck! Your app should build successfully after following these steps. 🚀
