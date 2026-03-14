import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Automation from './pages/Automation.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import Connect from './pages/Connect.jsx';

function AuthHandler() {
  const [params] = useSearchParams();
  useEffect(() => {
    const auth = params.get('auth');
    if (auth === 'success') {
      window.history.replaceState({}, '', '/');
    }
  }, [params]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="automation" element={<Automation />} />
          <Route path="logs" element={<ActivityLog />} />
          <Route path="connect" element={<Connect />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
