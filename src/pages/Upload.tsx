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
        setAnalysisComplete(true);
      } else {
        setError('No detection results received.');
        setAnalysisComplete(false);
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process image: ' + (err as Error).message);
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
                                        result.label.toLowerCase().includes('scale') ?
                                        'Pest' : 'Disease';

      const description = type === 'Disease' ?
        `${result.label} detected on leaf.` :
        `${result.label} detected.`;

      const recommendations = [
        'Continue current care routine',
        'Monitor for any changes',
        'Maintain proper watering schedule'
      ];

      await historyService.saveToHistory({
        type,
        label: result.label,
        confidence: result.confidence,
        modelType: modelType || 'leaf',
        imageData: compressedImage,
        description,
        recommendations
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

  const getDiseaseStatus = (label: string): string => {
    if (label.toLowerCase().includes('healthy')) {
      return 'Healthy';
    }
    return label;
  };

  const getDescription = (label: string): string => {
    if (label.toLowerCase().includes('healthy')) {
      return 'The leaf appears healthy with good color and no visible signs of disease or pest damage.';
    }
    return `${label} detected on the leaf. Immediate attention may be required.`;
  };

  const getRecommendations = (label: string): string[] => {
    if (label.toLowerCase().includes('healthy')) {
      return [
        'Continue current care routine',
        'Monitor for any changes',
        'Maintain proper watering schedule'
      ];
    }
    return [
      'Early intervention recommended',
      'Monitor closely for spread',
      'Consider biological controls'
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
            <IonIcon icon={imagesOutline} style={{ fontSize: '1.5rem', marginRight: '1rem', color: '#10b981' }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="upload-content">
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

              {image && !result && (
                <div className="upload-right processing">
                  <div className="processing-card">
                    <h3>Processing Image...</h3>
                    <p>Please wait while we analyze your image</p>
                  </div>
                </div>
              )}
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
                      {result && (
                        <div className="confidence-overlay">
                          <IonIcon icon={checkmarkCircleOutline} />
                          <span>{(result.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {result && (
                  <div className="analysis-details">
                    <div className="disease-status">
                      <h3>Disease: <span className={result.label.toLowerCase().includes('healthy') ? 'status-healthy' : 'status-disease'}>{getDiseaseStatus(result.label)}</span></h3>
                    </div>

                    <p className="disease-description">{getDescription(result.label)}</p>

                    {/* Only show recommendations if object is detected (confidence >= 0.7) */}
                    {result && result.confidence >= 0.7 && (
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
          header={error?.includes('successfully') ? 'Success' : 'Error'}
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Upload;
