# Android Build & Deploy Guide for Snapocado

## ✅ Prerequisites Completed
- ✅ Capacitor configured for Android
- ✅ AndroidManifest.xml updated with correct permissions
- ✅ Camera permissions configured
- ✅ App name changed to "Snapocado"
- ✅ All assets converted to embedded SVG (no external image dependencies)
- ✅ Vite build optimized for Android

## 🔨 Build & Deploy Steps

### Step 1: Clean Previous Builds (Optional)
```bash
# Remove previous build artifacts
rmdir /s /q dist
rmdir /s /q android\app\build
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build the React App
```bash
npm run build
```

### Step 4: Sync with Capacitor
```bash
npx cap sync android
```

### Step 5: Open in Android Studio
```bash
npx cap open android
```

### Step 6: In Android Studio
1. Wait for Gradle sync to complete
2. Connect your Android phone via USB
   - Enable **Developer Options** on your phone
   - Enable **USB Debugging** in Developer Options
   - Trust the computer when prompted
3. Select your device from the device dropdown
4. Click the **Run** button (green play icon) or press Shift+F10

## 🚀 Quick Build Script

Use the provided batch file:
```bash
.\build-and-run-android.bat
```

This script will:
1. Clean previous builds
2. Install dependencies
3. Build the React app
4. Sync with Capacitor
5. Open Android Studio

## 📱 Testing on Your Phone

### Enable Developer Mode:
1. Go to **Settings** > **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** > **Developer Options**
4. Enable **USB Debugging**

### Connect & Run:
1. Connect phone to computer via USB
2. Allow USB debugging when prompted
3. In Android Studio, select your device
4. Click Run

## 🎯 App Features Ready for Android

### ✅ Working Features:
- **Landing Page** - Welcome screen with logo
- **Menu Page** - 6 interactive menu cards
- **Capture Page** - Camera integration with:
  - Live camera access
  - Image capture
  - TensorFlow Lite model processing
  - Bounding box visualization
  - Results display with confidence scores
  - Action recommendations

### 📝 Placeholder Pages (Coming Soon):
- Upload
- Treatments
- History
- User Guide
- About Us

## 🔧 Android-Specific Configuration

### Permissions (Already Configured)
```xml
- INTERNET - For any online features
- CAMERA - For camera capture
- READ_EXTERNAL_STORAGE - For image uploads
- WRITE_EXTERNAL_STORAGE - For saving images
```

### Capacitor Configuration
```typescript
- androidScheme: 'https' - Secure scheme
- allowMixedContent: true - Load assets properly
- Camera plugin configured for fullscreen
```

## 🐛 Troubleshooting

### Issue: Build fails with Gradle errors
**Solution**: 
- Open Android Studio
- File > Invalidate Caches / Restart
- Clean Project (Build > Clean Project)
- Rebuild Project (Build > Rebuild Project)

### Issue: Camera not working
**Solution**:
- Check if camera permissions are granted in phone settings
- Restart the app
- Uninstall and reinstall the app

### Issue: App crashes on launch
**Solution**:
- Check Android Studio Logcat for errors
- Ensure you ran `npm run build` before `npx cap sync`
- Make sure all dependencies are installed

### Issue: Models not loading
**Solution**:
- Verify model files exist in `public/assets/models/`
- Check if files were copied during build
- Check console logs in Android Studio Logcat

## 📊 App Structure

```
Snapocado/
├── Landing (/)
│   └── "Start" button → Menu
├── Menu (/menu)
│   ├── Capture → /capture (Camera + ML Model)
│   ├── Upload → /upload (Placeholder)
│   ├── Treatments → /treatments (Placeholder)
│   ├── History → /history (Placeholder)
│   ├── User Guide → /guide (Placeholder)
│   └── About Us → /about (Placeholder)
└── Capture (/capture)
    ├── Camera interface
    ├── Capture button
    ├── Tips section
    └── Results display
```

## 💾 Model Files Required

Ensure these files exist in `public/assets/models/`:
- `leaf_model_holder.tflite`
- `leaf_labels.txt`
- `fruit_model.tflite` (optional)
- `fruit_labels.txt` (optional)
- `tree_model.tflite` (optional)
- `tree_labels.txt` (optional)

## 🎨 Design System (Android-Optimized)

### Colors
- Primary: `#10b981` (Emerald Green)
- Background: `#f5f5f7` (Light Gray)
- Dark Text: `#2d3748`
- Light Text: `#718096`

### Component Styles
- Cards: 16-20px border radius
- Buttons: 12px border radius
- Shadows: Subtle, 0.06-0.1 opacity
- Icons: Ionicons library

### Responsive Design
- Optimized for mobile screens
- Touch-friendly tap targets (min 48x48dp)
- Smooth animations and transitions

## ✅ Final Checklist Before Building

- [ ] All dependencies installed (`npm install`)
- [ ] Models placed in `public/assets/models/`
- [ ] Android SDK installed
- [ ] Android phone in Developer Mode
- [ ] USB Debugging enabled
- [ ] Phone connected to computer
- [ ] Computer trusted on phone

## 🚀 You're Ready!

Run the build script and deploy to your Android device:
```bash
.\build-and-run-android.bat
```

The app will open in Android Studio, and you can run it directly on your phone!
