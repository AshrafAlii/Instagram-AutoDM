import { useApp } from '../context/AppContext.jsx';
import { authApi } from '../api.js';
import { useState } from 'react';

export default function Connect() {
  const { auth, refreshAuth } = useApp();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = () => {
    window.location.href = authApi.loginUrl();
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Instagram account?')) return;
    setDisconnecting(true);
    try {
      await authApi.disconnect();
      refreshAuth();
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="animate-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Instagram Account</h1>
        <p style={styles.subtitle}>Connect your Business or Creator account</p>
      </div>

      {auth.connected ? (
        <div style={styles.connectedCard}>
          <div style={styles.connectedTop}>
            <div style={styles.avatar}>
              {auth.instagram?.username?.charAt(0).toUpperCase() || 'I'}
            </div>
            <div>
              <div style={styles.connectedUsername}>@{auth.instagram?.username}</div>
              <div style={styles.connectedMeta}>
                Connected {auth.instagram?.connectedAt ? new Date(auth.instagram.connectedAt).toLocaleDateString() : 'recently'}
              </div>
            </div>
            <div style={styles.connectedBadge}>✓ Connected</div>
          </div>
          <button
            style={styles.disconnectBtn}
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Disconnect Account'}
          </button>
        </div>
      ) : (
        <div style={styles.connectCard}>
          <div style={styles.igLogo}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#igGrad)" />
              <rect x="13" y="13" width="22" height="22" rx="6" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="24" cy="24" r="5.5" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="31" cy="17" r="1.5" fill="white"/>
              <defs>
                <linearGradient id="igGrad" x1="0" y1="48" x2="48" y2="0">
                  <stop stopColor="#f09433"/>
                  <stop offset="0.25" stopColor="#e6683c"/>
                  <stop offset="0.5" stopColor="#dc2743"/>
                  <stop offset="0.75" stopColor="#cc2366"/>
                  <stop offset="1" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 style={styles.connectTitle}>Connect Instagram</h2>
          <p style={styles.connectDesc}>
            Connect your Instagram Business or Creator account to enable automatic DMs when someone comments a keyword.
          </p>
          <button style={styles.connectBtn} onClick={handleConnect}>
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" style={{ marginRight: '8px' }}>
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2"/>
              <rect x="13" y="13" width="22" height="22" rx="6" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="24" cy="24" r="5.5" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="31" cy="17" r="1.5" fill="white"/>
            </svg>
            Connect with Instagram
          </button>
        </div>
      )}

      {/* Requirements */}
      <div style={styles.reqSection}>
        <h3 style={styles.reqTitle}>Requirements & Setup</h3>
        <div style={styles.reqGrid}>
          <ReqCard
            icon="🏢"
            title="Business or Creator Account"
            desc="Your Instagram account must be a Business or Creator account (not personal)."
          />
          <ReqCard
            icon="📘"
            title="Connected Facebook Page"
            desc="Link your Instagram account to a Facebook Page in your Meta Business Suite."
          />
          <ReqCard
            icon="🔧"
            title="Meta Developer App"
            desc="Create a Meta app at developers.facebook.com with Instagram and Messenger permissions."
          />
          <ReqCard
            icon="🔗"
            title="Webhook Configured"
            desc={`Set your webhook URL to: ${window.location.origin}/webhook with the verify token from your .env`}
          />
        </div>
      </div>

      {/* Setup steps */}
      <div style={styles.setupSteps}>
        <h3 style={styles.reqTitle}>Quick Setup Guide</h3>
        {[
          { step: 1, title: 'Create Meta Developer App', desc: 'Go to developers.facebook.com → My Apps → Create App → Business type. Add Instagram and Messenger products.' },
          { step: 2, title: 'Configure OAuth Redirect', desc: `Add your callback URL to valid OAuth redirect URIs: ${window.location.origin}/auth/instagram/callback` },
          { step: 3, title: 'Set Up Webhooks', desc: `In your app dashboard, go to Webhooks → Subscribe to "comments" field on Instagram. Webhook URL: ${window.location.origin}/webhook` },
          { step: 4, title: 'Add Env Variables', desc: 'Set META_APP_ID, META_APP_SECRET, WEBHOOK_VERIFY_TOKEN, and APP_URL in your .env file.' },
          { step: 5, title: 'Connect Your Account', desc: 'Click "Connect with Instagram" above and authorize the app. Your access token will be saved automatically.' },
        ].map(({ step, title, desc }) => (
          <div key={step} style={styles.setupStep}>
            <div style={styles.setupNum}>{step}</div>
            <div>
              <div style={styles.setupTitle}>{title}</div>
              <div style={styles.setupDesc}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReqCard({ icon, title, desc }) {
  return (
    <div style={styles.reqCard}>
      <div style={styles.reqIcon}>{icon}</div>
      <div style={styles.reqCardTitle}>{title}</div>
      <div style={styles.reqCardDesc}>{desc}</div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' },
  subtitle: { color: 'var(--text-2)', fontSize: '14px' },
  connectedCard: {
    background: 'var(--surface)',
    border: '1px solid var(--green)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    marginBottom: '32px',
  },
  connectedTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #f09433, #bc1888)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  connectedUsername: { fontSize: '18px', fontWeight: '700' },
  connectedMeta: { fontSize: '13px', color: 'var(--text-2)' },
  connectedBadge: {
    marginLeft: 'auto',
    background: 'var(--green-dim)',
    border: '1px solid var(--green)',
    borderRadius: '20px',
    padding: '4px 14px',
    color: 'var(--green)',
    fontSize: '13px',
    fontWeight: '600',
  },
  disconnectBtn: {
    padding: '9px 20px',
    background: 'var(--red-dim)',
    border: '1px solid var(--red)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--red)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  connectCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '48px',
    textAlign: 'center',
    marginBottom: '32px',
  },
  igLogo: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  connectTitle: { fontSize: '22px', fontWeight: '800', marginBottom: '12px' },
  connectDesc: {
    color: 'var(--text-2)',
    fontSize: '15px',
    maxWidth: '400px',
    margin: '0 auto 28px',
    lineHeight: 1.6,
  },
  connectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  reqSection: { marginBottom: '32px' },
  reqTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
  reqGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  reqCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '18px',
  },
  reqIcon: { fontSize: '24px', marginBottom: '10px' },
  reqCardTitle: { fontSize: '14px', fontWeight: '700', marginBottom: '6px' },
  reqCardDesc: { fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 },
  setupSteps: { marginBottom: '32px' },
  setupStep: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderBottom: '1px solid var(--border)',
  },
  setupNum: {
    width: '28px',
    height: '28px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '2px',
  },
  setupTitle: { fontSize: '14px', fontWeight: '700', marginBottom: '4px' },
  setupDesc: { fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'var(--font-mono)', fontSize: '12px' },
};
