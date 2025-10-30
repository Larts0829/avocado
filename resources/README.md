# App Resources

This folder contains the source assets for generating app icons and splash screens.

## Icon Requirements

Place your app icon in this folder as `icon.png`:
- **Minimum size:** 1024x1024px
- **Format:** PNG with transparency (recommended)
- **Content:** Should fit within a safe area (avoid content near edges)

## Current Icon

Your custom Snapocado icon is located at:
`C:\Users\Acer\Documents\avocado\public\images\snapocado-icon.png`

**To use it:**
1. Copy it to this folder and rename it to `icon.png`
2. Run: `npm run generate-icons`
3. Run: `npm run sync-android`

## Generated Sizes

The script will automatically generate these sizes for Android:
- mdpi: 48x48px
- hdpi: 72x72px
- xhdpi: 96x96px
- xxhdpi: 144x144px
- xxxhdpi: 192x192px
