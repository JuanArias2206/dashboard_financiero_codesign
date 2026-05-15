import { Search, Bell, RefreshCw, MessageSquare, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SECTION_INFO } from '../lib/sections';

export default function Topbar({ section, onSync, syncing, onOpenMobile }) {
  const info = SECTION_INFO[section] || { title: section, crumb: 'Dashboard' };

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          className="wv-icon-btn"
          aria-label="Abrir menú"
          onClick={onOpenMobile}
          style={{ display: 'none' }}
          data-mobile-only
        >
          <Menu size={18} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div className="topbar-sub">
            <span>{info.crumb}</span>
            <span style={{ color: 'var(--wv-text-dim)' }}>·</span>
            <span className="wv-badge live" style={{ padding: '2px 8px', fontSize: 10 }}>EN VIVO</span>
          </div>
          <div className="topbar-title">{info.title}</div>
        </div>
      </div>

      <div className="app-topbar-right">
        <div className="wv-search">
          <Search size={15} color="var(--wv-text-dim)" />
          <input placeholder="Buscar clientes, vendedores, productos…" aria-label="Buscar" />
        </div>

        <button
          className="wv-btn ghost"
          onClick={onSync}
          disabled={syncing}
          title="Sincronizar datos con RSales"
        >
          <RefreshCw size={15} className={syncing ? 'wv-spinner' : ''} />
          <span style={{ display: 'none' }} data-desktop-only>
            Sincronizar
          </span>
        </button>

        <Link to="/chatbot" className="wv-btn">
          <MessageSquare size={15} />
          Chatbot
        </Link>

        <button className="wv-icon-btn" aria-label="Notificaciones" title="Notificaciones">
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 6, right: 6,
              width: 8, height: 8,
              borderRadius: '50%',
              background: 'var(--wv-danger)',
              boxShadow: '0 0 0 2px var(--wv-surface)',
            }}
          />
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          [data-mobile-only] { display: grid !important; }
        }
        @media (min-width: 760px) {
          [data-desktop-only] { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
