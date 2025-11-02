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
          <IonTitle>About</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="about-content">
        <div className="about-container">
          <div className="about-header">
            <h1>
              About <span className="highlight">Snapocado</span>
            </h1>
            <p className="about-subtitle">
              Snapocado is your free, easy-to-use mobile app that helps avocado farmers detect diseases and pests — just by taking a photo.
            </p>
            <p className="about-subtitle-secondary">
               Snapocado uses smart technology to scan your avocado leaves, fruits, or trees and tell you what's wrong in seconds.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Do</h2>
            <div className="feature-list">
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>Detect problems early</h3>
                  <p>Identify issues like scab, anthracnose, mites, or borers quickly</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>Give simple, practical advice</h3>
                  <p>Receive step-by-step guidance on what to do next</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={checkmarkCircleOutline} className="feature-icon" />
                <div>
                  <h3>Save your results</h3>
                  <p>Track progress over time with your detection history</p>
                </div>
              </div>
              <div className="feature-item">
                <IonIcon icon={callOutline} className="feature-icon" />
                <div>
                  <h3>Connect you to experts</h3>
                  <p>Call the City Agriculture Office directly from the app</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section mission-section">
            <h2>Our Mission</h2>
            <p>
              To help every avocado farmer in San Pablo, Laguna grow healthier trees and stronger harvests — without guesswork.
            </p>
            <p className="mission-belief">
              We believe technology should be simple, free, and useful.
            </p>
          </div>

          <div className="about-section contact-section">
            <h2>Contact Us</h2>
            <div className="contact-card">
              <div className="contact-header">
                <h3>City Agriculture Office</h3>
                <p className="contact-subtitle">San Pablo, Laguna</p>
              </div>
              <div className="contact-details">
                <div className="contact-item">
                  <IonIcon icon={callOutline} className="contact-icon" />
                  <div>
                    <span className="contact-label">Phone</span>
                    <a href="tel:+63495032229" className="contact-value">(049) 503-2229</a>
                  </div>
                </div>
                <div className="contact-item">
                  <IonIcon icon={locationOutline} className="contact-icon" />
                  <div>
                    <span className="contact-label">Location</span>
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
