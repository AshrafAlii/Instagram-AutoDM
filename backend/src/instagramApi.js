import axios from 'axios';

const BASE_URL = 'https://graph.instagram.com/v21.0';

export async function sendDM(accessToken, recipientIgId, message) {
  // Instagram DMs via Graph API require a connected Page
  // Uses the Instagram Messaging API endpoint
  const url = `${BASE_URL}/me/messages`;
  const payload = {
    recipient: { id: recipientIgId },
    message: { text: message },
    access_token: accessToken
  };

  const response = await axios.post(url, payload);
  return response.data;
}

export async function getCommentUser(accessToken, commentId) {
  const url = `${BASE_URL}/${commentId}?fields=from,text,timestamp&access_token=${accessToken}`;
  const response = await axios.get(url);
  return response.data;
}

export async function getIGUserFromCommenter(accessToken, commenterId) {
  // Get the Instagram Scoped User ID to send DM
  const url = `${BASE_URL}/${commenterId}?fields=name,username&access_token=${accessToken}`;
  const response = await axios.get(url);
  return response.data;
}

export async function exchangeCodeForToken(code, appId, appSecret, redirectUri) {
  const url = 'https://api.instagram.com/oauth/access_token';
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code
  });

  const response = await axios.post(url, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
}

export async function getLongLivedToken(shortToken, appId, appSecret) {
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=${appId}&client_secret=${appSecret}&access_token=${shortToken}`;
  const response = await axios.get(url);
  return response.data;
}

export async function getUserProfile(accessToken) {
  const url = `${BASE_URL}/me?fields=id,username,account_type&access_token=${accessToken}`;
  const response = await axios.get(url);
  return response.data;
}
