// Minimal fetch wrapper around the existing Express backend.
// Uses JWT in Authorization: Bearer <token> header, token stored in localStorage.

const TOKEN_KEY = 'authToken';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const tok = getToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;

  const res = await fetch(path, { ...opts, headers });
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (isJson && data && (data.error || data.message)) || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    if (res.status === 401) setToken(null);
    throw err;
  }
  return data;
}

export const api = {
  async login(username, password) {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res?.token || res?.sessionId) setToken(res.token || res.sessionId);
    return { user: { username }, ...res };
  },
  async logout() {
    try { await request('/api/logout', { method: 'POST' }); } catch {}
    setToken(null);
    return { ok: true };
  },
  verify: () => request('/api/verify'),
  health: () => request('/api/health'),
  dashboardData: () => request('/api/dashboard-data'),
  carteraData: () => request('/api/cartera-data'),
  rsalesIndicators: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/api/rsales-indicators' + (q ? `?${q}` : ''));
  },
  inventario: () => request('/api/inventario'),
  tiempos: () => request('/api/tiempos'),
  pedidos: () => request('/api/pedidos'),
  chat: (message, history = []) =>
    request('/api/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
};
