import { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState(null);
  const [pendingContent, setPendingContent] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [revenuePeriod, setRevenuePeriod] = useState('daily');

  useEffect(() => {
    fetchDashboardData();
    // Refresh active users every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'revenue') {
      fetchRevenueAnalytics();
    }
  }, [activeTab, revenuePeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchActiveUsers(),
        fetchRecentActivities(),
        fetchPendingContent()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      const data = await response.json();
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/active', {
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      const data = await response.json();
      if (data.ok) {
        setActiveUsers(data.activeUsers);
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/activities?limit=10', {
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      const data = await response.json();
      if (data.ok) {
        setRecentActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchPendingContent = async () => {
    try {
      const response = await fetch('/api/admin/pending-content', {
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      const data = await response.json();
      if (data.ok) {
        setPendingContent(data.pendingContent);
      }
    } catch (error) {
      console.error('Error fetching pending content:', error);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/revenue-analytics?period=${revenuePeriod}`, {
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      const data = await response.json();
      if (data.ok) {
        setRevenueData(data.revenueByPeriod);
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    }
  };

  const handlePublishContent = async (type, id, isPublished) => {
    try {
      const endpoint = type === 'tip' 
        ? `/api/admin/health-tips/${id}/publish`
        : `/api/admin/research-papers/${id}/publish`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId')
        },
        body: JSON.stringify({ isPublished })
      });
      
      const data = await response.json();
      if (data.ok) {
        alert(`Content ${isPublished ? 'published' : 'unpublished'} successfully!`);
        fetchPendingContent();
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/delete/${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': localStorage.getItem('userId') }
      });
      
      const data = await response.json();
      if (data.ok) {
        alert('User deleted successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/admin/users/status/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId')
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      const data = await response.json();
      if (data.ok) {
        alert(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🛡️ Admin Control Panel</h1>
        <p className="admin-subtitle">Complete system oversight and management</p>
      </header>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Active Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          💰 Revenue
        </button>
        <button 
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📝 Pending Content
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          🔄 Recent Activity
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="overview-section">
          <div className="stats-grid">
            {/* Users Stats */}
            <div className="stat-card users-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.users.total}</div>
                <div className="stat-breakdown">
                  <span>Patients: {stats.users.totalPatients}</span>
                  <span>Doctors: {stats.users.totalDoctors}</span>
                  <span>Admins: {stats.users.totalAdmins}</span>
                </div>
                <div className="stat-footer">
                  ✅ Active: {stats.users.activeUsers} | 🆕 New Today: {stats.users.newUsersToday}
                </div>
              </div>
            </div>

            {/* Appointments Stats */}
            <div className="stat-card appointments-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Appointments</h3>
                <div className="stat-number">{stats.appointments.total}</div>
                <div className="stat-breakdown">
                  <span>⏳ Pending: {stats.appointments.pending}</span>
                  <span>✅ Completed: {stats.appointments.completed}</span>
                  <span>❌ Cancelled: {stats.appointments.cancelled}</span>
                </div>
                <div className="stat-footer">
                  🆕 New Today: {stats.appointments.newToday}
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="stat-card revenue-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Financial Overview</h3>
                <div className="stat-number">৳{stats.financial.totalRevenue.toLocaleString()}</div>
                <div className="stat-breakdown">
                  <span>💳 Paid: {stats.financial.paidInvoices} invoices</span>
                  <span>⏰ Pending: ৳{stats.financial.pendingRevenue.toLocaleString()}</span>
                  <span>📄 Unpaid: {stats.financial.unpaidInvoices} invoices</span>
                </div>
                <div className="stat-footer">
                  Total Invoices: {stats.financial.totalInvoices}
                </div>
              </div>
            </div>

            {/* Services Stats */}
            <div className="stat-card services-card">
              <div className="stat-icon">🏥</div>
              <div className="stat-content">
                <h3>Services</h3>
                <div className="stat-number">{stats.services.totalPrescriptions + stats.services.totalHomeVisits}</div>
                <div className="stat-breakdown">
                  <span>💊 Prescriptions: {stats.services.totalPrescriptions}</span>
                  <span>🏠 Home Visits: {stats.services.totalHomeVisits}</span>
                  <span>⏳ Pending Visits: {stats.services.pendingHomeVisits}</span>
                </div>
              </div>
            </div>

            {/* Lab Tests Stats */}
            <div className="stat-card lab-card">
              <div className="stat-icon">🔬</div>
              <div className="stat-content">
                <h3>Lab Tests</h3>
                <div className="stat-number">{stats.labTests.total}</div>
                <div className="stat-breakdown">
                  <span>⏳ Pending: {stats.labTests.pending}</span>
                  <span>✅ Completed: {stats.labTests.completed}</span>
                </div>
              </div>
            </div>

            {/* Messages Stats */}
            <div className="stat-card messages-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>Messages</h3>
                <div className="stat-number">{stats.messages.total}</div>
                <div className="stat-breakdown">
                  <span>📩 Unread: {stats.messages.unread}</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="stat-card community-card">
              <div className="stat-icon">🌐</div>
              <div className="stat-content">
                <h3>Community</h3>
                <div className="stat-number">{stats.community.totalForumPosts}</div>
                <div className="stat-breakdown">
                  <span>📝 Forum Posts: {stats.community.totalForumPosts}</span>
                  <span>💡 Health Tips: {stats.community.totalHealthTips}</span>
                  <span>📄 Research Papers: {stats.community.totalResearchPapers}</span>
                </div>
                <div className="stat-footer">
                  🆕 New Posts Today: {stats.community.newPostsToday}
                </div>
              </div>
            </div>

            {/* Medical Records */}
            <div className="stat-card records-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>Medical Records</h3>
                <div className="stat-number">{stats.records.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="section-header">
            <h2>👥 Active Users ({activeUsers.length})</h2>
            <p>Users active in the last 15 minutes</p>
          </div>
          
          {activeUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users currently active</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.lastActive).toLocaleString()}</td>
                      <td>
                        <button 
                          className="btn-action btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="revenue-section">
          <div className="section-header">
            <h2>💰 Revenue Analytics</h2>
            <select 
              className="period-select"
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {stats && (
            <div className="revenue-summary">
              <div className="revenue-card">
                <h3>Total Revenue (Paid)</h3>
                <div className="revenue-amount">৳{stats.financial.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="revenue-card">
                <h3>Pending Revenue</h3>
                <div className="revenue-amount pending">৳{stats.financial.pendingRevenue.toLocaleString()}</div>
              </div>
              <div className="revenue-card">
                <h3>Paid Invoices</h3>
                <div className="revenue-amount">{stats.financial.paidInvoices}</div>
              </div>
              <div className="revenue-card">
                <h3>Unpaid Invoices</h3>
                <div className="revenue-amount pending">{stats.financial.unpaidInvoices}</div>
              </div>
            </div>
          )}

          <div className="revenue-chart">
            <h3>Revenue by {revenuePeriod.charAt(0).toUpperCase() + revenuePeriod.slice(1)}</h3>
            {revenueData.length === 0 ? (
              <div className="empty-state">No revenue data available</div>
            ) : (
              <div className="chart-bars">
                {revenueData.map((item, index) => (
                  <div key={index} className="chart-bar-item">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${(item.totalRevenue / Math.max(...revenueData.map(d => d.totalRevenue))) * 200}px` 
                      }}
                    >
                      <span className="bar-value">৳{item.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="bar-label">{item._id}</div>
                    <div className="bar-count">{item.count} invoices</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && pendingContent && (
        <div className="content-section">
          <h2>📝 Pending Content for Review</h2>
          
          {/* Pending Health Tips */}
          <div className="content-group">
            <h3>💡 Health Tips ({pendingContent.healthTips.length})</h3>
            {pendingContent.healthTips.length === 0 ? (
              <div className="empty-state">No pending health tips</div>
            ) : (
              <div className="content-list">
                {pendingContent.healthTips.map(tip => (
                  <div key={tip._id} className="content-item">
                    <div className="content-info">
                      <h4>{tip.icon} {tip.title}</h4>
                      <p>{tip.content}</p>
                      <span className="content-author">By: {tip.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="content-actions">
                      <button 
                        className="btn-action btn-success"
                        onClick={() => handlePublishContent('tip', tip._id, true)}
                      >
                        ✅ Publish
                      </button>
                      <button 
                        className="btn-action btn-danger"
                        onClick={() => handlePublishContent('tip', tip._id, false)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Research Papers */}
          <div className="content-group">
            <h3>📄 Research Papers ({pendingContent.researchPapers.length})</h3>
            {pendingContent.researchPapers.length === 0 ? (
              <div className="empty-state">No pending research papers</div>
            ) : (
              <div className="content-list">
                {pendingContent.researchPapers.map(paper => (
                  <div key={paper._id} className="content-item">
                    <div className="content-info">
                      <h4>{paper.title}</h4>
                      <p><strong>Authors:</strong> {paper.authors}</p>
                      <p><strong>Journal:</strong> {paper.journal} ({paper.year})</p>
                      <p>{paper.abstract.substring(0, 200)}...</p>
                      <span className="content-author">Uploaded by: {paper.uploadedBy?.name || 'Unknown'}</span>
                    </div>
                    <div className="content-actions">
                      <button 
                        className="btn-action btn-success"
                        onClick={() => handlePublishContent('paper', paper._id, true)}
                      >
                        ✅ Publish
                      </button>
                      <button 
                        className="btn-action btn-danger"
                        onClick={() => handlePublishContent('paper', paper._id, false)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && recentActivities && (
        <div className="activity-section">
          <h2>🔄 Recent Activity</h2>
          
          <div className="activity-group">
            <h3>👤 Recent Users</h3>
            <div className="activity-list">
              {recentActivities.recentUsers.map(user => (
                <div key={user._id} className="activity-item">
                  <span className="activity-icon">👤</span>
                  <div className="activity-content">
                    <strong>{user.name}</strong> ({user.role}) joined
                    <div className="activity-time">{new Date(user.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-group">
            <h3>📅 Recent Appointments</h3>
            <div className="activity-list">
              {recentActivities.recentAppointments.map(apt => (
                <div key={apt._id} className="activity-item">
                  <span className="activity-icon">📅</span>
                  <div className="activity-content">
                    <strong>{apt.patientId?.name}</strong> booked with Dr. {apt.doctorId?.name}
                    <div className="activity-time">{new Date(apt.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-group">
            <h3>💬 Recent Forum Posts</h3>
            <div className="activity-list">
              {recentActivities.recentPosts.map(post => (
                <div key={post._id} className="activity-item">
                  <span className="activity-icon">💬</span>
                  <div className="activity-content">
                    <strong>{post.author?.name}</strong> posted: {post.title}
                    <div className="activity-time">{new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
