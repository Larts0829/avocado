import React from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const history = useHistory();

  const handleStart = () => {
    history.push('/menu');
  };

  return (
    <IonPage>
      <IonContent className="landing-content">
        <div className="landing-container">
          <div className="logo-container">
            {/* Avocado Logo SVG */}
            <svg className="app-logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="32" cy="38" rx="20" ry="24" fill="#059669" />
              <circle cx="32" cy="38" r="10" fill="#92400e" />
              <circle cx="32" cy="38" r="6" fill="#fbbf24" />
              <path d="M32 14 Q28 10, 24 12 T20 8" stroke="#065f46" strokeWidth="2" fill="none" />
              <ellipse cx="24" cy="10" rx="3" ry="4" fill="#065f46" transform="rotate(-20 24 10)" />
            </svg>
          </div>
          
          <h1 className="app-title">
            Snap<span className="title-accent">ocado</span>
          </h1>
          
          <p className="app-tagline">Snap.Detect.Protect</p>
          
          <IonButton 
            className="start-button" 
            onClick={handleStart}
            expand="block"
          >
            Start
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
