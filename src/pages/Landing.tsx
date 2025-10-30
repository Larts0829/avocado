"use client"

import type React from "react"

import { IonPage, IonContent, IonButton } from "@ionic/react"
import { useHistory } from "react-router-dom"
import "./Landing.css"

const Landing: React.FC = () => {
  const history = useHistory()

  const handleStart = () => {
    history.replace("/menu")
  }

  return (
    <IonPage>
      <IonContent fullscreen className="landing-container">
        <div className="splash-screen">
          <div className="content-center">
            <div className="logo-wrapper">
              <img src="/images/logo_snapocado.png" alt="Snapocado" className="logo" />
            </div>
            <h1 className="app-title">Snapocado</h1>
            <p className="app-subtitle">Snap. Detect. Protect.</p>
          </div>
          <IonButton expand="block" className="start-button" onClick={handleStart}>
            Start
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Landing
