import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonModal,
  IonImg,
  IonActionSheet
} from '@ionic/react';
import { 
  trashOutline, 
  funnelOutline, 
  closeOutline,
  calendarOutline,
  timeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { historyService, HistoryItem } from '../services/history.service';
import './History.css';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'Disease' | 'Pest'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [stats, setStats] = useState({ total: 0, showing: 0 });

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    const items = await historyService.getFilteredHistory(filter);
    setHistory(items);
    
    const allItems = await historyService.getHistory();
    setStats({
      total: allItems.length,
      showing: items.length
    });
  };

  const handleClearHistory = async () => {
    await historyService.clearHistory();
    setHistory([]);
    setStats({ total: 0, showing: 0 });
    setShowClearConfirm(false);
  };

  const handleDeleteItem = async (id: string) => {
    await historyService.deleteHistoryItem(id);
    loadHistory();
  };

  const getTypeColor = (type: string) => {
    return type === 'Disease' ? '#a855f7' : '#f97316';
  };

  const getTypeBgColor = (type: string) => {
    return type === 'Disease' ? '#faf5ff' : '#fff7ed';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="history-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Nakaraang Resulta</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" style={{marginRight: '8px'}} />
            <IonButton onClick={() => setShowClearConfirm(true)}>
              <IonIcon icon={trashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="history-content">
        <div className="history-container">
          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Kabuuang Scans</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ipinapakita</div>
              <div className="stat-value">{stats.showing}</div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <h3 className="section-title">Kamakailan</h3>
            <button className="filter-btn" onClick={() => setShowFilterSheet(true)}>
              <IonIcon icon={funnelOutline} />
              <span>Filter</span>
            </button>
          </div>

          {/* History List */}
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>Walang scan history pa</p>
                <p className="empty-subtitle">Magsimulang kumuha para makita ang iyong mga resulta dito</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="history-card"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="card-image">
                    <IonImg src={item.imageData} alt={item.label} />
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <span className="card-type">{item.type}</span>
                      <span 
                        className="card-label"
                        style={{ color: getTypeColor(item.type) }}
                      >
                        {capitalizeFirstLetter(item.label)}
                      </span>
                    </div>
                    
                    <p className="card-description">{item.description}</p>
                    
                    <div className="card-meta">
                      <div className="meta-item">
                        <IonIcon icon={calendarOutline} />
                        <span>{item.date}</span>
                      </div>
                      <div className="meta-item">
                        <IonIcon icon={timeOutline} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <IonModal 
          isOpen={!!selectedItem} 
          onDidDismiss={() => setSelectedItem(null)}
          className="detail-modal"
        >
          {selectedItem && (
            <IonPage>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Mga Detalye</IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={() => setSelectedItem(null)}>
                      <IonIcon icon={closeOutline} />
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              
              <IonContent className="detail-content">
                <div className="detail-container">
                  {/* Image */}
                  <div className="detail-image">
                    <IonImg src={selectedItem.imageData} alt={selectedItem.label} />
                  </div>

                  {/* Detection Label */}
                  <div className="detail-header">
                    <div className="detection-type-label">
                      <IonIcon icon={checkmarkCircleOutline} className="detection-icon" />
                      <span>{selectedItem.type === 'Disease' ? 'Sakit' : 'Peste'} Nakita</span>
                    </div>
                    <div 
                      className="detail-label-badge"
                      style={{ 
                        backgroundColor: getTypeBgColor(selectedItem.type),
                        color: getTypeColor(selectedItem.type)
                      }}
                    >
                      {capitalizeFirstLetter(selectedItem.label)}
                    </div>
                  </div>

                  {/* Disease Analysis */}
                  <div className="detail-section">
                    <h3>Analysis ng Sakit</h3>
                    <p>{selectedItem.description}</p>
                    
                    <div className="detail-meta-row">
                      <div className="detail-meta-item">
                        <IonIcon icon={calendarOutline} />
                        <div>
                          <div className="meta-label">Petsa</div>
                          <div className="meta-value">{selectedItem.date}</div>
                        </div>
                      </div>
                      <div className="detail-meta-item">
                        <IonIcon icon={timeOutline} />
                        <div>
                          <div className="meta-label">Oras</div>
                          <div className="meta-value">{selectedItem.time}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="detail-section">
                    <h3>Mga Rekomendasyon</h3>
                    <div className="recommendations-list">
                      {selectedItem.recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <IonIcon icon={checkmarkCircleOutline} />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="detail-actions">
                    <IonButton 
                      expand="block" 
                      fill="outline"
                      color="success"
                      onClick={() => setSelectedItem(null)}
                    >
                      Isara
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      color="danger"
                      onClick={() => {
                        handleDeleteItem(selectedItem.id);
                        setSelectedItem(null);
                      }}
                    >
                      Tanggalin
                    </IonButton>
                  </div>
                </div>
              </IonContent>
            </IonPage>
          )}
        </IonModal>

        {/* Filter Action Sheet */}
        <IonActionSheet
          isOpen={showFilterSheet}
          onDidDismiss={() => setShowFilterSheet(false)}
          header="Filter ayon sa Uri"
          buttons={[
            {
              text: 'Lahat',
              handler: () => setFilter('all')
            },
            {
              text: 'Sakit Lamang',
              handler: () => setFilter('Disease')
            },
            {
              text: 'Peste Lamang',
              handler: () => setFilter('Pest')
            },
            {
              text: 'Kanselahin',
              role: 'cancel'
            }
          ]}
        />

        {/* Clear Confirmation */}
        <IonActionSheet
          isOpen={showClearConfirm}
          onDidDismiss={() => setShowClearConfirm(false)}
          header="Linisin ang lahat ng history?"
          subHeader="Hindi na mababalik ang aksyon na ito"
          buttons={[
            {
              text: 'Linisin Lahat',
              role: 'destructive',
              handler: handleClearHistory
            },
            {
              text: 'Kanselahin',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default History;
