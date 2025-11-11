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
    return 'Mukhang malusog ito na may magandang kulay at walang nakikitang palatandaan ng sakit o pinsala mula sa peste.';
  }
  
  if (lowerLabel.includes('scab')) {
    return 'Ang scab ay isang fungal disease na nagdudulot ng madilim at nakataas na mga spot sa prutas at dahon. Mahalaga ang integrated management approach na kasama ang sanitation, pruning, at fungicide application para sa epektibong kontrol.';
  }
  
  if (lowerLabel.includes('anthracnose')) {
    if (lowerLabel.includes('leaf')) {
      return 'Ang anthracnose sa dahon ay nagdudulot ng madilim na spot at maaaring magdulot ng pagkalagas ng dahon. Ang pruning ng apektadong bahagi, pagpapabuti ng airflow, at maagang paggamit ng fungicide tuwing dalawang linggo sa panahon ng tag-ulan ay makakatulong sa pag-manage ng sakit na ito.';
    }
    return 'Ang anthracnose ay isang fungal disease na umaapekto sa prutas, na nagdudulot ng madilim na lesyon. Alisin ang apektadong materyal, mag-apply ng copper fungicide pagkatapos ng blossom drop, at tiyakin ang tamang post-harvest cooling sa 5°C para pabagalin ang paglala ng sakit.';
  }
  
  if (lowerLabel.includes('powdery') || lowerLabel.includes('mildew')) {
    return 'Ang powdery mildew ay lumilitaw bilang puting pulbos na spot sa dahon. Mag-spray ng sulfur fungicide nang regular, o gumamit ng homemade baking soda solution (1 tbsp baking soda + ½ tsp soap bawat galon ng tubig). Prune ang apektadong bahagi at pagbutihin ang air circulation.';
  }
  
  if (lowerLabel.includes('mite')) {
    return 'Ang persea mites ay maliliit na peste na nagdudulot ng dilaw na spot at webbing sa dahon. Mag-release ng predatory mites (Neoseiulus californicus) kapag 50% ng dahon ay may infestation. Iwasan ang chemical sprays na nakakasira sa beneficial mites.';
  }
  
  if (lowerLabel.includes('borer')) {
    return 'Ang fruit borers ay gumagawa ng butas sa prutas at maaaring magdulot ng malaking pinsala sa ani. Alisin at sirain ang apektadong prutas, panatilihin ang malinis na kondisyon ng orchard, at mag-apply ng organic insecticides tulad ng neem oil o Bt tuwing 7-10 araw sa panahon ng fruiting.';
  }
  
  return `Nakita ang ${capitalizeFirstLetter(label)}. Inirerekomenda ang agarang atensyon.`;
};

// Helper function to get recommendations based on label
const getRecommendations = (label: string): string[] => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('healthy')) {
    return [
      'Ipagpatuloy ang kasalukuyang care routine',
      'Subaybayan ang anumang pagbabago',
      'Panatilihin ang tamang watering schedule'
    ];
  }
  
  if (lowerLabel.includes('scab')) {
    return [
      'Alisin at sirain agad ang apektadong prutas',
      'Linisin ang nahulog na dahon at debris sa ilalim ng puno',
      'Mag-prune sa tuyong panahon para mapabuti ang airflow',
      'Iwasan ang overhead watering - gumamit ng drip irrigation',
      'Mag-apply ng copper-based fungicide tuwing ilang linggo, lalo na sa panahon ng tag-ulan',
      'Regular na subaybayan para sa bagong scab spots'
    ];
  }
  
  if (lowerLabel.includes('anthracnose')) {
    if (lowerLabel.includes('leaf')) {
      return [
        'Prune at alisin ang apektadong dahon at twigs',
        'Pagbutihin ang canopy airflow sa pamamagitan ng thinning',
        'Linisin ang nahulog na debris sa ilalim ng puno',
        'Mag-apply ng copper fungicide nang maaga at ulitin tuwing 2 linggo sa panahon ng tag-ulan',
        'Sundin ang label instructions at safety precautions kapag nag-spray'
      ];
    }
    return [
      'Regular na alisin ang patay na prutas, dahon, at sanga',
      'Linisin ang debris sa ilalim ng tree canopy',
      'Mag-prune para sa mas mahusay na airflow at nabawasang humidity',
      'Mag-apply ng copper fungicide tuwing 2 linggo pagkatapos ng blossom drop',
      'Mag-harvest sa tuyong kondisyon ng panahon',
      'Palamigin agad ang na-harvest na prutas at i-store sa 5°C'
    ];
  }
  
  if (lowerLabel.includes('powdery') || lowerLabel.includes('mildew')) {
    return [
      'Mag-spray ng sulfur fungicide nang regular ayon sa product label',
      'Subukan ang homemade spray: 1 tbsp baking soda + ½ tsp liquid soap bawat galon ng tubig',
      'Prune ang apektadong dahon at shoots - huwag i-compost',
      'Buksan ang canopy para mapabuti ang sikat ng araw at air circulation',
      'Ulitin ang treatment linggo-linggo sa loob ng 3-4 na linggo hanggang malutas',
      'Panatilihing malusog ang puno sa tamang pagdidilig at nutrisyon'
    ];
  }
  
  if (lowerLabel.includes('mite')) {
    return [
      'Regular na suriin ang dahon para sa dilaw na spot at webbing',
      'Mag-release ng Neoseiulus californicus (predatory mites) kapag 50% ng dahon ay may infestation',
      'Mag-release ulit kapag 75% ng dahon ay apektado',
      'Iwasan ang paggamit ng insecticides/miticides na nakakasira sa beneficial mites',
      'Mag-release ng predatory mites taun-taon (hindi sila nakakaligtas sa taglamig)',
      'Panatilihing malusog ang puno sa tamang pagdidilig at nutrisyon'
    ];
  }
  
  if (lowerLabel.includes('borer')) {
    return [
      'Kolektahin at sirain ang apektadong prutas na may butas',
      'Alisin ang nahulog na prutas at dahon sa paligid ng puno',
      'Regular na mag-prune para mapabuti ang airflow at visibility',
      'Mag-apply ng neem oil o Bt (Bacillus thuringiensis) tuwing 7-10 araw sa panahon ng fruiting',
      'Isaalang-alang ang pagbabalot ng batang prutas sa paper/cloth bags',
      'Panatilihin ang tuloy-tuloy na monitoring at sanitation'
    ];
  }
  
  return [
    'Inirerekomenda ang maagang interbensyon',
    'Mabuti ang pagsubaybay para sa pagkalat',
    'Isaalang-alang ang pagkokonsulta sa lokal na agricultural extension office',
    'Panatilihin ang mabuting orchard sanitation'
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
        setError('Mangyaring pumili muna ng uri ng detection.');
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
      setError('Nabigo ang pagkuha ng larawan.');
    }
  };

  const processImage = async (imageData: string) => {
    if (!modelType) return;
    setLoading(true);
    
    try {
      const modelFileName = modelType === 'leaf' ? 'leaf_model.tflite' : `${modelType}_model.tflite`;
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
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      setImage(null);
      
      // Check if this is a "not avocado" error from native code
      if (errorMessage.includes('No avocado detected') || errorMessage.includes('below threshold') || errorMessage.includes('No detections found') || errorMessage.includes('Walang avocado na makita') || errorMessage.includes('Walang makita')) {
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
      } else {
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
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

      setSuccessMessage('Matagumpay na na-save sa history!');
      setShowResultModal(false);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to save to history:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      if (errorMessage.includes('quota') || errorMessage.includes('QuotaExceededError')) {
        setError('Puno na ang storage! Mangyaring linisin ang lumang history items.');
      } else {
        setError('Nabigo ang pag-save sa history');
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
          <IonTitle>Kumuha at Suriin</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="capture-content" fullscreen scrollY={false}>
        <div className="capture-container">
          {/* Model Type Selector */}
          <div className="model-selector">
            <h3 className="selector-title">Pumili ng Uri ng Detection</h3>
            <IonSegment 
              value={modelType} 
              onIonChange={e => setModelType(e.detail.value as 'leaf' | 'tree' | 'fruit')}
            >
              <IonSegmentButton value="leaf">
                <IonLabel>
                  <IonIcon icon={leafOutline} />
                  <div>DAHON</div>
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="fruit">
                <IonLabel>
                  <IonIcon icon={nutritionOutline} />
                  <div>PRUTAS</div>
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="tree">
                <IonLabel>
                  <IonIcon icon={leafOutline} />
                  <div>PUNO</div>
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Instruction Text */}
          <div className="instruction-text">
            <p className="instruction-main">Pindutin Ang Button Para Buksan Ang Camera</p>
          </div>

          {/* Camera Button */}
          <div className="camera-controls">
            <button className="capture-btn" onClick={handleCapture}>
              <div className="capture-btn-inner">
                <IonIcon icon={cameraOutline} />
              </div>
            </button>
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


          {/* Results Modal */}
          <IonModal isOpen={showResultModal} onDidDismiss={() => setShowResultModal(false)} className="ion-color-light">
            <IonHeader>
              <IonToolbar color="light">
                <IonTitle>Tapos na ang Detection</IonTitle>
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
                         result.label.toLowerCase().includes('mite') ? 'Peste' : 'Sakit'} Nakita
                      </div>
                      <div className="result-label">{capitalizeFirstLetter(result.label)}</div>
                    </div>
                  </div>
                  <p className="result-date">Nasuri: {new Date().toLocaleDateString()}</p>
                  
                  {result && (
                    <>
                      <div className="result-description">
                        <p>{getDescription(result.label)}</p>
                      </div>
                      
                      <div className="result-actions">
                        <h4>Inirerekomendang Aksyon</h4>
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
                      I-save sa History
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      fill="outline"
                      className="close-modal-btn"
                      onClick={() => setShowResultModal(false)}
                    >
                      Isara
                    </IonButton>
                  </div>
                </div>
              )}
            </IonContent>
          </IonModal>
        </div>

        <IonLoading isOpen={loading} message="Pinoproseso ang larawan..." />

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="RESULTA"
          message={error || ''}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage(null)}
          header="Tagumpay"
          message={successMessage || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Capture;
