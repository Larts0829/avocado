import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonLoading,
  IonAlert,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { imagesOutline, checkmarkCircleOutline, closeOutline, saveOutline, refreshOutline, leafOutline, nutritionOutline } from 'ionicons/icons';
import tfliteService from '../services/tflite.service';
import { historyService } from '../services/history.service';
import './Upload.css';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PredictionResult {
  label: string;
  confidence: number;
  boundingBox?: BoundingBox;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface DetectionResult {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

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

const Upload: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'leaf' | 'tree' | 'fruit' | ''>('leaf');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleUpload = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      setImage(photo.dataUrl!);
      setResult(null);
      setAnalysisComplete(false);

      setTimeout(() => processImage(photo.dataUrl!), 300);
    } catch (err) {
      console.error('Gallery error:', err);
      setError('Failed to select image from gallery.');
    }
  };

  const processImage = async (imageData: string) => {
    if (!modelType) {
      setError('Please select a detection type first.');
      return;
    }
    
    setLoading(true);
    
    try {
      const modelFileName = modelType === 'leaf' ? 'leaf_model.tflite' : `${modelType}_model.tflite`;
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
        setAnalysisComplete(true);
      } else {
        setError('No avocado found in this photo.\n\nPlease take a clear, close-up picture of the avocado leaf, fruit, or tree in good daylight.\n\nMake sure it\'s centered and not too far away.\n\nNeed help? Call the City Agriculture Office of San Pablo, Laguna at (049) 503-2229 — they\'re ready to assist you!');
        setAnalysisComplete(false);
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      // Check if this is a "no detection" error
      if (errorMessage.includes('No avocado detected') || errorMessage.includes('below threshold') || errorMessage.includes('No detections found')) {
        setError('No avocado found in this photo.\n\nPlease take a clear, close-up picture of the avocado leaf, fruit, or tree in good daylight.\n\nMake sure it\'s centered and not too far away.\n\nNeed help? Call the City Agriculture Office of San Pablo, Laguna at (049) 503-2229 — they\'re ready to assist you!');
      } else {
        setError('Failed to process image: ' + errorMessage);
      }
      setAnalysisComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

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
          resolve(base64Image);
        }
      };
      img.src = base64Image;
    });
  };

  const saveToHistory = async () => {
    if (!result || !image) return;

    try {
      setLoading(true);

      const compressedImage = await compressImage(image, 600, 0.6);

      const type: 'Disease' | 'Pest' = result.label.toLowerCase().includes('pest') ||
                                        result.label.toLowerCase().includes('borer') ||
                                        result.label.toLowerCase().includes('scale') ||
                                        result.label.toLowerCase().includes('mite') ?
                                        'Pest' : 'Disease';

      await historyService.saveToHistory({
        type,
        label: result.label,
        confidence: result.confidence,
        modelType: modelType || 'leaf',
        imageData: compressedImage,
        description: getDescription(result.label),
        recommendations: getRecommendations(result.label)
      });

      setError('Saved to history successfully!');
      setTimeout(() => setError(null), 2000);
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

  const handleNewAnalysis = () => {
    setImage(null);
    setResult(null);
    setAnalysisComplete(false);
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getDiseaseStatus = (label: string): string => {
    if (label.toLowerCase().includes('healthy')) {
      return 'Healthy';
    }
    return capitalizeFirstLetter(label);
  };

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
        'Release predatory mites annually',
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="upload-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Upload & Analyze</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="upload-content" scrollY={!analysisComplete}>
        <div className="upload-container">
          {!analysisComplete ? (
            <div className="upload-main">
              <div className="upload-left">
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

                <button className="upload-btn" onClick={handleUpload}>
                  <IonIcon icon={imagesOutline} />
                  <div>
                    <div className="upload-btn-title">Choose from Gallery</div>
                    <div className="upload-btn-subtitle">Select from photos</div>
                  </div>
                </button>

                <div className="upload-tips">
                  <h3 className="tips-title">Tips for Best Results</h3>
                  <div className="tips-list">
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Ensure good lighting when taking photos</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Keep the subject centered and in focus</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Avoid shadows or reflections</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Use a plain background when possible</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed processing card - redundant with IonLoading */}
            </div>
          ) : (
            <div className="analysis-complete">
              <div className="analysis-header">
                <h2>Analysis Complete</h2>
                <button className="close-btn" onClick={handleNewAnalysis}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>

              <div className="analysis-content">
                <div className="analysis-image-container">
                  {image && (
                    <>
                      <img src={image} alt="Analyzed" className="analysis-image" />
                    </>
                  )}
                </div>

                {result && (
                  <div className="analysis-details">
                    <div className="disease-status">
                      <h3>{result.label.toLowerCase().includes('pest') || result.label.toLowerCase().includes('borer') || result.label.toLowerCase().includes('scale') || result.label.toLowerCase().includes('mite') ? 'Pest' : 'Disease'} Detected: <span className={result.label.toLowerCase().includes('healthy') ? 'status-healthy' : 'status-disease'}>{getDiseaseStatus(result.label)}</span></h3>
                    </div>

                    <p className="disease-description">{getDescription(result.label)}</p>

                    {/* Only show recommendations if object is detected (confidence >= 0.7) */}
                    {result && result.confidence >= 0.2 && (
                      <div className="recommendations">
                        <h4>Recommendations</h4>
                        <div className="recommendations-list">
                          {getRecommendations(result.label).map((rec, index) => (
                            <div key={index} className="recommendation-item">
                              <IonIcon icon={checkmarkCircleOutline} className="rec-icon" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="analysis-actions">
                      <IonButton expand="block" className="save-btn" onClick={saveToHistory}>
                        <IonIcon icon={saveOutline} slot="start" />
                        Save to History
                      </IonButton>
                      <IonButton expand="block" className="new-analysis-btn" fill="outline" onClick={handleNewAnalysis}>
                        <IonIcon icon={refreshOutline} slot="start" />
                        New Analysis
                      </IonButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <IonLoading isOpen={loading} message="Processing image..." />

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header={error?.includes('No avocado or disease detected') ? 'Detection Status' : error?.includes('successfully') ? 'Success' : 'Error'}
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Upload;