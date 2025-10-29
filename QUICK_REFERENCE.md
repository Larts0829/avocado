# 📱 Snapocado - Quick Reference Card

## ⚡ ONE-COMMAND BUILD

```bash
.\build-and-run-android.bat
```
**Then:** Click ▶️ in Android Studio

---

## 🔨 Manual Build (3 Commands)

```bash
npm run build
npx cap sync android
npx cap open android
```

---

## 📱 Enable USB Debugging

1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Settings → Developer Options
4. Turn on "USB Debugging"
5. Connect phone, tap "Allow"

---

## 🎯 In Android Studio

1. Wait for Gradle sync (5-10 min first time)
2. Select your device from dropdown
3. Click green ▶️ button
4. App installs on phone!

---

## 🐛 Quick Fixes

### Device not showing?
- Reconnect USB
- On phone: Select "File Transfer"
- Re-allow USB debugging

### Build failed?
```bash
rmdir /s /q dist
rmdir /s /q node_modules
npm install
npm run build
npx cap sync android
```

### Camera not working?
- Phone Settings → Apps → Snapocado → Permissions → Enable Camera

### Gradle errors?
- Android Studio → File → Invalidate Caches / Restart

---

## 📁 Model Files Location

Place in: `public/assets/models/`

Required:
- `leaf_model_holder.tflite`
- `leaf_labels.txt`

---

## 🗺️ App Navigation

```
Landing (Start) 
    ↓
Menu (6 cards)
    ↓
Capture (Camera + AI) ✅ WORKING
Upload, Treatments, History, Guide, About ⏳ Coming
```

---

## ✅ Before Building Checklist

- [ ] Android Studio installed
- [ ] Phone in Developer Mode
- [ ] USB Debugging enabled
- [ ] Phone connected
- [ ] Models in `public/assets/models/`
- [ ] Run `npm install` (first time)

---

## 🚀 Build Times

| Task | Time |
|------|------|
| npm run build | ~1 min |
| Gradle sync (first) | 5-10 min |
| Gradle sync (after) | 1-2 min |
| Install on phone | ~30 sec |

---

## 📞 Help Files

- `README_ANDROID.md` - Full guide
- `ANDROID_BUILD_GUIDE.md` - Detailed steps
- `ANDROID_CHANGES_SUMMARY.md` - What changed

---

## 💡 Pro Tip

After first build, just run:
```bash
npm run build && npx cap sync android
```
Then click ▶️ in Android Studio (keep it open!)

---

**🎉 Ready to build? Run: `.\build-and-run-android.bat`**
