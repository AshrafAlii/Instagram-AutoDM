import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

import authRouter from './src/routes/auth.js';
import webhookRouter from './src/routes/webhook.js';
import automationRouter from './src/routes/automation.js';
import logsRouter from './src/routes/logs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON - webhook needs raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRouter);
app.use('/webhook', webhookRouter);
app.use('/automation', automationRouter);
app.use('/logs', logsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Instagram AutoDM Backend running on port ${PORT}`);
  console.log(`📡 Webhook URL: ${process.env.APP_URL || `http://localhost:${PORT}`}/webhook`);
  console.log(`🔗 Auth URL: ${process.env.APP_URL || `http://localhost:${PORT}`}/auth/instagram\n`);
});

export default app;
