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
      title: "Kumuha",
      icon: cameraOutline,
      path: "/capture",
      description: "Abokado, Dahon, Sakit, Peste",
      color: "#10b981",
    },
    {
      title: "Mag-upload",
      icon: cloudUploadOutline,
      path: "/upload",
      description: "Mag-upload ng larawan ng dahon o abokado",
      color: "#f59e0b",
    },
    {
      title: "Mga Paraan ng Paggamot",
      icon: beakerOutline,
      path: "/treatments",
      description: "Mga aksyon sa pangangalaga at remedyo",
      color: "#ef4444",
    },
    { title: "Gabay", icon: helpCircleOutline, path: "/guide", description: "Manwal ng Gumagamit", color: "#8b5cf6" },
    { title: "Nakaraang Resulta", icon: timeOutline, path: "/history", description: "Tingnan ang nakaraang detections", color: "#06b6d4" },
    {
      title: "Tungkol",
      icon: informationCircleOutline,
      path: "/about",
      description: "Tungkol sa Snapocado",
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
              Paano Kita <span className="highlight">Matutulungan Ngayon?</span>
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
