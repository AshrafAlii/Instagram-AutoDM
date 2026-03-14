import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, automationApi } from '../api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ connected: false, instagram: null, loading: true });
  const [automation, setAutomation] = useState({ enabled: true, rules: [], stats: { totalDmsSent: 0, sessionDmsSent: 0 } });

  const refreshAuth = useCallback(async () => {
    try {
      const res = await authApi.status();
      setAuth({ ...res.data, loading: false });
    } catch {
      setAuth({ connected: false, instagram: null, loading: false });
    }
  }, []);

  const refreshAutomation = useCallback(async () => {
    try {
      const res = await automationApi.get();
      setAutomation(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    refreshAutomation();
    const interval = setInterval(refreshAutomation, 15000);
    return () => clearInterval(interval);
  }, [refreshAuth, refreshAutomation]);

  return (
    <AppContext.Provider value={{ auth, automation, refreshAuth, refreshAutomation, setAutomation }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
