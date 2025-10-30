import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';
import './Treatments.css';

const Treatments: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="treatments-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Treatments</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="treatments-content">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Treatments</h2>
          <p>Care actions and remedies</p>
          <p style={{ color: '#718096' }}>Coming soon...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Treatments;
