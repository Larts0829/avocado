# 📱 Snapocado - Android Deployment

## ⚡ QUICK START (3 Commands)

```bash
# 1. Build the app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

Then click **RUN** in Android Studio with your phone connected!

---

## 🎯 ONE-CLICK BUILD

**Easiest way - Use the automated script:**

```bash
.\build-and-run-android.bat
```

This does everything automatically and opens Android Studio for you!

---

## 📋 Prerequisites

### Required Software (Must Have)
- ✅ Node.js installed
- ✅ Android Studio installed
- ✅ Android SDK installed (via Android Studio)

### Required Hardware
- ✅ Android phone with USB cable
- ✅ USB Debugging enabled on phone

---

## 🔧 Enable USB Debugging on Your Phone

### Step 1: Enable Developer Options
1. Open **Settings** on your phone
2. Scroll to **About Phone**
3. Find **Build Number**
4. Tap **Build Number** 7 times
5. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. Go back to **Settings**
2. Find **Developer Options** (usually in System or Advanced)
3. Turn on **USB Debugging**
4. Turn on **Install via USB** (if available)

### Step 3: Connect Phone
1. Connect phone to computer with USB cable
2. On phone, tap **Allow** when "Allow USB debugging?" appears
3. Check "Always allow from this computer"
4. Tap **OK**

---

## 🚀 Build & Deploy Process

### Method 1: Automated Script (RECOMMENDED)
```bash
.\build-and-run-android.bat
```
- Cleans old builds
- Installs dependencies
- Builds the app
- Syncs to Android
- Opens Android Studio

### Method 2: Manual Step-by-Step
```bash
# Step 1: Install dependencies (first time only)
npm install

# Step 2: Build the React app
npm run build

# Step 3: Sync with Android
npx cap sync android

# Step 4: Open in Android Studio
npx cap open android
```

### Method 3: Quick Sync (After Making Changes)
```bash
.\quick-android-sync.bat
```
Use this for faster rebuilds after code changes.

---

## 🏃 Running on Your Phone

### In Android Studio:

1. **Wait for Gradle Build**
   - First time: 5-10 minutes
   - Subsequent builds: 1-2 minutes
   - You'll see a progress bar at the bottom

2. **Select Your Device**
   - Look at the top toolbar
   - Click the device dropdown
   - Select your connected phone
   - If phone not visible, check USB connection

3. **Click Run**
   - Click the green play button (▶️)
   - Or press **Shift + F10**
   - Or menu: **Run > Run 'app'**

4. **App Installs**
   - Android Studio builds APK
   - Installs on your phone
   - App launches automatically

---

## 🎨 App Navigation on Android

```
📱 Snapocado App Opens
   ↓
🏠 Landing Page
   └─ "Start" button
       ↓
📋 Menu Page (6 options)
   ├─ 📷 Capture → Camera + AI Detection ✅
   ├─ 📤 Upload → Coming Soon
   ├─ 💊 Treatments → Coming Soon
   ├─ 🕐 History → Coming Soon
   ├─ 📖 User Guide → Coming Soon
   └─ ℹ️ About Us → Coming Soon
```

---

## ✅ What Works on Android

### Fully Functional:
- ✅ Landing page with logo
- ✅ Menu with 6 cards
- ✅ Navigation between pages
- ✅ **Camera access**
- ✅ **Photo capture**
- ✅ **TensorFlow Lite model inference**
- ✅ **Image processing**
- ✅ **Bounding box overlay**
- ✅ **Confidence scores**
- ✅ **Results display**
- ✅ Back button navigation

### Placeholder (UI Only):
- 📤 Upload page
- 💊 Treatments page
- 🕐 History page
- 📖 User Guide page
- ℹ️ About Us page

---

## 🐛 Common Issues & Fixes

### Issue: "Device not found" in Android Studio
**Fix:**
- Reconnect USB cable
- On phone: Check USB notification, select "File Transfer" or "MTP"
- Revoke and re-grant USB debugging authorization
- Try different USB cable or port

### Issue: "Build failed" error
**Fix:**
```bash
# Clean everything and rebuild
rmdir /s /q dist
rmdir /s /q node_modules
npm install
npm run build
npx cap sync android
```

### Issue: Camera not working
**Fix:**
- Go to phone Settings > Apps > Snapocado > Permissions
- Enable Camera permission
- Uninstall and reinstall app if needed

### Issue: Gradle build errors in Android Studio
**Fix:**
- In Android Studio: **File > Invalidate Caches / Restart**
- Then: **Build > Clean Project**
- Then: **Build > Rebuild Project**

### Issue: "Command not found" when running scripts
**Fix:**
- Open PowerShell or Command Prompt as Administrator
- Navigate to project folder:
  ```bash
  cd C:\Users\Acer\Documents\avocado
  ```
- Run commands from there

### Issue: Models not loading
**Fix:**
- Check if model files exist in `public/assets/models/`
- Ensure files are copied to `dist/assets/models/` after build
- Check Android Logcat in Android Studio for errors

---

## 📁 Important Files for Android

### Configuration Files:
- `capacitor.config.ts` - Capacitor settings ✅ Configured
- `android/app/src/main/AndroidManifest.xml` - Permissions ✅ Configured
- `vite.config.ts` - Build settings ✅ Configured

### Model Files (Required):
Place in `public/assets/models/`:
- `leaf_model_holder.tflite`
- `leaf_labels.txt`
- `fruit_model.tflite` (optional)
- `fruit_labels.txt` (optional)
- `tree_model.tflite` (optional)
- `tree_labels.txt` (optional)

---

## 🔍 Debugging on Android

### View Logs in Android Studio:
1. Click **Logcat** tab at bottom
2. Select your device
3. Select **com.ionic.avocado** package
4. View real-time logs
5. Filter by "Error" to see issues

### Common Log Searches:
- Search: `capacitor` - See Capacitor plugin logs
- Search: `camera` - See camera-related logs
- Search: `tflite` - See ML model logs
- Search: `ERROR` - See all errors

---

## 📊 Build Times (Approximate)

| Task | First Time | Subsequent |
|------|-----------|------------|
| npm install | 2-5 min | - |
| npm run build | 30-60 sec | 30-60 sec |
| Gradle sync | 5-10 min | 1-2 min |
| App install | 30 sec | 10-20 sec |
| **Total** | **10-15 min** | **2-3 min** |

---

## 💡 Pro Tips

### Faster Development:
1. Keep Android Studio open
2. After code changes, just run:
   ```bash
   npm run build && npx cap sync android
   ```
3. In Android Studio, click **Run** again
4. No need to close/reopen Android Studio

### Live Reload (Advanced):
```bash
# Run dev server
npm run dev

# In another terminal
npx cap run android -l --external
```
This enables live reload on your phone!

### Generate APK for Sharing:
In Android Studio:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Find APK in `android/app/build/outputs/apk/debug/`
- Share this APK file

---

## ✅ Final Checklist

Before building:
- [ ] Node.js installed
- [ ] Android Studio installed
- [ ] USB Debugging enabled on phone
- [ ] Phone connected and authorized
- [ ] Model files in `public/assets/models/`
- [ ] All dependencies installed (`npm install`)

Ready to build:
- [ ] Run `.\build-and-run-android.bat`
- [ ] Wait for Android Studio to open
- [ ] Wait for Gradle sync
- [ ] Select your device
- [ ] Click Run (▶️)

---

## 🎉 Success!

When you see the Snapocado app on your phone:
1. You'll see the **Landing Page** with logo
2. Tap **"Start"**
3. You'll see the **Menu** with 6 colorful cards
4. Tap **"Capture"**
5. Grant camera permission when asked
6. Point camera at an avocado/leaf
7. Tap the **Capture button**
8. See AI detection results!

---

## 📞 Need Help?

Check these in order:
1. Read this README completely
2. Check `ANDROID_BUILD_GUIDE.md` for detailed info
3. Look at Logcat in Android Studio for errors
4. Check if USB Debugging is still enabled
5. Try cleaning and rebuilding

---

## 🚀 You're Ready to Go!

Run this command and follow the prompts:
```bash
.\build-and-run-android.bat
```

**The app will be on your phone in minutes! 📱✨**
