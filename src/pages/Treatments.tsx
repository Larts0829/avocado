import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const Treatments: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Treatments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
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
