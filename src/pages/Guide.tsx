"use client"

import type React from "react"

import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons } from "@ionic/react"
import { useState } from "react"
import { chevronDownOutline, chevronUpOutline, rocketOutline, cameraOutline, cloudUploadOutline, timeOutline, constructOutline, medicalOutline } from "ionicons/icons"
import { IonIcon } from "@ionic/react"
import "./Guide.css"

interface GuideSection {
  id: string
  title: string
  content: React.ReactNode // Changed to React.ReactNode to support JSX
}

const Guide: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>("getting-started")

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Paano Magsimula",
      content:
        "Matuto ng mga basic ng Snapocado. Magsimula sa pamamagitan ng pagkuha ng larawan ng iyong halaman o prutas ng abokado. A-analyze ng aming AI ang larawan at magbibigay ng disease detection results sa loob ng ilang segundo.",
    },
    {
      id: "camera-capture",
      title: "Kumuha ng Larawan",
      content:
        "Kumuha ng mga larawan para sa instant analysis. Tiyaking may magandang liwanag at i-focus ang apektadong lugar. Maaari kang muling kumuha ng larawan hanggang masiyahan ka sa kalidad.",
    },
    {
      id: "upload-photos",
      title: "Mag-upload ng Larawan",
      content:
        "Mag-upload ng umiiral na mga larawan mula sa iyong gallery. Kasama sa supported formats ang JPG, PNG, at HEIC. Dapat malinaw at may magandang liwanag ang mga larawan para sa pinakamahusay na resulta.",
    },
    {
      id: "view-history",
      title: "Tingnan ang Kasaysayan",
      content:
        "Subaybayan ang iyong mga resulta ng analysis. I-access ang iyong na-save na detections, suriin ang nakaraang analyses, at subaybayan ang paglala ng sakit sa paglipas ng panahon.",
    },
    {
      id: "troubleshooting",
      title: "Pagtroubleshoot",
      content:
        "Karaniwang mga isyu at solusyon: Kung nabigo ang detection, tiyaking may magandang liwanag. Para sa mahinang resulta, muling kumuha na may mas mahusay na focus. Linisin ang app cache kung nakakaranas ng performance issues.",
    },
    {
      id: "treatments",
      title: "Gamot",
      content: (
        <>
          Matuto tungkol sa inirerekomendang gamot para sa nakita na mga isyu. Sundin ang gabay ng eksperto para sa disease management, pest control, at prevention strategies upang panatilihing malusog ang iyong mga halaman ng abokado.{" "}
          Para sa tulong mula sa <strong>City Agriculture Office ng San Pablo, Laguna</strong>, makipag-ugnayan sa kanilang hotline sa{" "}
          <a href="tel:+63495032229" className="hotline-link">
            (049) 503-2229
          </a>
          .
        </>
      ),
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
          <IonTitle>Gabay</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="guide-content">
        <div className="guide-container">
          <div className="guide-header">
            <h1>
              Paano Gamitin ang <span className="highlight">Snapocado</span>
            </h1>
            <p>Lahat ng kailangan mong malaman tungkol sa paggamit ng aming app</p>
          </div>

          <div className="guide-sections">
            {sections.map((section) => (
              <div key={section.id} className="guide-section">
                <button className="section-header" onClick={() => toggleSection(section.id)}>
                  <div className="section-title-wrapper">
                    <div className="section-icon">
                      {section.id === "getting-started" && <IonIcon icon={rocketOutline} />}
                      {section.id === "camera-capture" && <IonIcon icon={cameraOutline} />}
                      {section.id === "upload-photos" && <IonIcon icon={cloudUploadOutline} />}
                      {section.id === "view-history" && <IonIcon icon={timeOutline} />}
                      {section.id === "troubleshooting" && <IonIcon icon={constructOutline} />}
                      {section.id === "treatments" && <IonIcon icon={medicalOutline} />}
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
                    {typeof section.content === "string" ? <p>{section.content}</p> : section.content}
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