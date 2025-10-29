import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>About Us</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>About Snapocado</h2>
          <p>Learn more about Snapocado</p>
          <p style={{ color: '#718096' }}>Coming soon...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
