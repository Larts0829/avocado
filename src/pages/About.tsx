import type React from "react"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons } from "@ionic/react"
import "./About.css"

interface TeamMember {
  name: string
  role: string
  description: string
  initials: string
}

const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "John Paul Devanadera",
      role: "Data Scientist",
      description: "Agricultural scientist with 15+ years of experience in crop disease detection and AI applications.",
      initials: "JP",
    },
    {
      name: "John Mar Vincent Lat",
      role: "Lead Developer",
      description: "Full-stack developer specializing in mobile applications and machine learning integration.",
      initials: "JM",
    },
    {
      name: "Irish Joanne Roxas",
      role: "Documentator",
      description: "Product strategist focused on creating intuitive solutions for agricultural challenges.",
      initials: "SR",
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
            <p>Revolutionizing avocado farming with AI-powered disease detection</p>
          </div>

          <div className="about-mission">
            <h2>Our Mission</h2>
            <p>
              We're dedicated to helping avocado farmers protect their crops through cutting-edge AI technology. By
              making disease detection accessible and affordable, we empower farmers to make informed decisions and
              maximize their yields.
            </p>
          </div>

          <div className="about-features">
            <h2>Why Choose Snapocado</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Accurate Detection</h3>
                <p>AI-powered analysis with 95%+ accuracy</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Instant Results</h3>
                <p>Get analysis results in seconds</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Easy to Use</h3>
                <p>Simple interface for all users</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Cost Effective</h3>
                <p>Affordable solution for farmers</p>
              </div>
            </div>
          </div>

          <div className="team-section">
            <h2>Our Team</h2>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.name} className="team-card">
                  <div className="team-avatar">{member.initials}</div>
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-description">{member.description}</p>
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
