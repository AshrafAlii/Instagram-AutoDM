import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
});

export const authApi = {
  status: () => api.get('/auth/status'),
  disconnect: () => api.post('/auth/disconnect'),
  loginUrl: () => `${import.meta.env.VITE_API_URL || ''}/auth/instagram`,
};

export const automationApi = {
  get: () => api.get('/automation'),
  toggle: () => api.post('/automation/toggle'),
  addRule: (data) => api.post('/automation/rules', data),
  updateRule: (id, data) => api.put(`/automation/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/automation/rules/${id}`),
  testDm: (data) => api.post('/automation/test-dm', data),
  resetStats: () => api.post('/automation/reset-stats'),
};

export const logsApi = {
  get: (limit) => api.get('/logs', { params: { limit } }),
  clear: () => api.delete('/logs'),
};

export default api;
