import { Router } from 'express';
import { readConfig, updateConfig } from '../configManager.js';
import { addLog } from '../logStore.js';
import { sendDM } from '../instagramApi.js';

const router = Router();

// Get automation config
router.get('/', (req, res) => {
  const config = readConfig();
  res.json({
    enabled: config.automation.enabled,
    rules: config.automation.rules,
    stats: config.stats
  });
});

// Toggle automation on/off
router.post('/toggle', (req, res) => {
  const config = readConfig();
  const newState = !config.automation.enabled;
  updateConfig({ automation: { enabled: newState } });

  addLog({
    type: 'system',
    event: newState ? 'automation_resumed' : 'automation_paused',
    message: `Automation ${newState ? 'resumed' : 'paused'}`
  });

  res.json({ enabled: newState });
});

// Add a new rule
router.post('/rules', (req, res) => {
  const { keyword, message } = req.body;
  if (!keyword || !message) {
    return res.status(400).json({ error: 'keyword and message are required' });
  }

  const config = readConfig();
  const newRule = {
    id: `rule_${Date.now()}`,
    keyword: keyword.trim(),
    message: message.trim(),
    enabled: true,
    createdAt: new Date().toISOString()
  };

  const updatedRules = [...(config.automation.rules || []), newRule];
  updateConfig({ automation: { rules: updatedRules } });

  addLog({
    type: 'system',
    event: 'rule_created',
    message: `New rule created: keyword "${keyword}"`
  });

  res.json(newRule);
});

// Update a rule
router.put('/rules/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const config = readConfig();
  const rules = config.automation.rules || [];
  const idx = rules.findIndex(r => r.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });

  rules[idx] = { ...rules[idx], ...updates, id };
  updateConfig({ automation: { rules } });

  res.json(rules[idx]);
});

// Delete a rule
router.delete('/rules/:id', (req, res) => {
  const { id } = req.params;
  const config = readConfig();
  const rules = (config.automation.rules || []).filter(r => r.id !== id);
  updateConfig({ automation: { rules } });
  res.json({ success: true });
});

// Manual DM test
router.post('/test-dm', async (req, res) => {
  const { recipientId, message } = req.body;
  const config = readConfig();

  if (!config.instagram.accessToken) {
    return res.status(401).json({ error: 'Instagram not connected' });
  }

  try {
    const result = await sendDM(config.instagram.accessToken, recipientId, message);
    addLog({
      type: 'dm_sent',
      event: 'manual_test_dm',
      username: recipientId,
      commentText: '[Manual Test]',
      messageSent: message
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Reset session stats
router.post('/reset-stats', (req, res) => {
  updateConfig({ stats: { sessionDmsSent: 0 } });
  res.json({ success: true });
});

export default router;
