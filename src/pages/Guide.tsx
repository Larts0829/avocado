"use client"

import type React from "react"

import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons } from "@ionic/react"
import { useState } from "react"
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons"
import { IonIcon } from "@ionic/react"
import "./Guide.css"

interface GuideSection {
  id: string
  title: string
  content: string
}

const Guide: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>("getting-started")

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      content:
        "Learn the basics of Snapocado. Start by taking a photo of your avocado plant or fruit. Our AI will analyze the image and provide disease detection results within seconds.",
    },
    {
      id: "camera-capture",
      title: "Camera Capture",
      content:
        "Take photos for instant analysis. Ensure good lighting and focus on the affected area. You can retake photos until you're satisfied with the quality.",
    },
    {
      id: "upload-photos",
      title: "Upload Photos",
      content:
        "Upload existing photos from your gallery. Supported formats include JPG, PNG, and HEIC. Photos should be clear and well-lit for best results.",
    },
    {
      id: "view-results",
      title: "View Results",
      content:
        "After analysis, you'll receive detailed results including disease identification, severity level, and recommended treatments.",
    },
    {
      id: "pro-tips",
      title: "Pro Tips",
      content:
        "For best results: use natural lighting, focus on affected areas, take multiple angles, and ensure the plant is clearly visible in the frame.",
    },
  ]

  const toggleSection = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="guide-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>User Guide</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="guide-content">
        <div className="guide-container">
          <div className="guide-header">
            <h1>
              How to Use <span className="highlight">Snapocado</span>
            </h1>
            <p>Everything you need to know about using our app</p>
          </div>

          <div className="guide-sections">
            {sections.map((section) => (
              <div key={section.id} className="guide-section">
                <button className="section-header" onClick={() => toggleSection(section.id)}>
                  <div className="section-title-wrapper">
                    <div className="section-icon">
                      {section.id === "getting-started" && "🚀"}
                      {section.id === "camera-capture" && "📷"}
                      {section.id === "upload-photos" && "📤"}
                      {section.id === "view-results" && "✅"}
                      {section.id === "pro-tips" && "💡"}
                    </div>
                    <h3>{section.title}</h3>
                  </div>
                  <IonIcon
                    icon={expandedId === section.id ? chevronUpOutline : chevronDownOutline}
                    className="chevron-icon"
                  />
                </button>
                {expandedId === section.id && (
                  <div className="section-content">
                    <p>{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Guide
