import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const Upload: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Upload</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Upload Feature</h2>
          <p>Upload images of leaf or avocado</p>
          <p style={{ color: '#718096' }}>Coming soon...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Upload;
