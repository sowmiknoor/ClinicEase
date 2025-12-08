

import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import SymptomChecker from "./SymptomChecker";
import MedicationReminder from "./MedicationReminder";
import Dashboard from "./Dashboard";
import HomeVisitScheduler from "./HomeVisitScheduler";
import TeleConsultation from "./TeleConsultation";
import { useState } from "react";


function App() {
  const [page, setPage] = useState("home");
  // Handler to switch to login after registration
  const handleRegistered = () => setPage("login");
  const handleLoginSuccess = () => setPage("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-pink-200 py-10">
      <header className="global-header">
        <div className="brand">CLINICEASE</div>
      </header>
      <main className="app-main">
      {page === "register" || page === "login" ? (
        <div className="flex flex-col items-center justify-start min-h-[calc(100vh-88px)]">
          <div className="w-full max-w-lg">
            {page === "register" && <Register onRegistered={handleRegistered} />}
            {page === "login" && <Login onLoginSuccess={handleLoginSuccess} />}
            {page === "home" && <Home onNavigate={setPage} />}
          </div>
          <div className="auth-footer">
            {page === "register" ? (
              <span>Already have an account?{' '}
                <button onClick={() => setPage("login")}>Login</button>
              </span>
            ) : (
              <span>Don't have an account?{' '}
                <button onClick={() => setPage("register")}>Register</button>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-white shadow-md border-b border-gray-200 mb-6">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div />
              <nav className="top-nav" role="navigation" aria-label="Main Navigation">
                <button onClick={() => setPage("dashboard")} className={`nav-btn ${page === "dashboard" ? "active" : ""}`}>Dashboard</button>
                <button onClick={() => setPage("medications")} className={`nav-btn ${page === "medications" ? "active" : ""}`}>Medication Reminders</button>
                <button onClick={() => setPage("symptom")} className={`nav-btn ${page === "symptom" ? "active" : ""}`}>Symptom Checker</button>
                <button onClick={() => setPage("visits")} className={`nav-btn ${page === "visits" ? "active" : ""}`}>Home Visits</button>
                <button onClick={() => setPage("tele")} className={`nav-btn ${page === "tele" ? "active" : ""}`}>Tele-Consultations</button>
                <button onClick={() => setPage("login")} className="nav-btn logout">Logout</button>
              </nav>
            </div>
          </div>

          {/* Hero / quick actions area for the main page */}
          <div className="page-hero max-w-7xl mx-auto px-4 mb-6">
            <div className="hero-inner">
              <div className="hero-left">
                <h2>Welcome to ClinicEase</h2>
                <p className="lead">Your health, organized — appointments, medications, and tele-consultations in one place.</p>
                <div className="hero-actions">
                  <button onClick={() => setPage('medications')} className="hero-btn">Medication Reminders</button>
                  <button onClick={() => setPage('visits')} className="hero-btn outline">Request Home Visit</button>
                  <button onClick={() => setPage('tele')} className="hero-btn">Book Tele-Consultation</button>
                </div>
              </div>
              <div className="hero-right">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Upcoming</div>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Med Reminders</div>
                    <div className="stat-value">3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {page === "dashboard" && <Dashboard onNavigate={setPage} />}
          {page === "medications" && <MedicationReminder />}
          {page === "symptom" && <SymptomChecker />}
          {page === "visits" && <HomeVisitScheduler />}
          {page === "tele" && <TeleConsultation />}
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
