import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import { Loader } from './components/ui';
import { api, getToken } from './lib/api';

export default function App() {
  const [authState, setAuthState] = useState('checking'); // checking | anon | authed
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) {
      setAuthState('anon');
      return;
    }
    api.verify()
      .then((r) => {
        if (cancelled) return;
        if (r?.authenticated) {
          setUser({ username: r.username || 'Operador' });
          setAuthState('authed');
        } else {
          setAuthState('anon');
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState('anon');
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = useCallback(async () => {
    try { await api.logout(); } catch {}
    setUser(null);
    setAuthState('anon');
  }, []);

  const handleLogin = useCallback((u) => {
    setUser(u);
    setAuthState('authed');
  }, []);

  if (authState === 'checking') {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><Loader label="Verificando sesión…" /></div>;
  }

  if (authState === 'anon') {
    return <Login onSuccess={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/chatbot" element={<Chatbot user={user} />} />
      <Route path="*" element={<Dashboard user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}
