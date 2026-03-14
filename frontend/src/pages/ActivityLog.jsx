import { useState, useEffect, useCallback } from 'react';
import { logsApi } from '../api.js';

const TYPE_CONFIG = {
  dm_sent: { color: 'var(--green)', bg: 'var(--green-dim)', label: 'DM Sent', icon: '✅' },
  error: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Error', icon: '❌' },
  system: { color: 'var(--accent)', bg: 'var(--accent-glow)', label: 'System', icon: '⚙️' },
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await logsApi.get(200);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleClear = async () => {
    if (!confirm('Clear all logs?')) return;
    await logsApi.clear();
    setLogs([]);
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="animate-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Activity Log</h1>
          <p style={styles.subtitle}>Real-time automation event stream</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={fetchLogs}>↻ Refresh</button>
          {logs.length > 0 && (
            <button style={styles.clearBtn} onClick={handleClear}>Clear</button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={styles.filters}>
        {['all', 'dm_sent', 'error', 'system'].map(f => (
          <button
            key={f}
            style={{
              ...styles.filterBtn,
              ...(filter === f ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${logs.length})` : f === 'dm_sent' ? `DMs (${logs.filter(l => l.type === 'dm_sent').length})` : f === 'error' ? `Errors (${logs.filter(l => l.type === 'error').length})` : `System (${logs.filter(l => l.type === 'system').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <div>No events yet</div>
          <div style={styles.emptyHint}>Logs appear here when automation is triggered</div>
        </div>
      ) : (
        <div style={styles.logList}>
          {filtered.map(log => {
            const cfg = TYPE_CONFIG[log.type] || TYPE_CONFIG.system;
            return (
              <div key={log.id} style={styles.logEntry}>
                <div style={{ ...styles.logBadge, background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div style={styles.logBody}>
                  <div style={styles.logTop}>
                    {log.username && (
                      <span style={styles.logUsername}>@{log.username}</span>
                    )}
                    {log.commentText && log.commentText !== '[Manual Test]' && (
                      <span style={styles.logComment}>commented: "{log.commentText}"</span>
                    )}
                    {log.keyword && (
                      <span style={styles.logKeyword}>→ matched "{log.keyword}"</span>
                    )}
                  </div>

                  {log.messageSent && (
                    <div style={styles.logMessage}>
                      <span style={styles.logMessageLabel}>DM: </span>
                      {log.messageSent}
                    </div>
                  )}

                  {log.message && !log.messageSent && (
                    <div style={styles.logMessage}>{log.message}</div>
                  )}

                  {log.error && (
                    <div style={styles.logError}>{log.error}</div>
                  )}
                </div>
                <div style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                  <div style={styles.logDate}>{new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  title: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' },
  subtitle: { color: 'var(--text-2)', fontSize: '14px' },
  headerActions: { display: 'flex', gap: '10px' },
  refreshBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-2)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
  },
  clearBtn: {
    padding: '8px 16px',
    background: 'var(--red-dim)',
    border: '1px solid var(--red)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--red)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  filterBtn: {
    padding: '7px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    color: 'var(--text-2)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '60px' },
  empty: {
    textAlign: 'center',
    padding: '60px',
    background: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-2)',
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyHint: { fontSize: '13px', color: 'var(--text-3)', marginTop: '6px' },
  logList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  logEntry: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    transition: 'border-color 0.15s',
  },
  logBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  logBody: { flex: 1, minWidth: 0 },
  logTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '6px',
  },
  logUsername: {
    fontWeight: '700',
    fontSize: '14px',
    color: 'var(--accent)',
  },
  logComment: {
    fontSize: '13px',
    color: 'var(--text-2)',
    fontStyle: 'italic',
  },
  logKeyword: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--green)',
    background: 'var(--green-dim)',
    padding: '1px 8px',
    borderRadius: '4px',
  },
  logMessage: {
    fontSize: '13px',
    color: 'var(--text-2)',
    lineHeight: 1.5,
  },
  logMessageLabel: {
    color: 'var(--text-3)',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    marginRight: '4px',
  },
  logError: {
    fontSize: '13px',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
  },
  logTime: {
    fontSize: '12px',
    color: 'var(--text-3)',
    fontFamily: 'var(--font-mono)',
    flexShrink: 0,
    textAlign: 'right',
  },
  logDate: { fontSize: '11px', marginTop: '2px' },
};
