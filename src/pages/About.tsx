import type React from "react"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonIcon } from "@ionic/react"
import { callOutline, locationOutline, checkmarkCircleOutline } from "ionicons/icons"
import "./About.css"

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="about-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Tungkol</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="about-content">
        <div className="about-container">
          <div className="about-header">
            <h1>
              Tungkol sa <span className="highlight">Snapocado</span>
            </h1>
            <p className="about-subtitle">
              Ang Snapocado ay iyong libre at madaling gamitin na mobile app na tumutulong sa mga magsasaka ng abokado na makita ang mga sakit at peste — sa pamamagitan lamang ng pagkuha ng larawan.
            </p>
            <p className="about-subtitle-secondary">
               Gumagamit ang Snapocado ng matalinong teknolohiya upang i-scan ang iyong mga dahon, prutas, o puno ng abokado at sabihin sa iyo kung ano ang problema sa loob ng ilang segundo.
            </p>
          </div>

          <div className="about-section">
            <h2>Ano ang Aming Ginagawa</h2>
            <div className="feature-list">
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>Makita ang mga problema nang maaga</h3>
                  <p>Kilalanin ang mga isyu tulad ng scab, anthracnose, mites, o borers nang mabilis</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>Magbigay ng simple at praktikal na payo</h3>
                  <p>Makatanggap ng step-by-step na gabay sa kung ano ang susunod na gagawin</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>I-save ang iyong mga resulta</h3>
                  <p>Subaybayan ang pag-unlad sa paglipas ng panahon gamit ang iyong detection history</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={callOutline} className="feature-icon" />
                <div>
                  <h3>Ikonekta ka sa mga eksperto</h3>
                  <p>Tumawag sa City Agriculture Office nang direkta mula sa app</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section contact-section">
            <h2>Makipag-ugnayan</h2>
            <div className="contact-card">
              <div className="contact-header">
                <h3>City Agriculture Office</h3>
                <p className="contact-subtitle">San Pablo, Laguna</p>
              </div>
              <div className="contact-details">
                <div className="contact-item">
                  <IonIcon icon={callOutline} className="contact-icon" />
                  <div>
                    <span className="contact-label">Telepono</span>
                    <a href="tel:+63495032229" className="contact-value">(049) 503-2229</a>
                  </div>
                </div>
                <div className="contact-item">
                  <IonIcon icon={locationOutline} className="contact-icon" />
                  <div>
                    <span className="contact-label">Lokasyon</span>
                    <span className="contact-value">386M+VWF, San Pablo City, Laguna</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default About
