import { Router } from 'express';
import { getLogs, clearLogs } from '../logStore.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(getLogs(limit));
});

router.delete('/', (req, res) => {
  clearLogs();
  res.json({ success: true });
});

export default router;
