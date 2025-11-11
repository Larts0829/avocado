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
      setError('Nabigo ang pagpili ng larawan mula sa gallery.');
    }
  };

  const processImage = async (imageData: string) => {
      if (!modelType) {
        setError('Mangyaring pumili muna ng uri ng detection.');
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
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
        setAnalysisComplete(false);
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      
      // Check if this is a "no detection" error
      if (errorMessage.includes('No avocado detected') || errorMessage.includes('below threshold') || errorMessage.includes('No detections found')) {
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
      } else {
        setError('WALANG MAKITANG AVOCADO O PROBLEMA');
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

      setError('Matagumpay na na-save sa history!');
      setTimeout(() => setError(null), 2000);
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
        'Mag-release ng predatory mites taun-taon',
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="upload-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Mag-upload at Suriin</IonTitle>
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

                <button className="upload-btn" onClick={handleUpload}>
                  <IonIcon icon={imagesOutline} />
                  <div>
                    <div className="upload-btn-title">Pumili mula sa Gallery</div>
                    <div className="upload-btn-subtitle">Pumili mula sa mga larawan</div>
                  </div>
                </button>

                <div className="upload-tips">
                  <h3 className="tips-title">Mga Tip para sa Pinakamahusay na Resulta</h3>
                  <div className="tips-list">
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Tiyaking may magandang liwanag kapag kumukuha ng larawan</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Panatilihing nakasentro at naka-focus ang paksa</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Iwasan ang anino o repleksyon</span>
                    </div>
                    <div className="tip-item">
                      <IonIcon icon={checkmarkCircleOutline} className="tip-icon" />
                      <span>Gumamit ng plain na background kung maaari</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed processing card - redundant with IonLoading */}
            </div>
          ) : (
            <div className="analysis-complete">
              <div className="analysis-header">
                <h2>Tapos na ang Analysis</h2>
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
                      <h3>{result.label.toLowerCase().includes('pest') || result.label.toLowerCase().includes('borer') || result.label.toLowerCase().includes('scale') || result.label.toLowerCase().includes('mite') ? 'Peste' : 'Sakit'} Nakita: <span className={result.label.toLowerCase().includes('healthy') ? 'status-healthy' : 'status-disease'}>{getDiseaseStatus(result.label)}</span></h3>
                    </div>

                    <p className="disease-description">{getDescription(result.label)}</p>

                    {/* Only show recommendations if object is detected (confidence >= 0.7) */}
                    {result && result.confidence >= 0.2 && (
                      <div className="recommendations">
                        <h4>Mga Rekomendasyon</h4>
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
                        I-save sa History
                      </IonButton>
                      <IonButton expand="block" className="new-analysis-btn" fill="outline" onClick={handleNewAnalysis}>
                        <IonIcon icon={refreshOutline} slot="start" />
                        Bagong Analysis
                      </IonButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <IonLoading isOpen={loading} message="Pinoproseso ang larawan..." />

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="RESULTA"
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Upload;