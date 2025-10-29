import React, { useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonImg,
  IonLoading,
  IonAlert,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { tfliteService } from '../services/tflite.service';
import './Home.css';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Define the base prediction type from the model
interface BasePrediction {
  label: string;
  confidence: number;
}

// Define the possible prediction result types
type PredictionResult = {
  label: string;
  confidence: number;
} & (
  | { boundingBox: BoundingBox }
  | BoundingBox
);

type DetectionResult = {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Type guard to check if an object has boundingBox property
function hasBoundingBox(obj: any): obj is { boundingBox: BoundingBox } {
  return 'boundingBox' in obj && obj.boundingBox !== undefined;
}

// Type guard to check if an object has x, y, width, height properties
function isBoundingBox(obj: any): obj is BoundingBox {
  return (
    'x' in obj &&
    'y' in obj &&
    'width' in obj &&
    'height' in obj
  );
}

const Home: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'leaf' | 'tree' | 'fruit' | ''>('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLIonImgElement>(null);

  /** Capture photo using Capacitor Camera */
  const handleCapture = async () => {
    try {
      if (!modelType) {
        setError('Please select a capture type first.');
        return;
      }

      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      setImage(photo.dataUrl!);
      setResult(null);

      // Small delay to allow image render before processing
      setTimeout(() => processImage(photo.dataUrl!), 300);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to capture image.');
    }
  };

  /** Send image to TensorFlow Lite backend for inference */
  const processImage = async (imageData: string) => {
    if (!modelType) return;
    setLoading(true);
    
    try {
      // Load selected model
      // Load model with both model and label paths
      const modelFileName = modelType === 'leaf' ? 'leaf_model_holder.tflite' : `${modelType}_model.tflite`;
      const modelPath = `models/${modelFileName}`;
      const labelPath = `models/${modelType}_labels.txt`;
      await tfliteService.loadModel(modelPath, labelPath);

      // Predict using predictBase64
      const prediction = await tfliteService.predictBase64(imageData) as PredictionResult;

      if (prediction) {
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;
        
        // Handle different prediction result formats
        if (hasBoundingBox(prediction)) {
          // If prediction has a boundingBox property
          const bbox = prediction.boundingBox;
          x = bbox.x;
          y = bbox.y;
          width = bbox.width;
          height = bbox.height;
        } else if (isBoundingBox(prediction)) {
          // If prediction is a bounding box itself
          x = prediction.x;
          y = prediction.y;
          width = prediction.width;
          height = prediction.height;
        }
        
        const result: DetectionResult = {
          label: prediction.label,
          confidence: prediction.confidence,
          x,
          y,
          width,
          height
        };
        
        setResult(result);
      } else {
        setError('No detection results received.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process image: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /** Draw bounding boxes on canvas overlay */
  const drawBoundingBoxes = (prediction: DetectionResult) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a new image to get dimensions
    const imgElement = new Image();
    imgElement.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get coordinates from the detection result
      const x = prediction.x;
      const y = prediction.y;
      const width = prediction.width;
      const height = prediction.height;
      
      // Only draw if we have valid dimensions
      if (width > 0 && height > 0) {
        // Draw bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        ctx.fillStyle = 'red';
        const label = `${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`;
        ctx.font = 'bold 16px Arial';
        const textMetrics = ctx.measureText(label);
        const labelY = Math.max(0, y - 5); // Ensure label is visible
        ctx.fillRect(x, labelY - 20, textMetrics.width + 10, 20);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, labelY - 5);
      }
    };
    
    // Set the image source to trigger the onload event
    imgElement.src = image;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get coordinates from the detection result
    const x = prediction.x;
    const y = prediction.y;
    const width = prediction.width;
    const height = prediction.height;
    
    // Draw bounding box
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    ctx.fillStyle = 'red';
    const label = `${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`;
    ctx.font = 'bold 16px Arial';
    const textMetrics = ctx.measureText(label);
    ctx.fillRect(x, y - 25, textMetrics.width + 10, 25);

    // Draw label text
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + 5, y - 7);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle> Avocado Detector</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonSelect
              placeholder="Select Detection Type"
              value={modelType}
              onIonChange={e => {
                setModelType(e.detail.value);
                setResult(null);
                setImage(null);
              }}
              interface="action-sheet"
            >
              <IonSelectOption value="fruit"> Fruit Detection</IonSelectOption>
              <IonSelectOption value="leaf"> Leaf Detection</IonSelectOption>
              <IonSelectOption value="tree"> Tree Detection</IonSelectOption>
            </IonSelect>

            <IonButton
              expand="block"
              color="primary"
              className="ion-margin-top"
              onClick={handleCapture}
              disabled={!modelType}
            >
              Capture Image
            </IonButton>
          </IonCardContent>
        </IonCard>

        {image && (
          <div style={{ position: 'relative', marginTop: 20 }}>
            <IonImg 
              ref={imageRef as any}
              src={image || ''}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                display: image ? 'block' : 'none'
              }}
              alt="Captured"
            ></IonImg>
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {result && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Result</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div>
                <p>Label: {result.label}</p>
                <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        <IonLoading isOpen={loading} message="Processing image..." />

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Error"
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;