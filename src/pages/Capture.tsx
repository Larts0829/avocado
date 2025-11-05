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

// Helper function to get description based on label
const getDescription = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('healthy')) {
    return 'This appears healthy with good color and no visible signs of disease or pest damage.';
  }
  
  if (lowerLabel.includes('scab')) {
    return 'Scab is a fungal disease that causes dark, raised spots on fruits and leaves. An integrated management approach including sanitation, pruning, and fungicide application is essential for effective control.';
  }
  
  if (lowerLabel.includes('anthracnose')) {
    if (lowerLabel.includes('leaf')) {
      return 'Anthracnose on leaves causes dark spots and can lead to defoliation. Pruning infected parts, improving airflow, and early fungicide application every two weeks during rainy seasons can help manage this disease.';
    }
    return 'Anthracnose is a fungal disease that affects fruits, causing dark lesions. Remove infected material, apply copper fungicide after blossom drop, and ensure proper post-harvest cooling at 5°C to slow disease progression.';
  }
  
  if (lowerLabel.includes('powdery') || lowerLabel.includes('mildew')) {
    return 'Powdery mildew appears as white powdery spots on leaves. Spray sulfur fungicide regularly, or use a homemade baking soda solution (1 tbsp baking soda + ½ tsp soap per gallon of water). Prune infected parts and improve air circulation.';
  }
  
  if (lowerLabel.includes('mite')) {
    return 'Persea mites are tiny pests that cause yellow spots and webbing on leaves. Release predatory mites (Neoseiulus californicus) when 50% of leaves show infestation. Avoid chemical sprays that harm beneficial mites.';
  }
  
  if (lowerLabel.includes('borer')) {
    return 'Fruit borers create holes in fruits and can cause significant crop damage. Remove and destroy infested fruits, maintain clean orchard conditions, and apply organic insecticides like neem oil or Bt every 7-10 days during fruiting.';
  }
  
  return `${capitalizeFirstLetter(label)} detected. Immediate attention recommended.`;
};

// Helper function to get recommendations based on label
const getRecommendations = (label: string): string[] => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('healthy')) {
    return [
      'Continue current care routine',
      'Monitor for any changes',
      'Maintain proper watering schedule'
    ];
  }
  
  if (lowerLabel.includes('scab')) {
    return [
      'Remove and destroy infected fruits immediately',
      'Clean up fallen leaves and debris under trees',
      'Prune during dry periods to improve airflow',
      'Avoid overhead watering - use drip irrigation',
      'Apply copper-based fungicide every few weeks, especially during rainy periods',
      'Monitor regularly for new scab spots'
    ];
  }
  
  if (lowerLabel.includes('anthracnose')) {
    if (lowerLabel.includes('leaf')) {
      return [
        'Prune and remove infected leaves and twigs',
        'Improve canopy airflow through thinning',
        'Clean up fallen debris beneath the tree',
        'Apply copper fungicide early and repeat every 2 weeks during rainy season',
        'Follow label instructions and safety precautions when spraying'
      ];
    }
    return [
      'Remove dead fruits, leaves, and branches regularly',
      'Clean up debris under the tree canopy',
      'Prune for better airflow and reduced humidity',
      'Apply copper fungicide every 2 weeks after blossom drop',
      'Harvest during dry weather conditions',
      'Cool harvested fruit immediately and store at 5°C'
    ];
  }
  
  if (lowerLabel.includes('powdery') || lowerLabel.includes('mildew')) {
    return [
      'Spray sulfur fungicide regularly following product label',
      'Try homemade spray: 1 tbsp baking soda + ½ tsp liquid soap per gallon of water',
      'Prune infected leaves and shoots - do not compost',
      'Open canopy to improve sunlight and air circulation',
      'Repeat treatment weekly for 3-4 weeks until resolved',
      'Keep trees healthy with proper watering and nutrition'
    ];
  }
  
  if (lowerLabel.includes('mite')) {
    return [
      'Check leaves regularly for yellow spots and webbing',
      'Release Neoseiulus californicus (predatory mites) when 50% of leaves show infestation',
      'Release again when 75% of leaves are infested',
      'Avoid using insecticides/miticides that harm beneficial mites',
      'Release predatory mites annually (they don\'t survive winter)',
      'Maintain healthy trees with proper watering and nutrition'
    ];
  }
  
  if (lowerLabel.includes('borer')) {
    return [
      'Collect and destroy infested fruits with holes',
      'Remove fallen fruits and leaves around the tree',
      'Prune regularly to improve airflow and visibility',
      'Apply neem oil or Bt (Bacillus thuringiensis) every 7-10 days during fruiting',
      'Consider wrapping young fruits in paper/cloth bags',
      'Maintain continuous monitoring and sanitation'
    ];
  }
  
  return [
    'Early intervention recommended',
    'Monitor closely for spread',
    'Consider consulting local agricultural extension office',
    'Maintain good orchard sanitation'
  ];
};

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
        setImage(null);
        setError('No avocado or disease detected.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      setImage(null);
      
      // Check if this is a "not avocado" error from native code
      if (errorMessage.includes('No avocado detected') || errorMessage.includes('below threshold') || errorMessage.includes('No detections found')) {
        setError('No avocado or disease detected.');
      } else {
        setError('Failed to process image: ' + errorMessage);
      }
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
                                        result.label.toLowerCase().includes('scale') ||
                                        result.label.toLowerCase().includes('mite') ?
                                        'Pest' : 'Disease';

      // Generate description using helper function
      const description = getDescription(result.label);

      await historyService.saveToHistory({
        type,
        label: result.label,
        confidence: result.confidence,
        modelType,
        imageData: compressedImage,
        description,
        recommendations: getRecommendations(result.label)
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

      <IonContent className="capture-content" fullscreen scrollY={false}>
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
              <IonImg src="/images/instruction.png" alt="Instructions" className="instruction-image" />
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
                         result.label.toLowerCase().includes('scale') ||
                         result.label.toLowerCase().includes('mite') ? 'Pest' : 'Disease'} Detected
                      </div>
                      <div className="result-label">{capitalizeFirstLetter(result.label)}</div>
                    </div>
                  </div>
                  <p className="result-date">Analyzed: {new Date().toLocaleDateString()}</p>
                  
                  {result && (
                    <>
                      <div className="result-description">
                        <p>{getDescription(result.label)}</p>
                      </div>
                      
                      <div className="result-actions">
                        <h4>Recommended Actions</h4>
                        {getRecommendations(result.label).map((rec, index) => (
                          <div key={index} className="action-item">
                            <IonIcon icon={checkmarkCircleOutline} className="action-icon" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

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
          header="Detection Status"
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
