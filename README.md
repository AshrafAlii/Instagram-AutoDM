# ⚡ AutoDM — Instagram Comment-to-DM Automation

A lightweight web app that automatically sends Instagram DMs when someone comments a specific keyword on your posts or reels. Built with React + Node.js/Express + Meta Instagram Graph API. No database required.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd instagram-autodm
npm install
npm run install:all
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
APP_URL=https://your-deployed-url.vercel.app
WEBHOOK_VERIFY_TOKEN=any_random_string_you_choose
FRONTEND_URL=https://your-deployed-url.vercel.app
PORT=3001
```

### 3. Run Locally

```bash
# Run both backend and frontend in parallel
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001

---

## 🔧 Meta Developer App Setup

This is the most important part. Follow these steps carefully.

### Step 1 — Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps → Create App**
3. Choose **Business** as the app type
4. Fill in your app name and contact email

### Step 2 — Add Products

In your app dashboard, add these two products:
- **Instagram Graph API** (or Instagram Basic Display)
- **Messenger** (required for DM sending)

### Step 3 — Configure Instagram

1. Go to **Instagram → Basic Display** or **Instagram Graph API**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://your-app-url.vercel.app/auth/instagram/callback
   http://localhost:3001/auth/instagram/callback
   ```
3. Note your **App ID** and **App Secret** — add them to your `.env`

### Step 4 — Set Up Webhooks

1. Go to **Webhooks** in your app dashboard
2. Click **Add Subscription → Instagram**
3. Set:
   - **Callback URL**: `https://your-app-url.vercel.app/webhook`
   - **Verify Token**: same value as `WEBHOOK_VERIFY_TOKEN` in your `.env`
4. Subscribe to the **`comments`** field
5. Click **Verify and Save**

### Step 5 — Required Permissions

In **App Review → Permissions and Features**, request:
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `pages_show_list`
- `pages_messaging`

For development/testing, you can use these without review if you're logged in as the app owner.

### Step 6 — Connect Your Instagram Account

1. Your Instagram account must be a **Business or Creator** account
2. It must be **linked to a Facebook Page** in Meta Business Suite
3. Go to the **Account** page in the AutoDM dashboard
4. Click **Connect with Instagram**
5. Authorize the app — your access token will be saved to `config/config.json`

---

## 📁 Project Structure

```
instagram-autodm/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── .env.example           # Environment template
│   └── src/
│       ├── configManager.js   # Read/write config.json
│       ├── instagramApi.js    # Meta Graph API calls
│       ├── logStore.js        # In-memory activity log
│       └── routes/
│           ├── auth.js        # OAuth + token management
│           ├── webhook.js     # Webhook verification + event handling
│           ├── automation.js  # Rule CRUD + DM trigger
│           └── logs.js        # Log retrieval
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── api.js             # Axios API client
│       ├── index.css          # Design system / global styles
│       ├── context/
│       │   └── AppContext.jsx # Global state
│       ├── components/
│       │   └── Layout.jsx     # Sidebar navigation
│       └── pages/
│           ├── Dashboard.jsx  # Overview + stats
│           ├── Automation.jsx # Rule management
│           ├── ActivityLog.jsx # Event stream
│           └── Connect.jsx    # Account connection
├── config/
│   └── config.json            # Persisted configuration (auto-created)
├── vercel.json                # Vercel deployment config
└── package.json               # Root scripts
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/auth/instagram` | Redirect to Instagram OAuth |
| `GET` | `/auth/instagram/callback` | Handle OAuth code exchange |
| `GET` | `/auth/status` | Get connection status |
| `POST` | `/auth/disconnect` | Disconnect Instagram account |
| `GET` | `/webhook` | Webhook verification (Meta) |
| `POST` | `/webhook` | Receive comment events |
| `GET` | `/automation` | Get rules + stats |
| `POST` | `/automation/toggle` | Pause/resume automation |
| `POST` | `/automation/rules` | Create a new rule |
| `PUT` | `/automation/rules/:id` | Update a rule |
| `DELETE` | `/automation/rules/:id` | Delete a rule |
| `POST` | `/automation/test-dm` | Send a test DM manually |
| `GET` | `/logs` | Get activity logs |
| `DELETE` | `/logs` | Clear all logs |

---

## 🚢 Deploy to Vercel

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set Environment Variables in Vercel dashboard:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `WEBHOOK_VERIFY_TOKEN`
   - `APP_URL` (your Vercel URL)
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy!

> **Note**: Vercel serverless functions are stateless, so `config/config.json` won't persist between deployments on Vercel's filesystem. For production, consider writing to a writable `/tmp` path or upgrading to a KV store.

---

## ⚠️ Important Notes

- **Access Token Expiry**: Long-lived tokens expire in ~60 days. You'll need to reconnect periodically or implement token refresh logic.
- **Rate Limits**: Meta's API has rate limits. Avoid sending DMs to the same user repeatedly.
- **DM Restrictions**: You can only DM users who have previously interacted with your account or sent you a message first (Meta policy).
- **Logs**: Activity logs are in-memory only and reset on server restart.
- **Webhooks**: Webhooks only work on a live HTTPS URL. For local development, use [ngrok](https://ngrok.com): `ngrok http 3001`

---

## 🛠️ Local Webhook Testing with ngrok

```bash
# Start backend
npm run dev:backend

# In another terminal, expose it with ngrok
ngrok http 3001

# Use the ngrok HTTPS URL as your webhook callback in Meta dashboard
# e.g. https://abc123.ngrok.io/webhook
```

---

## 📄 License

MIT
