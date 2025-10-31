import type React from "react"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons } from "@ionic/react"
import "./About.css"

interface TeamMember {
  name: string
  role: string
  description: string
  initials: string
  image: string
}

const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "John Paul Devanadera",
      role: "Member",
      description: "Agricultural scientist with 15+ years of experience in crop disease detection and AI applications.",
      initials: "JP",
      image: "/images/devanadera.jpg",
    },
    {
      name: "John Mar Vincent Lat",
      role: "Member",
      description: "Full-stack developer specializing in mobile applications and machine learning integration.",
      initials: "JM",
      image: "/images/lat.jpg",
    },
    {
      name: "Irish Joanne Roxas",
      role: "Member",
      description: "Product strategist focused on creating intuitive solutions for agricultural challenges.",
      initials: "SR",
      image: "/images/roxas.jpg",
    },
  ]

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="about-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>About Us</IonTitle>
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
            <p>A smart and user-friendly mobile app</p>
          </div>

          <div className="about-mission">
            <h2>What We Do</h2>
            <p>
              Snapocado is a mobile app designed to help detect avocado pests and diseases with just a snap.
            </p>
          </div>

          <div className="about-vision">
            <h2>Our Vision</h2>
            <p>
              We're a team of three passionate developers who share a common goal: to make technology 
              accessible and useful for local farmers.
            </p>
          </div>

          <div className="about-mission-statement">
            <h2>Our Mission</h2>
            <div className="mission-points">
              <div className="mission-point">
                <span className="point-icon">🎯</span>
                <p>Empower farmers with an easy-to-use detection tool</p>
              </div>
              <div className="mission-point">
                <span className="point-icon">⚡</span>
                <p>Save time and reduce guesswork in disease identification</p>
              </div>
              <div className="mission-point">
                <span className="point-icon">🌱</span>
                <p>Promote sustainable avocado production</p>
              </div>
            </div>
          </div>

          <div className="team-section">
            <h2>Our Team</h2>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.name} className="team-card">
                  <img src={member.image} alt={member.name} className="team-avatar-img" />
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default About
