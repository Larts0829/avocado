"use client"

import type React from "react"

import { IonPage, IonHeader, IonToolbar, IonContent } from "@ionic/react"
import { useHistory } from "react-router-dom"
import {
  cameraOutline,
  cloudUploadOutline,
  beakerOutline,
  helpCircleOutline,
  timeOutline,
  informationCircleOutline,
} from "ionicons/icons"
import { IonIcon } from "@ionic/react"
import "./Menu.css"

const Menu: React.FC = () => {
  const history = useHistory()

  const menuItems = [
    {
      title: "Capture",
      icon: cameraOutline,
      path: "/capture",
      description: "Avocado, Leaf, Disease, Pest",
      color: "#10b981",
    },
    {
      title: "Upload",
      icon: cloudUploadOutline,
      path: "/upload",
      description: "Upload images of leaf or avocado",
      color: "#f59e0b",
    },
    {
      title: "Treatments",
      icon: beakerOutline,
      path: "/treatments",
      description: "Care actions and remedies",
      color: "#ef4444",
    },
    { title: "User Guide", icon: helpCircleOutline, path: "/guide", description: "User Manual", color: "#8b5cf6" },
    { title: "History", icon: timeOutline, path: "/history", description: "View past detections", color: "#06b6d4" },
    {
      title: "About",
      icon: informationCircleOutline,
      path: "/about",
      description: "About Snapocado",
      color: "#ec4899",
    },
  ]

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="menu-toolbar">
          <div className="toolbar-content-left">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo" />
            <span className="toolbar-app-name">Snapocado</span>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="menu-content">
        <div className="menu-container">
          <div className="menu-header">
            <h1>
              How Can I Help You <span className="highlight">Today?</span>
            </h1>
          </div>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className="menu-card"
                onClick={() => history.push(item.path)}
                style={{ "--card-color": item.color } as React.CSSProperties}
              >
                <div className="card-icon">
                  <IonIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Menu
