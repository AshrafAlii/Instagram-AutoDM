import { useApp } from '../context/AppContext.jsx';
import { automationApi } from '../api.js';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { auth, automation, refreshAutomation } = useApp();
  const navigate = useNavigate();

  const handleToggle = async () => {
    await automationApi.toggle();
    refreshAutomation();
  };

  const handleResetStats = async () => {
    await automationApi.resetStats();
    refreshAutomation();
  };

  return (
    <div className="animate-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Instagram auto DM automation status</p>
        </div>
        {auth.connected && (
          <button
            onClick={handleToggle}
            style={{
              ...styles.toggleBtn,
              background: automation.enabled ? 'var(--red-dim)' : 'var(--green-dim)',
              border: `1px solid ${automation.enabled ? 'var(--red)' : 'var(--green)'}`,
              color: automation.enabled ? 'var(--red)' : 'var(--green)',
            }}
          >
            {automation.enabled ? '⏸ Pause' : '▶ Resume'}
          </button>
        )}
      </div>

      {/* Connection banner */}
      {!auth.loading && !auth.connected && (
        <div style={styles.banner} onClick={() => navigate('/connect')}>
          <span>⚠️</span>
          <span>Connect your Instagram account to start automating DMs</span>
          <span style={styles.bannerArrow}>→</span>
        </div>
      )}

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total DMs Sent"
          value={automation.stats?.totalDmsSent || 0}
          icon="📨"
          color="var(--accent)"
        />
        <StatCard
          label="Session DMs"
          value={automation.stats?.sessionDmsSent || 0}
          icon="⚡"
          color="var(--green)"
          action={{ label: 'Reset', onClick: handleResetStats }}
        />
        <StatCard
          label="Active Rules"
          value={(automation.rules || []).filter(r => r.enabled).length}
          icon="🎯"
          color="var(--accent-2)"
          action={{ label: 'Manage', onClick: () => navigate('/automation') }}
        />
        <StatCard
          label="Status"
          value={!auth.connected ? 'Offline' : automation.enabled ? 'Active' : 'Paused'}
          icon={!auth.connected ? '🔌' : automation.enabled ? '🟢' : '⏸'}
          color={!auth.connected ? 'var(--text-3)' : automation.enabled ? 'var(--green)' : 'var(--yellow)'}
          isText
        />
      </div>

      {/* Rules preview */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Automation Rules</h2>
          <button style={styles.linkBtn} onClick={() => navigate('/automation')}>
            Manage all →
          </button>
        </div>

        {(automation.rules || []).length === 0 ? (
          <div style={styles.empty}>
            <span>No rules configured yet</span>
            <button style={styles.emptyBtn} onClick={() => navigate('/automation')}>
              Create your first rule
            </button>
          </div>
        ) : (
          <div style={styles.rulesList}>
            {(automation.rules || []).slice(0, 3).map(rule => (
              <div key={rule.id} style={styles.ruleCard}>
                <div style={styles.ruleTop}>
                  <span style={styles.keyword}>"{rule.keyword}"</span>
                  <span style={{
                    ...styles.ruleBadge,
                    background: rule.enabled ? 'var(--green-dim)' : 'var(--red-dim)',
                    color: rule.enabled ? 'var(--green)' : 'var(--red)',
                    border: `1px solid ${rule.enabled ? 'var(--green)' : 'var(--red)'}`,
                  }}>
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p style={styles.ruleMsg}>{rule.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, action, isText }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <span style={styles.statIcon}>{icon}</span>
        {action && (
          <button style={styles.statAction} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <div style={{ ...styles.statValue, color: isText ? color : 'var(--text)' }}>
        {value}
      </div>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statBar, background: color }} />
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-2)',
    fontSize: '14px',
  },
  toggleBtn: {
    padding: '8px 18px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.15s',
  },
  banner: {
    background: 'var(--yellow-dim)',
    border: '1px solid var(--yellow)',
    borderRadius: 'var(--radius)',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    marginBottom: '28px',
    color: 'var(--yellow)',
    fontSize: '14px',
  },
  bannerArrow: { marginLeft: 'auto' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statIcon: { fontSize: '20px' },
  statAction: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '3px 10px',
    color: 'var(--text-2)',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-1px',
    lineHeight: 1,
    marginBottom: '6px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    opacity: 0.4,
  },
  section: { marginBottom: '32px' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
  },
  empty: {
    background: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
  emptyBtn: {
    padding: '8px 20px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
  },
  rulesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  ruleCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
  },
  ruleTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  keyword: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--accent)',
    background: 'var(--accent-glow)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  ruleBadge: {
    marginLeft: 'auto',
    fontSize: '11px',
    padding: '2px 10px',
    borderRadius: '20px',
  },
  ruleMsg: {
    fontSize: '13px',
    color: 'var(--text-2)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
