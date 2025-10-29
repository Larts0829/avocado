# 🥑 Quick Start Guide - Avocado Detection App

## ⚡ Fast Track to Running Your App

### Option 1: Automated Build (Recommended)
```bash
cd c:\Users\Acer\Documents\avocado
build-android.bat
```
That's it! The script will handle everything and open Android Studio.

### Option 2: Manual Build
```bash
# 1. Install dependencies
npm install

# 2. Build web app
npm run build

# 3. Sync with Android
npx cap sync android

# 4. Open Android Studio
npx cap open android
```

### In Android Studio:
1. ⏳ Wait for Gradle sync (1-2 minutes)
2. 📱 Connect your Android device via USB
3. ✅ Enable USB debugging on your device
4. ▶️ Click the green "Run" button
5. 🎉 App will install and launch!

## 📱 Using the App

1. **Select Detection Type**
   - Tap dropdown menu
   - Choose: Fruit, Leaf, or Tree

2. **Capture Image**
   - Tap "Capture Image" button
   - Take photo of avocado part
   - Wait 1-2 seconds for processing

3. **View Results**
   - See detected disease/pest
   - Check confidence percentage
   - Review recommendations

## 🎯 What Can It Detect?

### 🍐 Fruit Detection
- ✅ Healthy fruit
- 🔴 Anthracnose (fungal)
- 🔴 Scab (fungal)

### 🍃 Leaf Detection
- ✅ Healthy Leaf
- 🔴 Anthracnose Leaf
- 🔴 Powdery Mildew
- 🔴 Spider Mites

### 🌳 Tree Detection
- 🔴 Borer (insect pest)

## ⚠️ Troubleshooting

### App won't install?
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
```

### "Failed to process image" error?
1. Check if models are in: `android/app/src/main/assets/public/assets/models/`
2. Rebuild: `npx cap sync android`
3. Check Android Logcat for details

### Camera not working?
1. Grant camera permission in app settings
2. Restart the app

## 📊 Expected Results

### Good Detection:
- **Confidence:** 70-95%
- **Speed:** 1-2 seconds
- **Accuracy:** High with clear images

### Tips for Best Results:
- ✅ Use good lighting
- ✅ Focus on the affected area
- ✅ Keep camera steady
- ✅ Fill frame with subject
- ❌ Avoid blurry images
- ❌ Avoid extreme angles

## 🔧 System Requirements

- **Android:** 7.0 (API 24) or higher
- **RAM:** 2GB minimum
- **Storage:** 100MB free space
- **Camera:** Required

## 📞 Need Help?

1. **Check logs:**
   ```bash
   adb logcat | grep TFLiteNative
   ```

2. **Read detailed docs:**
   - `BUILD_INSTRUCTIONS.md` - Full build guide
   - `FIXES_APPLIED.md` - Technical details

3. **Common issues:**
   - Models not found → Run `npx cap sync android`
   - Plugin error → Rebuild project
   - Low confidence → Use better images

## 🚀 You're Ready!

Your app is fully functional and ready to detect avocado pests and diseases. Just run the build script and start testing!

**Happy detecting! 🥑🔍**
