import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',      to: '/dashboard' },
  { icon: '📋', label: 'All Interviews', to: '/interviews' },
  { icon: '🗂️', label: 'Kanban Board',  to: '/kanban' },
];

function Layout({ title, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="app-shell">

      {/* Overlay — closes sidebar when tapping outside */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>🎯 Interview <span>Tracker</span></h2>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-label">Planning</p>
          <ul className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={closeSidebar}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <p>{user?.name}</p>
              <span>{user?.email}</span>
            </div>
          </div>
          <ul className="sidebar-nav">
            <li>
              <button onClick={handleLogout}>
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-actions">{actions}</div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
}

export default Layout;
