# Avocado Pest & Disease Detection App - Build Instructions

## Overview
This is a fully functional Android app that detects pests and diseases in avocado fruits, leaves, and trees using TensorFlow Lite models.

## Prerequisites
1. **Node.js** (v16 or higher)
2. **Android Studio** (latest version)
3. **Java JDK** (v11 or higher)
4. **Ionic CLI**: `npm install -g @ionic/cli`
5. **Capacitor CLI**: Already included in project dependencies

## Project Structure
```
avocado/
├── src/                          # React/Ionic frontend
│   ├── pages/Home.tsx           # Main detection page
│   └── services/tflite.service.ts # TensorFlow Lite service
├── android/                      # Native Android code
│   └── app/src/main/
│       ├── java/io/ionic/avocado/
│       │   ├── MainActivity.java      # Main activity
│       │   └── TFLiteNative.java     # TFLite plugin
│       └── assets/public/assets/models/  # ML models
│           ├── fruit_model.tflite
│           ├── leaf_model_holder.tflite
│           ├── tree_model.tflite
│           ├── fruit_labels.txt
│           ├── leaf_labels.txt
│           └── tree_labels.txt
└── public/assets/models/         # Web assets (copied to Android)
```

## Detection Capabilities

### 1. Fruit Detection
- **Healthy fruit**
- **Anthracnose** (fungal disease)
- **Scab** (fungal disease)

### 2. Leaf Detection
- **Healthy Leaf**
- **Anthracnose Leaf**
- **Powdery Mildew**
- **Spider Mites**

### 3. Tree Detection
- **Borer** (insect pest)

## Build Steps

### Step 1: Install Dependencies
```bash
cd c:\Users\Acer\Documents\avocado
npm install
```

### Step 2: Build the Web App
```bash
npm run build
```

### Step 3: Sync with Android
```bash
npx cap sync android
```

This command will:
- Copy web assets to Android
- Copy ML models to Android assets folder
- Update Android project with latest code

### Step 4: Open in Android Studio
```bash
npx cap open android
```

Or manually open the `android` folder in Android Studio.

### Step 5: Build APK in Android Studio

1. **Wait for Gradle sync** to complete
2. **Connect your Android device** or start an emulator
3. **Build > Make Project** (Ctrl+F9)
4. **Run > Run 'app'** (Shift+F10)

Or build APK:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

## Testing the App

### On Device/Emulator:
1. Launch the app
2. Select detection type (Fruit, Leaf, or Tree)
3. Tap "Capture Image"
4. Take a photo of an avocado fruit/leaf/tree
5. Wait for the model to process
6. View detection results with confidence score

## Troubleshooting

### Error: "Failed to process image"

**Possible causes:**
1. Model not loaded properly
2. Image format issue
3. TensorFlow Lite dependency missing

**Solutions:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build

# Or in Android Studio:
# Build > Clean Project
# Build > Rebuild Project
```

### Error: "TFLiteNative plugin not available"

**Solution:**
- Make sure `TFLiteNative.java` is in the correct package
- Verify plugin registration in `MainActivity.java`
- Rebuild the project

### Error: "Model not found"

**Solution:**
```bash
# Re-sync Capacitor
npx cap sync android

# Manually copy models if needed
# Make sure models are in:
# android/app/src/main/assets/public/assets/models/
```

### Gradle Build Errors

**Solution:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

## Development Mode

### Run in browser (for UI testing only):
```bash
npm start
```
Note: TensorFlow Lite models won't work in browser, but UI can be tested.

### Live reload on device:
```bash
ionic cap run android -l --external
```

## Model Information

### Input Requirements:
- **Image size**: 320x320 pixels (auto-resized)
- **Format**: RGB
- **Normalization**: [0, 1] range

### Output:
- **Classification models**: Label + confidence score
- **Detection models**: Label + confidence + bounding box (if applicable)

## Performance Tips

1. **Use good lighting** when capturing images
2. **Center the subject** in the frame
3. **Avoid blurry images**
4. **Ensure avocado part is clearly visible**

## File Sizes
- Fruit model: ~5-10 MB
- Leaf model: ~5-10 MB
- Tree model: ~5-10 MB

## Minimum Android Requirements
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 33 (Android 13)
- **Permissions**: Camera access

## Support
For issues or questions, check:
1. Android Logcat for native errors
2. Chrome DevTools for web errors (chrome://inspect)
3. TensorFlow Lite documentation

## Next Steps
1. Test with real avocado images
2. Improve model accuracy with more training data
3. Add more disease/pest types
4. Implement treatment recommendations
5. Add history/tracking features
