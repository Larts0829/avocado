import React from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  scanOutline, 
  cloudUploadOutline, 
  medkitOutline, 
  timeOutline, 
  bookOutline, 
  informationCircleOutline 
} from 'ionicons/icons';
import './Menu.css';

interface MenuCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

const Menu: React.FC = () => {
  const history = useHistory();

  const menuCards: MenuCard[] = [
    {
      id: 'capture',
      title: 'Capture',
      description: 'Avocado, Leaf, Disease, Pest',
      icon: scanOutline,
      color: '#10b981',
      route: '/capture'
    },
    {
      id: 'upload',
      title: 'Upload',
      description: 'Upload images of leaf or avocado',
      icon: cloudUploadOutline,
      color: '#f59e0b',
      route: '/upload'
    },
    {
      id: 'treatments',
      title: 'Treatments',
      description: 'Care actions and remedies',
      icon: medkitOutline,
      color: '#ef4444',
      route: '/treatments'
    },
    {
      id: 'history',
      title: 'History',
      description: 'View past analysis results',
      icon: timeOutline,
      color: '#06b6d4',
      route: '/history'
    },
    {
      id: 'guide',
      title: 'User Guide',
      description: 'User Manual',
      icon: bookOutline,
      color: '#8b5cf6',
      route: '/guide'
    },
    {
      id: 'about',
      title: 'About Us',
      description: 'Learn more about Snapocado',
      icon: informationCircleOutline,
      color: '#10b981',
      route: '/about'
    }
  ];

  const handleCardClick = (route: string) => {
    history.push(route);
  };

  return (
    <IonPage>
      <IonContent className="menu-content">
        <div className="menu-container">
          {/* Header */}
          <div className="menu-header">
            <div className="header-logo-section">
              <svg className="header-logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="32" cy="38" rx="20" ry="24" fill="#059669" />
                <circle cx="32" cy="38" r="10" fill="#92400e" />
                <circle cx="32" cy="38" r="6" fill="#fbbf24" />
                <path d="M32 14 Q28 10, 24 12 T20 8" stroke="#065f46" strokeWidth="2" fill="none" />
                <ellipse cx="24" cy="10" rx="3" ry="4" fill="#065f46" transform="rotate(-20 24 10)" />
              </svg>
              <div className="header-text">
                <h2 className="header-title">Snapocado</h2>
                <p className="header-subtitle">Snap.Detect.Protect</p>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="main-heading">
            How Can I Help<br />You <span className="heading-accent">Today?</span>
          </h1>

          {/* Menu Cards Grid */}
          <div className="menu-grid">
            {menuCards.map((card) => (
              <div 
                key={card.id}
                className="menu-card"
                onClick={() => handleCardClick(card.route)}
              >
                <div 
                  className="card-icon-wrapper"
                  style={{ backgroundColor: card.color }}
                >
                  <IonIcon icon={card.icon} className="card-icon" />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
