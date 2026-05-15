import { useState } from 'react';
import { Zap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function Login({ onSuccess }) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.login(user.trim(), pwd);
      onSuccess?.(res?.user || { username: user });
    } catch (e2) {
      setErr(e2.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card wv-fade-in">
        <div className="login-logo">
          <Zap size={28} strokeWidth={2.4} />
        </div>
        <h1>Dashboard Financiero</h1>
        <div className="login-sub">Análisis de Cartera · ADATEC</div>

        <form className="login-form" onSubmit={submit} autoComplete="on">
          <div>
            <label htmlFor="login-user">Usuario</label>
            <input
              id="login-user"
              className="wv-input"
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="login-pwd">Contraseña</label>
            <input
              id="login-pwd"
              className="wv-input"
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
          </div>

          {err && (
            <div className="login-err" role="alert">
              <AlertCircle size={16} />
              {err}
            </div>
          )}

          <button
            type="submit"
            className="wv-btn primary"
            disabled={loading || !user || !pwd}
            style={{ height: 44, justifyContent: 'center', marginTop: 6 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="wv-spinner" />
                Iniciando sesión…
              </>
            ) : (
              <>
                Iniciar sesión
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-foot">
          <span>NPROSERVER · v2.0</span>
          <span className="wv-badge live">En vivo</span>
        </div>
      </div>
    </div>
  );
}
