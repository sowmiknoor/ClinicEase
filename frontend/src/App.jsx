

import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import SymptomChecker from "./SymptomChecker";
import MedicationReminder from "./MedicationReminder";
import Dashboard from "./Dashboard";
import HomeVisitScheduler from "./HomeVisitScheduler";
import TeleConsultation from "./TeleConsultation";
import Prescriptions from "./Prescriptions";
import LabTests from "./LabTests";
import Records from "./Records";
import Billing from "./Billing";
import Messaging from "./Messaging";
import Notifications from "./Notifications";
import Profile from "./Profile";
import Settings from "./Settings";
import { useState, useEffect } from "react";


function App() {
  const [page, setPage] = useState("home");
  const [userRole, setUserRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Handler to switch to login after registration
  const handleRegistered = () => setPage("login");
  const handleLoginSuccess = () => {
    const role = localStorage.getItem('userRole') || 'Patient';
    setUserRole(role);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUserRole(null);
    setPage("login");
    setSidebarOpen(false);
  };

  // Get user role from localStorage on mount
  useEffect(() => {
    if (page !== "login" && page !== "register" && page !== "home") {
      const role = localStorage.getItem('userRole') || 'Patient';
      setUserRole(role);
    }
  }, [page]);

  // Helper function to check if current page is allowed for user role
  const isPageAllowed = (pageToCheck) => {
    if (!userRole) return false;

    // Define role-based access
    const roleAccess = {
      Patient: ['dashboard', 'medications', 'symptom', 'visits', 'tele', 'labtests', 'records', 'messages', 'notifications'],
      Doctor: ['dashboard', 'medications', 'symptom', 'visits', 'tele', 'prescriptions', 'labtests', 'records', 'billing', 'messages', 'notifications'],
      Admin: ['dashboard', 'medications', 'symptom', 'visits', 'tele', 'prescriptions', 'labtests', 'records', 'billing', 'messages', 'notifications']
    };

    return roleAccess[userRole]?.includes(pageToCheck) || false;
  };

  // Helper function to get navigation items based on role
  const getNavItems = () => {
    if (!userRole) return [];

    const navItems = {
      Patient: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Medications', page: 'medications' },
        { label: 'Symptom Check', page: 'symptom' },
        { label: 'Home Visits', page: 'visits' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Messages', page: 'messages' },
        { label: 'Alerts', page: 'notifications' }
      ],
      Doctor: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Symptom Check', page: 'symptom' },
        { label: 'Prescriptions', page: 'prescriptions' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Billing', page: 'billing' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Messages', page: 'messages' },
        { label: 'Alerts', page: 'notifications' }
      ],
      Admin: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Symptom Check', page: 'symptom' },
        { label: 'Prescriptions', page: 'prescriptions' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Billing', page: 'billing' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Messages', page: 'messages' },
        { label: 'Alerts', page: 'notifications' }
      ]
    };

    return navItems[userRole] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-pink-200 py-10">
      {/* Sidebar */}
      {userRole && (
        <>
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Menu</h3>
              <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            </div>
            <div className="sidebar-content">
              <button className="sidebar-btn profile-btn" onClick={() => { setPage('profile'); setSidebarOpen(false); }}>
                <span className="icon">👤</span>
                <span>Profile</span>
              </button>
              <button className="sidebar-btn settings-btn" onClick={() => { setPage('settings'); setSidebarOpen(false); }}>
                <span className="icon">⚙️</span>
                <span>Settings</span>
              </button>
              <button className="sidebar-btn logout-btn" onClick={handleLogout}>
                <span className="icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
        </>
      )}

      <header className="global-header">
        <div className="brand">CLINICEASE</div>
        <div className="header-right">
          {userRole && <div className="role-badge">{userRole}</div>}
          {userRole && <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>}
        </div>
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
                {getNavItems().map((item) => (
                  <button 
                    key={item.page}
                    onClick={() => setPage(item.page)} 
                    className={`nav-btn ${page === item.page ? "active" : ""}`}
                  >
                    {item.label}
                  </button>
                ))}
                <button onClick={handleLogout} className="nav-btn logout">Logout</button>
              </nav>
            </div>
          </div>

          {/* Hero / quick actions area for the main page */}
          {page === 'dashboard' && (
            <div className="page-hero max-w-7xl mx-auto px-4 mb-6">
              <div className="hero-inner">
                <div className="hero-left">
                  <h2>Welcome to ClinicEase</h2>
                  <p className="lead">
                    {userRole === 'Patient' && 'Your health, organized — appointments, medications, and tele-consultations in one place.'}
                    {userRole === 'Doctor' && 'Manage patient care, prescriptions, and consultations efficiently.'}
                    {userRole === 'Admin' && 'Oversee all system operations and patient care management.'}
                  </p>
                  <div className="hero-actions">
                    {userRole === 'Patient' && (
                      <>
                        <button onClick={() => setPage('medications')} className="hero-btn">Medication Reminders</button>
                        <button onClick={() => setPage('visits')} className="hero-btn outline">Request Home Visit</button>
                        <button onClick={() => setPage('tele')} className="hero-btn">Book Tele-Consultation</button>
                      </>
                    )}
                    {userRole === 'Doctor' && (
                      <>
                        <button onClick={() => setPage('prescriptions')} className="hero-btn">Manage Prescriptions</button>
                        <button onClick={() => setPage('labtests')} className="hero-btn outline">View Lab Tests</button>
                        <button onClick={() => setPage('billing')} className="hero-btn">Manage Billing</button>
                      </>
                    )}
                    {userRole === 'Admin' && (
                      <>
                        <button onClick={() => setPage('prescriptions')} className="hero-btn">All Prescriptions</button>
                        <button onClick={() => setPage('billing')} className="hero-btn outline">System Billing</button>
                        <button onClick={() => setPage('records')} className="hero-btn">All Records</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="hero-right">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">Role</div>
                      <div className="stat-value">{userRole}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Status</div>
                      <div className="stat-value">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role-based page rendering with access control */}
          {page === "dashboard" && <Dashboard onNavigate={setPage} />}
          {page === "profile" && <Profile />}
          {page === "settings" && <Settings />}
          {page === "medications" && isPageAllowed('medications') && <MedicationReminder />}
          {page === "symptom" && isPageAllowed('symptom') && <SymptomChecker />}
          {page === "visits" && isPageAllowed('visits') && <HomeVisitScheduler />}
          {page === "tele" && isPageAllowed('tele') && <TeleConsultation />}
          {page === "prescriptions" && isPageAllowed('prescriptions') && <Prescriptions />}
          {page === "labtests" && isPageAllowed('labtests') && <LabTests />}
          {page === "records" && isPageAllowed('records') && <Records />}
          {page === "billing" && isPageAllowed('billing') && <Billing />}
          {page === "messages" && isPageAllowed('messages') && <Messaging />}
          {page === "notifications" && isPageAllowed('notifications') && <Notifications />}

          {/* Unauthorized access message */}
          {page && !['dashboard', 'home', 'profile', 'settings'].includes(page) && !isPageAllowed(page) && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-red-800 font-bold text-lg mb-2">Access Denied</h3>
                <p className="text-red-600">You don't have permission to access this feature as a {userRole}.</p>
                <button onClick={() => setPage('dashboard')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
