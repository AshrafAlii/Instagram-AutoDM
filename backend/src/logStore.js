// In-memory log store (session-only, no DB required)
const logs = [];
const MAX_LOGS = 500;

export function addLog(entry) {
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.unshift(log);
  if (logs.length > MAX_LOGS) logs.pop();
  return log;
}

export function getLogs(limit = 100) {
  return logs.slice(0, limit);
}

export function clearLogs() {
  logs.length = 0;
}
