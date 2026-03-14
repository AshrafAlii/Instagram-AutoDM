import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Overview', icon: GridIcon },
  { to: '/automation', label: 'Automation', icon: ZapIcon },
  { to: '/logs', label: 'Activity Log', icon: ListIcon },
  { to: '/connect', label: 'Account', icon: UserIcon },
];

export default function Layout() {
  const { auth, automation } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>⚡</span>
          <span style={styles.logoText}>AutoDM</span>
        </div>

        <nav style={styles.nav}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <Icon size={16} />
              <span>{label}</span>
              {to === '/automation' && automation.rules.length > 0 && (
                <span style={styles.badge}>{automation.rules.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.statusDot}>
            <span style={{
              ...styles.dot,
              background: auth.connected
                ? (automation.enabled ? 'var(--green)' : 'var(--yellow)')
                : 'var(--text-3)'
            }} />
            <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>
              {auth.connected
                ? automation.enabled ? 'Active' : 'Paused'
                : 'Not connected'}
            </span>
          </div>
          {auth.connected && auth.instagram?.username && (
            <div style={styles.username}>@{auth.instagram.username}</div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    minWidth: '220px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
    paddingLeft: '8px',
  },
  logoMark: {
    fontSize: '20px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-2)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.15s',
    position: 'relative',
  },
  navLinkActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
  },
  badge: {
    marginLeft: 'auto',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '1px 8px',
    fontSize: '11px',
    color: 'var(--text-2)',
  },
  sidebarFooter: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusDot: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse-dot 2s ease-in-out infinite',
  },
  username: {
    fontSize: '12px',
    color: 'var(--text-3)',
    fontFamily: 'var(--font-mono)',
    paddingLeft: '16px',
  },
  main: {
    flex: 1,
    padding: '40px',
    maxWidth: '900px',
    overflow: 'auto',
  }
};

function GridIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}

function ZapIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 1L2 9h6l-1 6 7-8H8L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function ListIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function UserIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
