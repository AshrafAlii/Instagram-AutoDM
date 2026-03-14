import { Router } from 'express';
import { exchangeCodeForToken, getLongLivedToken, getUserProfile } from '../instagramApi.js';
import { readConfig, updateConfig } from '../configManager.js';
import { addLog } from '../logStore.js';

const router = Router();

// Step 1: Redirect user to Instagram OAuth
router.get('/instagram', (req, res) => {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.APP_URL}/auth/instagram/callback`;
  const scope = 'instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_messaging';

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
router.get('/instagram/callback', async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}?auth=error&reason=${error}`);
  }

  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.APP_URL}/auth/instagram/callback`;

    // Exchange code for short-lived token
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);

    // Exchange for long-lived token
    const longTokenData = await getLongLivedToken(tokenData.access_token, appId, appSecret);

    // Get user profile
    const profile = await getUserProfile(longTokenData.access_token);

    // Save to config
    updateConfig({
      instagram: {
        accessToken: longTokenData.access_token,
        userId: profile.id,
        username: profile.username,
        connectedAt: new Date().toISOString()
      }
    });

    addLog({
      type: 'system',
      event: 'account_connected',
      username: profile.username,
      message: `Instagram account @${profile.username} connected successfully`
    });

    res.redirect(`${frontendUrl}?auth=success`);
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.redirect(`${frontendUrl}?auth=error&reason=token_exchange_failed`);
  }
});

// Get current connection status
router.get('/status', (req, res) => {
  const config = readConfig();
  const { accessToken, ...safeInstagram } = config.instagram;
  res.json({
    connected: !!config.instagram.accessToken,
    instagram: safeInstagram
  });
});

// Disconnect account
router.post('/disconnect', (req, res) => {
  updateConfig({
    instagram: {
      accessToken: '',
      userId: '',
      username: '',
      connectedAt: null
    }
  });
  addLog({
    type: 'system',
    event: 'account_disconnected',
    message: 'Instagram account disconnected'
  });
  res.json({ success: true });
});

export default router;
