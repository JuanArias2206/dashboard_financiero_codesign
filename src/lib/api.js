// Minimal fetch wrapper around the existing Express backend.
// Uses JWT in Authorization: Bearer <token> header, token stored in localStorage.
// Most endpoints return { success: true, data: {...} } — we transparently unwrap that.

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

async function request(path, opts = {}, { unwrap = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const tok = getToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;

  const res = await fetch(path, { ...opts, headers });
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (isJson && body && (body.error || body.message)) || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = body;
    if (res.status === 401) setToken(null);
    throw err;
  }
  if (unwrap && body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data;
  }
  return body;
}

export const api = {
  async login(username, password) {
    const res = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, { unwrap: false });
    if (res?.token || res?.sessionId) setToken(res.token || res.sessionId);
    return { user: { username }, ...res };
  },
  async logout() {
    try { await request('/api/logout', { method: 'POST' }, { unwrap: false }); } catch {}
    setToken(null);
    return { ok: true };
  },
  verify: () => request('/api/verify', {}, { unwrap: false }),
  health: () => request('/api/health', {}, { unwrap: false }),
  dashboardData: () => request('/api/dashboard-data'),
  carteraData: () => request('/api/cartera-data'),
  rsalesIndicators: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/api/rsales-indicators' + (q ? `?${q}` : ''), {}, { unwrap: false });
  },
  inventario: () => request('/api/inventario'),
  tiempos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/api/tiempos' + (q ? `?${q}` : ''));
  },
  pedidos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/api/pedidos' + (q ? `?${q}` : ''));
  },
  chat: (message, conversationHistory = []) =>
    request('/api/chat', { method: 'POST', body: JSON.stringify({ message, conversationHistory }) }, { unwrap: false }),
};
