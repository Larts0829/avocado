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

export interface PredictionResult {
  label: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Fruit model labels: Healthy fruit, anthracnose, scab
// Higher thresholds to prevent false positives when there's no avocado
const FRUIT_CONFIDENCE_THRESHOLDS: Record<string, number> = {
  'Healthy fruit': 0.55,
  'Healthy Fruit': 0.55,
  'scab': 0.63,
  'Scab': 0.63,
  'anthracnose': 0.67,
  'Anthracnose': 0.67
};

// Leaf model labels: healthy, anthracnose leaf, mites, powdery mildew
// Lower thresholds for better detection
const LEAF_CONFIDENCE_THRESHOLDS: Record<string, number> = {
  'healthy': 0.65,
  'Healthy': 0.65,
  'Healthy Leaf': 0.65,
  'anthracnose leaf': 0.55,
  'Anthracnose Leaf': 0.55,
  'mites': 0.55,
  'Mites': 0.55,
  'Spider Mites': 0.55,
  'powdery mildew': 0.55,
  'Powdery Mildew': 0.55
};

// Tree model label: borer
const TREE_CONFIDENCE_THRESHOLD = 0.55;

// Default confidence threshold
const DEFAULT_CONFIDENCE_THRESHOLD = 0.55;

// Register the plugin
const TFLiteNative = registerPlugin<TFLiteNativePlugin>('TFLiteNative');

/**
 * TensorFlow Lite Service
 * Handles model loading and image prediction (Base64)
 */
class TFLiteService {
  private isFruitModel: boolean = false;
  private isLeafModel: boolean = false;
  private isTreeModel: boolean = false;

  constructor() {
    this.isFruitModel = false;
    this.isLeafModel = false;
    this.isTreeModel = false;
  }

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

    // Determine model type
    this.isFruitModel = modelPath.includes('fruit');
    this.isLeafModel = modelPath.includes('leaf');
    this.isTreeModel = modelPath.includes('tree');
    
    const modelType = this.isFruitModel ? 'fruit' : this.isLeafModel ? 'leaf' : this.isTreeModel ? 'tree' : 'unknown';
    console.log(`[TFLite] Loading ${modelType} model`);

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
  }

  /**
   * Resizes an image to 640x640 while maintaining aspect ratio
   */
  private async resizeImageTo640x640(imageData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Could not create canvas context');
            return;
          }

          // Set canvas dimensions to 640x640
          canvas.width = 640;
          canvas.height = 640;

          // Calculate dimensions to maintain aspect ratio
          const sourceAspect = img.width / img.height;
          let drawWidth = 640;
          let drawHeight = 640;
          let offsetX = 0;
          let offsetY = 0;

          if (sourceAspect > 1) {
            // Image is wider than tall
            drawHeight = 640 / sourceAspect;
            offsetY = (640 - drawHeight) / 2;
          } else {
            // Image is taller than wide or square
            drawWidth = 640 * sourceAspect;
            offsetX = (640 - drawWidth) / 2;
          }

          // Fill with black background
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, 640, 640);

          // Draw the image centered
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Convert back to base64
          const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
          resolve(resizedImage);
        };
        img.onerror = (err) => {
          console.error('Error loading image:', err);
          reject('Failed to load image');
        };
        img.src = imageData;
      } catch (err) {
        console.error('Error in resizeImageTo640x640:', err);
        reject('Failed to resize image');
      }
    });
  }

  /**
   * Checks if a prediction meets the confidence threshold
   */
  private isConfidenceSufficient(label: string, confidence: number): boolean {
    let threshold: number;
    const normalizedLabel = label.toLowerCase();
    
    if (this.isFruitModel) {
      // Try exact match first, then normalized
      threshold = FRUIT_CONFIDENCE_THRESHOLDS[label] || 
                  FRUIT_CONFIDENCE_THRESHOLDS[normalizedLabel] || 
                  DEFAULT_CONFIDENCE_THRESHOLD;
    } else if (this.isLeafModel) {
      // Try exact match first, then normalized
      threshold = LEAF_CONFIDENCE_THRESHOLDS[label] || 
                  LEAF_CONFIDENCE_THRESHOLDS[normalizedLabel] || 
                  DEFAULT_CONFIDENCE_THRESHOLD;
    } else if (this.isTreeModel) {
      threshold = TREE_CONFIDENCE_THRESHOLD;
    } else {
      threshold = DEFAULT_CONFIDENCE_THRESHOLD;
    }
    
    console.log(`[TFLite] Checking confidence for ${label}: ${confidence.toFixed(3)} >= ${threshold}?`);
    return confidence >= threshold;
  }

  /**
   * Sends a Base64 image string to the native side for inference
   * @param imageBase64 base64 string of captured image
   * @returns Prediction result (label + confidence)
   */
  async predictBase64(
    imageBase64: string
  ): Promise<PredictionResult | null> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('[TFLite] Running in web mode - returning mock data');
      return {
        label: 'Mock Detection',
        confidence: 0.95,
      };
    }

    try {
      // Resize image to 640x640 before sending to native
      console.log('[TFLite] Resizing image to 640x640...');
      const resizedImage = await this.resizeImageTo640x640(imageBase64);
      
      console.log('[TFLite] Running inference on resized image...');
      const result = await TFLiteNative.runModelOnImage({
        imageBase64: resizedImage,
      });

      if (result && result.label && result.confidence !== undefined) {
        console.log(`[TFLite] Raw prediction: ${result.label} (${result.confidence})`);
        
        // Check if confidence meets threshold
        if (!this.isConfidenceSufficient(result.label, result.confidence)) {
          console.warn(`[TFLite] Confidence ${result.confidence} below threshold`);
          return null;
        }
        
        console.log('[TFLite] Valid prediction:', result);
        return result;
      } else {
        console.warn('[TFLite] No prediction returned from native.');
        return null;
      }
    } catch (err: any) {
      console.error('[TFLite] Error predicting:', err);
      throw new Error(`Failed to process image: ${err.message || err}`);
    }
  }
}

// Export a singleton instance
export default new TFLiteService();
