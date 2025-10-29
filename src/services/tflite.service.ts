import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

// Define the plugin interface
interface TFLiteNativePlugin {
  loadModel(options: { modelPath: string; labelPath: string }): Promise<void>;
  runModelOnImage(options: { imageBase64: string }): Promise<{
    label: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

// Register the plugin
const TFLiteNative = registerPlugin<TFLiteNativePlugin>('TFLiteNative');

/**
 * TensorFlow Lite Service
 * Handles model loading and image prediction (Base64)
 */
export const tfliteService = {
  /**
   * Loads a TensorFlow Lite model and label file from assets
   * @param modelPath relative path inside assets/models/
   * @param labelPath relative path inside assets/models/
   */
  async loadModel(modelPath: string, labelPath: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('[TFLite] Running in web mode - model loading skipped');
      return;
    }

    try {
      console.log(`[TFLite] Loading model: ${modelPath}, labels: ${labelPath}`);
      await TFLiteNative.loadModel({
        modelPath,
        labelPath,
      });
      console.log(`[TFLite] Model loaded successfully`);
    } catch (err: any) {
      console.error('[TFLite] Error loading model:', err);
      throw new Error(`Failed to load model: ${err.message || err}`);
    }
  },

  /**
   * Sends a Base64 image string to the native side for inference
   * @param imageBase64 base64 string of captured image
   * @returns Prediction result (label + confidence)
   */
  async predictBase64(
    imageBase64: string
  ): Promise<{ 
    label: string; 
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  } | null> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('[TFLite] Running in web mode - returning mock data');
      return {
        label: 'Mock Detection',
        confidence: 0.95,
      };
    }

    try {
      console.log('[TFLite] Running inference on image...');
      const result = await TFLiteNative.runModelOnImage({
        imageBase64,
      });

      if (result && result.label && result.confidence !== undefined) {
        console.log('[TFLite] Prediction result:', result);
        return result;
      } else {
        console.warn('[TFLite] No prediction returned from native.');
        return null;
      }
    } catch (err: any) {
      console.error('[TFLite] Error predicting:', err);
      throw new Error(`Failed to process image: ${err.message || err}`);
    }
  },
};
