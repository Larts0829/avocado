# Snapocado

Snapocado is an AI-powered avocado plant health companion built as a mobile app with Ionic React and Capacitor. It helps users detect diseases and pests affecting avocado fruit, leaves, and trees, then presents results together with treatment guidance, history tracking, and reference resources.

## Project Description

The app is designed for avocado farmers and field users who need fast, mobile-first diagnosis support. Users can capture images from the camera or upload existing photos, run them through TensorFlow Lite models, and review the predicted condition with confidence details. The app also includes treatment guides, detection history, and supporting documentation for everyday use.

## Tech Stack

- Frontend: React 19
- Mobile UI Framework: Ionic React 8
- Native Runtime: Capacitor 7
- Language: TypeScript
- Build Tool: Vite 5
- Routing: React Router 5
- AI Inference: TensorFlow Lite models
- Testing: Vitest, Cypress, and Testing Library
- Platform Support: Android

## Core Features

- AI-assisted detection for avocado fruit, leaf, and tree issues
- Camera capture and image upload workflows
- Detection history with saved results
- Treatment and management guides for diseases and pests
- About and resource pages for user support
- Native mobile integration for camera, haptics, status bar, splash screen, and filesystem access

## Included Models

- Fruit model for avocado fruit disease detection
- Leaf model for avocado leaf disease and pest detection
- Tree model for tree-level pest detection

## Development Scripts

- npm run dev - Start the Vite development server
- npm run build - Type-check and build the app for production
- npm run preview - Preview the production build locally
- npm run test.unit - Run unit tests with Vitest
- npm run test.e2e - Run end-to-end tests with Cypress
- npm run lint - Run ESLint
- npm run sync-android - Build and sync the app to Android

## Typical Use Flow

1. Open the app on a mobile device or Android build.
2. Choose capture or upload mode.
3. Select the target type: fruit, leaf, or tree.
4. Review the detection result and confidence score.
5. Check history or open the treatment guide for next steps.

## Documentation

- User guide: [resources/README.md](resources/README.md)
