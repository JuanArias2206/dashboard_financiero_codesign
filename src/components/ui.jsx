import { TrendingUp, TrendingDown, Inbox, Loader2 } from 'lucide-react';

export function Card({ title, subtitle, action, children, accent, className = '', ...rest }) {
  return (
    <article className={`wv-card ${accent ? 'accent' : ''} ${className}`} {...rest}>
      {(title || action) && (
        <div className="wv-card-header">
          <div>
            {title && <h3 className="wv-card-title">{title}</h3>}
            {subtitle && <div className="wv-card-subtitle">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </article>
  );
}

export function KpiCard({ icon: Icon, label, value, delta, deltaUp, foot, tone = 'info' }) {
  return (
    <div className={`wv-kpi ${tone}`}>
      <div className="wv-kpi-header">
        {Icon && <Icon size={14} strokeWidth={2} />}
        <span>{label}</span>
      </div>
      <div className={`wv-kpi-value ${tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : tone === 'info' ? 'accent' : ''}`}>
        {value}
      </div>
      {(delta || foot) && (
        <div className="wv-kpi-foot">
          {delta && (
            <span className={`wv-kpi-delta ${deltaUp ? 'up' : 'down'}`}>
              {deltaUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {delta}
            </span>
          )}
          {foot && <span>{foot}</span>}
        </div>
      )}
    </div>
  );
}

export function Loader({ label = 'Cargando…' }) {
  return (
    <div className="wv-loader">
      <div className="ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }) {
  return (
    <div className="wv-alert" role="alert">
      <div className="wv-alert-body">
        <div className="wv-alert-title" style={{ color: 'var(--wv-danger)' }}>No se pudieron cargar los datos</div>
        <div style={{ fontSize: 13 }}>{message}</div>
      </div>
      {onRetry && (
        <button className="wv-btn" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Sin datos', message, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--wv-text)' }}>{title}</div>
      {message && <div style={{ fontSize: 13 }}>{message}</div>}
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="wv-segmented" role="tablist">
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const Icon = typeof opt === 'string' ? null : opt.icon;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? 'active' : ''}
            onClick={() => onChange(v)}
          >
            {Icon && <Icon size={13} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
