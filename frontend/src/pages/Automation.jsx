import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { automationApi } from '../api.js';

export default function Automation() {
  const { automation, refreshAutomation } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ keyword: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.keyword.trim() || !form.message.trim()) {
      setError('Both keyword and message are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await automationApi.updateRule(editingId, form);
      } else {
        await automationApi.addRule(form);
      }
      setForm({ keyword: '', message: '' });
      setShowForm(false);
      setEditingId(null);
      refreshAutomation();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule) => {
    setForm({ keyword: rule.keyword, message: rule.message });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    await automationApi.deleteRule(id);
    refreshAutomation();
  };

  const handleToggleRule = async (rule) => {
    await automationApi.updateRule(rule.id, { enabled: !rule.enabled });
    refreshAutomation();
  };

  const handleCancel = () => {
    setForm({ keyword: '', message: '' });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  return (
    <div className="animate-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Automation Rules</h1>
          <p style={styles.subtitle}>Configure keyword triggers and DM responses</p>
        </div>
        <button style={styles.addBtn} onClick={() => { setEditingId(null); setForm({ keyword: '', message: '' }); setShowForm(true); }}>
          + Add Rule
        </button>
      </div>

      {/* How it works */}
      <div style={styles.howItWorks}>
        <div style={styles.step}>
          <div style={styles.stepNum}>1</div>
          <div>
            <div style={styles.stepTitle}>Someone comments</div>
            <div style={styles.stepDesc}>User comments your keyword on any post or reel</div>
          </div>
        </div>
        <div style={styles.stepArrow}>→</div>
        <div style={styles.step}>
          <div style={styles.stepNum}>2</div>
          <div>
            <div style={styles.stepTitle}>Keyword matched</div>
            <div style={styles.stepDesc}>Webhook detects the keyword in the comment</div>
          </div>
        </div>
        <div style={styles.stepArrow}>→</div>
        <div style={styles.step}>
          <div style={styles.stepNum}>3</div>
          <div>
            <div style={styles.stepTitle}>DM sent instantly</div>
            <div style={styles.stepDesc}>Your message is sent to the commenter automatically</div>
          </div>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editingId ? 'Edit Rule' : 'New Automation Rule'}</h3>

          <div style={styles.field}>
            <label style={styles.label}>Trigger Keyword</label>
            <input
              style={styles.input}
              value={form.keyword}
              onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
              placeholder='e.g. "link" or "info"'
              autoFocus
            />
            <div style={styles.hint}>Case-insensitive. Partial match supported (e.g. "link" matches "send link please")</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>DM Message</label>
            <textarea
              style={styles.textarea}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Hey! Thanks for your interest 🙌 Here's the link: https://..."
              rows={4}
            />
            <div style={styles.charCount}>{form.message.length} / 1000 chars</div>
          </div>

          {error && <div style={styles.errorMsg}>{error}</div>}

          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner" /> : (editingId ? 'Save Changes' : 'Create Rule')}
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {(automation.rules || []).length === 0 && !showForm ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎯</div>
          <div style={styles.emptyTitle}>No automation rules yet</div>
          <div style={styles.emptyDesc}>Create a rule to start automating DMs</div>
          <button style={styles.emptyBtn} onClick={() => setShowForm(true)}>
            + Create your first rule
          </button>
        </div>
      ) : (
        <div style={styles.rulesList}>
          {(automation.rules || []).map(rule => (
            <div key={rule.id} style={styles.ruleCard}>
              <div style={styles.ruleHeader}>
                <div style={styles.ruleLeft}>
                  <span style={styles.keyword}>"{rule.keyword}"</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>→</span>
                  <span style={styles.ruleMsgPreview}>{rule.message.slice(0, 60)}{rule.message.length > 60 ? '...' : ''}</span>
                </div>
                <div style={styles.ruleActions}>
                  {/* Toggle */}
                  <button
                    style={{
                      ...styles.toggleSwitch,
                      background: rule.enabled ? 'var(--green)' : 'var(--surface-2)',
                    }}
                    onClick={() => handleToggleRule(rule)}
                    title={rule.enabled ? 'Disable' : 'Enable'}
                  >
                    <span style={{
                      ...styles.toggleThumb,
                      transform: rule.enabled ? 'translateX(18px)' : 'translateX(2px)',
                    }} />
                  </button>
                  <button style={styles.iconBtn} onClick={() => handleEdit(rule)} title="Edit">✏️</button>
                  <button style={styles.iconBtn} onClick={() => handleDelete(rule.id)} title="Delete">🗑️</button>
                </div>
              </div>
              <div style={styles.ruleFullMsg}>{rule.message}</div>
              {rule.createdAt && (
                <div style={styles.ruleMeta}>Created {new Date(rule.createdAt).toLocaleDateString()}</div>
              )}
            </div>
          ))}
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
    marginBottom: '32px',
  },
  title: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' },
  subtitle: { color: 'var(--text-2)', fontSize: '14px' },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  },
  howItWorks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 24px',
    marginBottom: '28px',
  },
  step: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  stepNum: {
    width: '28px', height: '28px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--accent)', fontSize: '12px', fontWeight: '700',
    flexShrink: 0,
  },
  stepTitle: { fontSize: '13px', fontWeight: '700', marginBottom: '2px' },
  stepDesc: { fontSize: '12px', color: 'var(--text-2)' },
  stepArrow: { color: 'var(--text-3)', fontSize: '18px' },
  formCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    marginBottom: '24px',
  },
  formTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '20px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-2)' },
  input: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.15s',
  },
  textarea: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
  },
  hint: { fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' },
  charCount: { fontSize: '12px', color: 'var(--text-3)', marginTop: '6px', textAlign: 'right' },
  errorMsg: {
    background: 'var(--red-dim)',
    border: '1px solid var(--red)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--red)',
    fontSize: '13px',
    marginBottom: '16px',
  },
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '9px 20px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-2)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
  },
  saveBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  emptyDesc: { color: 'var(--text-2)', marginBottom: '24px' },
  emptyBtn: {
    padding: '10px 24px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
  },
  rulesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  ruleCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    transition: 'border-color 0.15s',
  },
  ruleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    gap: '16px',
  },
  ruleLeft: {
    display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1,
  },
  keyword: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--accent)',
    background: 'var(--accent-glow)',
    padding: '3px 10px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  ruleMsgPreview: {
    fontSize: '13px',
    color: 'var(--text-2)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ruleActions: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  toggleSwitch: {
    width: '40px', height: '22px',
    borderRadius: '11px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    width: '16px', height: '16px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '5px 9px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  ruleFullMsg: {
    fontSize: '13px',
    color: 'var(--text-2)',
    lineHeight: 1.6,
    padding: '10px',
    background: 'var(--surface-2)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '8px',
  },
  ruleMeta: { fontSize: '11px', color: 'var(--text-3)' },
};
