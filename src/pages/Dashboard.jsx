import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Loader } from '../components/ui';
import { api } from '../lib/api';

const Inicio = lazy(() => import('./Inicio'));
const ControlCartera = lazy(() => import('./ControlCartera'));
const ResumenGestion = lazy(() => import('./ResumenGestion'));
const Recaudos = lazy(() => import('./Recaudos'));
const Inventario = lazy(() => import('./Inventario'));
const Tiempos = lazy(() => import('./Tiempos'));
const Pedidos = lazy(() => import('./Pedidos'));
const Prediccion = lazy(() => import('./Prediccion'));

const SECTION_COMPONENT = {
  'inicio': Inicio,
  'resumen-gestion': ResumenGestion,
  'control-cartera': ControlCartera,
  'reporte-recaudos': Recaudos,
  'inventario': Inventario,
  'tiempos': Tiempos,
  'pedidos': Pedidos,
  'prediccion': Prediccion,
};

export default function Dashboard({ user, onLogout }) {
  const [section, setSection] = useState(() => {
    try { return localStorage.getItem('wv:section') || 'control-cartera'; } catch { return 'control-cartera'; }
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('wv:section', section); } catch {}
  }, [section]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync/rsales?entity=all', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    setTimeout(() => setSyncing(false), 1200);
  }, []);

  const Section = SECTION_COMPONENT[section] || ControlCartera;

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        active={section}
        onSelect={setSection}
        user={user}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <div className="app-main">
        <Topbar
          section={section}
          onSync={handleSync}
          syncing={syncing}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="app-content wv-fade-in" key={section}>
          <Suspense fallback={<Loader label="Cargando vista…" />}>
            <Section />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
