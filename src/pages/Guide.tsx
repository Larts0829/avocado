import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const Guide: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>User Guide</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>User Guide</h2>
          <p>User Manual</p>
          <p style={{ color: '#718096' }}>Coming soon...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Guide;
