import { Router } from 'express';
import { sendDM, getCommentUser } from '../instagramApi.js';
import { readConfig, updateConfig } from '../configManager.js';
import { addLog } from '../logStore.js';

const router = Router();

// Webhook verification (GET) - required by Meta
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Webhook verification failed');
    res.status(403).json({ error: 'Verification failed' });
  }
});

// Webhook event handler (POST)
router.post('/', async (req, res) => {
  // Always respond 200 immediately to Meta
  res.status(200).json({ status: 'received' });

  const body = req.body;

  if (body.object !== 'instagram') return;

  const config = readConfig();
  if (!config.automation.enabled) return;
  if (!config.instagram.accessToken) return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === 'comments') {
        await handleCommentEvent(change.value, config);
      }
    }
  }
});

async function handleCommentEvent(commentData, config) {
  const { text, from, id: commentId, media } = commentData;

  if (!text || !from) return;

  const commentText = text.toLowerCase().trim();
  const senderId = from.id;
  const senderUsername = from.username || 'unknown';

  // Check all enabled rules
  const enabledRules = config.automation.rules.filter(r => r.enabled);

  for (const rule of enabledRules) {
    const keyword = rule.keyword.toLowerCase().trim();
    if (commentText.includes(keyword)) {
      await triggerDM(config, rule, senderId, senderUsername, text);
      break; // Only trigger first matching rule per comment
    }
  }
}

async function triggerDM(config, rule, recipientId, username, commentText) {
  try {
    await sendDM(config.instagram.accessToken, recipientId, rule.message);

    // Update stats
    const current = readConfig();
    updateConfig({
      stats: {
        totalDmsSent: (current.stats.totalDmsSent || 0) + 1,
        sessionDmsSent: (current.stats.sessionDmsSent || 0) + 1
      }
    });

    addLog({
      type: 'dm_sent',
      event: 'auto_dm_triggered',
      username,
      commentText,
      messageSent: rule.message,
      keyword: rule.keyword,
      ruleId: rule.id
    });

    console.log(`✅ DM sent to @${username} for keyword "${rule.keyword}"`);
  } catch (err) {
    const errMsg = err.response?.data?.error?.message || err.message;
    console.error(`❌ Failed to send DM to @${username}:`, errMsg);

    addLog({
      type: 'error',
      event: 'dm_failed',
      username,
      commentText,
      keyword: rule.keyword,
      error: errMsg
    });
  }
}

export default router;
