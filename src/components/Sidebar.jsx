import { Zap, LogOut, ChevronLeft } from 'lucide-react';
import { NAV_GROUPS } from '../lib/sections';

export default function Sidebar({ active, onSelect, user, onLogout, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Navegación principal">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">ADATEC</span>
          <span className="sidebar-brand-sub">Dashboard · v2.0</span>
        </div>
        <button
          className="wv-icon-btn"
          aria-label="Plegar menú"
          onClick={onToggleCollapse}
          style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8 }}
        >
          <ChevronLeft
            size={14}
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
          />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-item ${isActive ? 'active' : ''} ${item.soon ? 'disabled' : ''}`}
                    onClick={() => {
                      if (item.soon) return;
                      onSelect(item.id);
                      onCloseMobile?.();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="item-label">{item.label}</span>
                    {item.soon && <span className="soon-tag">SOON</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-avatar">{(user?.username || 'A')[0].toUpperCase()}</div>
        <div className="sidebar-user-meta" style={{ flex: 1 }}>
          <div className="sidebar-user-name">{user?.username || 'Operador'}</div>
          <div className="sidebar-user-role">Admin</div>
        </div>
        <button
          className="wv-icon-btn"
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          style={{ width: 32, height: 32 }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
