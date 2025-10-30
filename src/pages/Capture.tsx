import React, { useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonImg,
  IonLoading,
  IonAlert,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonModal
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { flashlightOutline, cameraOutline, checkmarkCircleOutline, leafOutline, nutritionOutline } from 'ionicons/icons';
import tfliteService from '../services/tflite.service';
import { historyService } from '../services/history.service';
import './Capture.css';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BasePrediction {
  label: string;
  confidence: number;
}

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

function hasBoundingBox(obj: any): obj is { boundingBox: BoundingBox } {
  return 'boundingBox' in obj && obj.boundingBox !== undefined;
}

function isBoundingBox(obj: any): obj is BoundingBox {
  return (
    'x' in obj &&
    'y' in obj &&
    'width' in obj &&
    'height' in obj
  );
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

const Capture: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'leaf' | 'tree' | 'fruit' | ''>('leaf');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLIonImgElement>(null);

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

      setTimeout(() => processImage(photo.dataUrl!), 300);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to capture image.');
    }
  };

  const processImage = async (imageData: string) => {
    if (!modelType) return;
    setLoading(true);
    
    try {
      const modelFileName = modelType === 'leaf' ? 'leaf_model_holder.tflite' : `${modelType}_model.tflite`;
      const modelPath = `models/${modelFileName}`;
      const labelPath = `models/${modelType}_labels.txt`;
      await tfliteService.loadModel(modelPath, labelPath);

      const prediction = await tfliteService.predictBase64(imageData) as PredictionResult;

      if (prediction) {
        // Native code handles per-class thresholds:
        // Fruit: "Healthy fruit": 0.50, "scab": 0.50, "anthracnose": 0.60, "borer": 0.50
        // Tree and Leaf: use default 0.5 threshold
        
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;
        
        if (hasBoundingBox(prediction)) {
          const bbox = prediction.boundingBox;
          x = bbox.x;
          y = bbox.y;
          width = bbox.width;
          height = bbox.height;
        } else if (isBoundingBox(prediction)) {
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
        setShowResultModal(true);
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

  // Compress image to reduce storage size
  const compressImage = async (base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Image); // Fallback to original
        }
      };
      img.src = base64Image;
    });
  };

  const saveToHistory = async () => {
    if (!result || !image || !modelType) return;

    try {
      setLoading(true);

      // Compress image to save storage space
      const compressedImage = await compressImage(image, 600, 0.6);

      // Determine if it's Disease or Pest based on label
      const type: 'Disease' | 'Pest' = result.label.toLowerCase().includes('pest') ||
                                        result.label.toLowerCase().includes('borer') ||
                                        result.label.toLowerCase().includes('scale') ?
                                        'Pest' : 'Disease';

      // Generate description based on type
      const description = type === 'Disease' ?
        `${result.label} detected on ${modelType}.` :
        `${result.label} detected.`;

      // Generate recommendations
      const recommendations = [
        'Early intervention recommended',
        'Monitor closely for spread',
        'Consider biological controls'
      ];

      await historyService.saveToHistory({
        type,
        label: result.label,
        confidence: result.confidence,
        modelType,
        imageData: compressedImage,
        description,
        recommendations
      });

      setSuccessMessage('Saved to history successfully!');
      setShowResultModal(false);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to save to history:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      if (errorMessage.includes('quota') || errorMessage.includes('QuotaExceededError')) {
        setError('Storage full! Please clear old history items.');
      } else {
        setError('Failed to save to history');
      }
    } finally {
      setLoading(false);
    }
  };

  const drawBoundingBoxes = (prediction: DetectionResult) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgElement = new Image();
    imgElement.onload = () => {
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const x = prediction.x;
      const y = prediction.y;
      const width = prediction.width;
      const height = prediction.height;
      
      if (width > 0 && height > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#10b981';
        const label = `${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`;
        ctx.font = 'bold 16px Arial';
        const textMetrics = ctx.measureText(label);
        const labelY = Math.max(0, y - 5);
        ctx.fillRect(x, labelY - 20, textMetrics.width + 10, 20);

        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, labelY - 5);
      }
    };
    
    imgElement.src = image;
  };

  React.useEffect(() => {
    if (result && image) {
      drawBoundingBoxes(result);
    }
  }, [result, image]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="capture-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Snap and Analyze</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="capture-content">
        <div className="capture-container">
          {/* Model Type Selector */}
          <div className="model-selector">
            <h3 className="selector-title">Select Detection Type</h3>
            <IonSegment 
              value={modelType} 
              onIonChange={e => setModelType(e.detail.value as 'leaf' | 'tree' | 'fruit')}
            >
              <IonSegmentButton value="leaf">
                <IonLabel>
                  <IonIcon icon={leafOutline} />
                  <div>Leaf</div>
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="fruit">
                <IonLabel>
                  <IonIcon icon={nutritionOutline} />
                  <div>Fruit</div>
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="tree">
                <IonLabel>
                  <IonIcon icon={leafOutline} />
                  <div>Tree</div>
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Camera View Area */}
          <div className="camera-area">
            {image ? (
              <div className="image-preview-container">
                <IonImg 
                  ref={imageRef as any}
                  src={image}
                  className="captured-image"
                  alt="Captured"
                />
                <canvas
                  ref={canvasRef}
                  className="bounding-canvas"
                />
              </div>
            ) : (
              <div className="camera-placeholder">
                <IonIcon icon={cameraOutline} className="camera-placeholder-icon" />
                <p>Ready to capture</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="camera-controls">
            <button className="control-btn secondary">
              <IonIcon icon={flashlightOutline} />
            </button>
            
            <button className="capture-btn" onClick={handleCapture}>
              <div className="capture-btn-inner">
                <IonIcon icon={cameraOutline} />
              </div>
            </button>
            
            <button className="control-btn secondary">
              <IonIcon icon={cameraOutline} />
            </button>
          </div>

          {/* Results Modal */}
          <IonModal isOpen={showResultModal} onDidDismiss={() => setShowResultModal(false)} className="ion-color-light">
            <IonHeader>
              <IonToolbar color="light">
                <IonTitle>Detection Complete</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="modal-content ion-color-light">
              {result && (
                <div className="modal-results-container">
                  {/* Show captured image */}
                  {image && (
                    <div className="modal-image-preview">
                      <IonImg src={image} alt="Captured" />
                    </div>
                  )}
                  
                  <div className="detection-label-section">
                    <IonIcon icon={checkmarkCircleOutline} className="detection-check-icon" />
                    <div>
                      <div className="detection-type-text">
                        {result.label.toLowerCase().includes('pest') || 
                         result.label.toLowerCase().includes('borer') || 
                         result.label.toLowerCase().includes('scale') ? 'Pest' : 'Disease'} Detected
                      </div>
                      <div className="result-label">{capitalizeFirstLetter(result.label)}</div>
                    </div>
                  </div>
                  <p className="result-date">Analyzed: {new Date().toLocaleDateString()}</p>
                  
                  <div className="result-actions">
                    <h4>Immediate Actions</h4>
                    <div className="action-item">
                      <IonIcon icon={checkmarkCircleOutline} className="action-icon" />
                      <span>Early intervention recommended</span>
                    </div>
                    <div className="action-item">
                      <IonIcon icon={checkmarkCircleOutline} className="action-icon" />
                      <span>Monitor closely for spread</span>
                    </div>
                    <div className="action-item">
                      <IonIcon icon={checkmarkCircleOutline} className="action-icon" />
                      <span>Consider biological controls</span>
                    </div>
                  </div>

                  <div className="modal-buttons">
                    <IonButton 
                      expand="block" 
                      className="save-history-btn"
                      onClick={saveToHistory}
                    >
                      Save to History
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      fill="outline"
                      className="close-modal-btn"
                      onClick={() => setShowResultModal(false)}
                    >
                      Close
                    </IonButton>
                  </div>
                </div>
              )}
            </IonContent>
          </IonModal>
        </div>

        <IonLoading isOpen={loading} message="Processing image..." />

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Error"
          message={error || ''}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage(null)}
          header="Success"
          message={successMessage || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Capture;
