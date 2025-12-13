import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import SymptomChecker from "./SymptomChecker";
import MedicationReminder from "./MedicationReminder";
import Dashboard from "./Dashboard";
import TeleConsultation from "./TeleConsultation";
import Prescriptions from "./Prescriptions";
import LabTests from "./LabTests";
import MedicalRecords from "./MedicalRecords";
import Records from "./Records";
import Billing from "./Billing";
import Messaging from "./Messaging";
import Notifications from "./Notifications";
import Profile from "./Profile";
import Settings from "./Settings";
import CreateMedicalRecord from "./CreateMedicalRecord";
import HomeVisits from "./HomeVisits";
import DoctorsList from "./DoctorsList";
import DoctorProfileEdit from "./DoctorProfileEdit";
import DoctorProfileView from "./DoctorProfileView";
import CommunityForum from "./CommunityForum";


function App() {
  const [page, setPage] = useState("home");
  const [userRole, setUserRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
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
    setPage("home");
    setSidebarOpen(false);
  };

  // Initialize dark mode from user settings on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const isDarkMode = user.darkMode || false;
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }, []);

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
      Patient: ['dashboard', 'medications', 'symptom', 'home-visits', 'tele', 'labtests', 'records', 'messages', 'notifications', 'doctors', 'forum'],
      Doctor: ['dashboard', 'medications', 'home-visits', 'tele', 'prescriptions', 'create-medical-record', 'labtests', 'records', 'billing', 'messages', 'notifications', 'doctor-profile-edit', 'forum'],
      Admin: ['dashboard', 'medications', 'home-visits', 'tele', 'prescriptions', 'labtests', 'records', 'billing', 'messages', 'notifications', 'doctors', 'forum']
    };

    return roleAccess[userRole]?.includes(pageToCheck) || false;
  };

  // Helper function to get navigation items based on role
  const getNavItems = () => {
    if (!userRole) return [];

    const navItems = {
      Patient: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Find Doctors', page: 'doctors' },
        { label: 'Medications', page: 'medications' },
        { label: 'Symptom Check', page: 'symptom' },
        { label: 'Home Visit Requests', page: 'home-visits' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Community Forum', page: 'forum' },
        { label: 'Messages', page: 'messages' },
        { label: '🔔', page: 'notifications', isIcon: true }
      ],
      Doctor: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Prescriptions', page: 'prescriptions' },
        { label: 'Create Medical Record', page: 'create-medical-record' },
        { label: 'Home Visit Requests', page: 'home-visits' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Billing', page: 'billing' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Community Forum', page: 'forum' },
        { label: 'Messages', page: 'messages' },
        { label: '🔔', page: 'notifications', isIcon: true }
      ],
      Admin: [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'All Doctors', page: 'doctors' },
        { label: 'Prescriptions', page: 'prescriptions' },
        { label: 'Lab Tests', page: 'labtests' },
        { label: 'Medical Records', page: 'records' },
        { label: 'Billing', page: 'billing' },
        { label: 'Tele-Consult', page: 'tele' },
        { label: 'Community Forum', page: 'forum' },
        { label: 'Messages', page: 'messages' },
        { label: '🔔', page: 'notifications', isIcon: true }
      ]
    };

    return navItems[userRole] || [];
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (userRole) {
      const fetchUnreadCount = async () => {
        const userId = localStorage.getItem('userId');
        try {
          const res = await fetch('/api/notifications', {
            headers: { 'x-user-id': userId }
          });
          const data = await res.json();
          if (data.ok) {
            const unread = data.notifications?.filter(n => !n.read).length || 0;
            setUnreadNotifications(unread);
          }
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole, page]);

  // Get role-based background gradient
  const getBackgroundClass = () => {
    if (!userRole) return 'bg-gradient-to-br from-blue-200 via-white to-pink-200';
    
    switch(userRole) {
      case 'Patient':
        return 'bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100';
      case 'Doctor':
        return 'bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100';
      case 'Admin':
        return 'bg-gradient-to-br from-slate-800 via-gray-700 to-slate-900';
      default:
        return 'bg-gradient-to-br from-blue-200 via-white to-pink-200';
    }
  };

  // Get role-based header styling
  const getHeaderClass = () => {
    if (!userRole) return 'global-header';
    
    switch(userRole) {
      case 'Patient':
        return 'global-header patient-header';
      case 'Doctor':
        return 'global-header doctor-header';
      case 'Admin':
        return 'global-header admin-header';
      default:
        return 'global-header';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {/* Sidebar */}
      {userRole && (
        <>
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Menu</h3>
              <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            </div>
            <div className="sidebar-content">
              <button className="sidebar-btn profile-btn" onClick={() => { setPage(userRole === 'Doctor' ? 'doctor-profile-edit' : 'profile'); setSidebarOpen(false); }}>
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

      <header className={getHeaderClass()}>
        <div className="brand">CLINICEASE</div>
        <div className="header-right">
          {userRole && <div className="role-badge">{userRole}</div>}
          {userRole && <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>}
        </div>
      </header>
      <main className="app-main" style={{ paddingTop: page === 'home' || page === 'login' || page === 'register' ? '0' : '88px' }}>
      {page === "home" && <Home onNavigate={setPage} onLoginSuccess={handleLoginSuccess} />}
      {(page === "register" || page === "login") && (
        <div className="flex flex-col items-center justify-start min-h-[calc(100vh-88px)]">
          <div className="w-full max-w-lg">
            {page === "register" && <Register onRegistered={handleRegistered} />}
            {page === "login" && <Login onLoginSuccess={handleLoginSuccess} />}
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
      )}
      {page !== "home" && page !== "register" && page !== "login" && (
        <div className="w-full">
          <div className={`bg-white shadow-md border-b border-gray-200 mb-6 nav-bar-wrapper ${userRole ? userRole.toLowerCase() + '-nav' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div />
              <nav className="top-nav" role="navigation" aria-label="Main Navigation">
                {getNavItems().map((item) => (
                  <button 
                    key={item.page}
                    onClick={async () => {
                      setPage(item.page);
                      // Auto-mark all notifications as read when clicking notification icon
                      if (item.page === 'notifications' && unreadNotifications > 0) {
                        const userId = localStorage.getItem('userId');
                        try {
                          await fetch('/api/notifications/mark-all-read', {
                            method: 'PATCH',
                            headers: { 'x-user-id': userId }
                          });
                          setUnreadNotifications(0);
                        } catch (err) {
                          console.error('Error marking notifications as read:', err);
                        }
                      }
                    }} 
                    className={`nav-btn ${page === item.page ? "active" : ""} ${item.isIcon ? "notification-btn" : ""}`}
                  >
                    {item.label}
                    {item.isIcon && unreadNotifications > 0 && (
                      <span className="notification-badge">{unreadNotifications}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Hero / quick actions area for the main page */}
          {page === 'dashboard' && (
            <div className={`page-hero max-w-7xl mx-auto px-4 mb-6 ${userRole ? userRole.toLowerCase() + '-hero' : ''}`}>
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
                        <button onClick={() => setPage('home-visits')} className="hero-btn outline">Request Home Visit</button>
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
          {page === "home-visits" && isPageAllowed('home-visits') && <HomeVisits />}
          {page === "tele" && isPageAllowed('tele') && <TeleConsultation />}
          {page === "prescriptions" && isPageAllowed('prescriptions') && <Prescriptions />}
          {page === "create-medical-record" && isPageAllowed('create-medical-record') && <CreateMedicalRecord />}
          {page === "labtests" && isPageAllowed('labtests') && <LabTests />}
          {page === "records" && isPageAllowed('records') && <Records />}
          {page === "billing" && isPageAllowed('billing') && <Billing />}
          {page === "messages" && isPageAllowed('messages') && <Messaging />}
          {page === "notifications" && isPageAllowed('notifications') && <Notifications />}
          {page === "doctors" && isPageAllowed('doctors') && <DoctorsList onViewProfile={setPage} />}
          {page === "doctor-profile-edit" && isPageAllowed('doctor-profile-edit') && <DoctorProfileEdit />}
          {page === "doctor-profile-view" && <DoctorProfileView onBack={() => setPage('doctors')} />}
          {page === "forum" && isPageAllowed('forum') && <CommunityForum />}

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
