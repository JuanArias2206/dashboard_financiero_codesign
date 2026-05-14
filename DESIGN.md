---
version: alpha
name: Dashboard Financiero ADATEC — Design System
---

## Overview

Dashboard financiero premium con tema oscuro profesional, datos reales de cartera ADATEC (Colombia), gráficos SVG interactivos, y experiencia de usuario pulida para visualización de métricas de cartera, aging, top deudores y chatbot con RAG integrado.

## Colors

### Surface / Background

```css
--surface-page: #0a0e17;       /* Fondo principal - azul noche profundo */
--surface-sidebar: #0f1622;    /* Sidebar y paneles secundarios */
--surface-card: #111b2e;       /* Cards, contenedores y fondos de componentes */
--surface-tooltip: #1c2333;    /* Tooltips y overlays de detalle */
--surface-border: rgba(148,163,184,0.08);  /* Bordes sutiles */
```

### Text

```css
--text-primary: #f1f5f9;       /* Texto principal - encabezados */
--text-secondary: #e2e8f0;     /* Texto secundario - labels */
--text-muted: #64748b;         /* Texto sutil - metadatos */
--text-nav-inactive: #475569;  /* Navegación inactiva */
--text-dim: #334155;           /* Labels de sección en sidebar */
```

### Accent / Semantic

```css
--accent-success: #10b981;     /* Verde esmeralda - métricas positivas, KPI saldo */
--accent-success-light: #34d399; /* Verde claro - cartera corriente */
--accent-warning: #f59e0b;     /* Ámbar - alertas medias, mora */
--accent-warning-dark: #f97316; /* Naranja - riesgo 61-90 días */
--accent-danger: #ef4444;      /* Rojo - crítico, cartera vencida */
--accent-danger-dark: #dc2626; /* Rojo oscuro - 181-360 días */
--accent-danger-deeper: #b91c1c; /* Rojo profundo - +360 días */
--accent-info: #6366f1;        /* Índigo - documentos, métricas secundarias */
--accent-purple: #8b5cf6;      /* Púrpura - clientes */
--accent-cyan: #06b6d4;        /* Cian - base retención */
```

## Typography

### Font Family

```css
--font-sans: 'Inter', 'SF Pro Display', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Type Scale

```css
--fs-micro: 0.5rem;       /* 8px — badges, version info */
--fs-xs: 0.5625rem;       /* 9px — metadata, segment labels */
--fs-sm: 0.625rem;        /* 10px — table headers, badge text */
--fs-base: 0.6875rem;     /* 11px — table data, small captions */
--fs-md: 0.75rem;         /* 12px — body, nav items, card titles */
--fs-lg: 0.8125rem;       /* 13px — section headings, KPI labels */
--fs-xl: 1.25rem;         /* 20px — page titles */
--fs-2xl: 1.75rem;        /* 28px — KPI values */
```

## Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
```

## Rounded

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Shadows

```css
--shadow-card: none; /* Border-based card separation */
--shadow-elevated: 0 4px 20px rgba(0,0,0,0.3);
--shadow-tooltip: 0 8px 30px rgba(0,0,0,0.4);
```

## Components

### KPI Card
- Background: `--surface-card`
- Border: `--surface-border`
- Left content: icon circle (34px) + label
- Right: SVG sparkline (100×32)
- Value: `--fs-2xl` `--font-mono` `--text-primary`
- Delta: colored text (green=positive, red=negative)
- Sub: `--fs-xs` `--text-muted`

### Trend Chart (Facturación vs Saldo)
- Line: `--accent-success` 2.5px (facturación), `--accent-warning` dashed 1.5px (saldo)
- Area fill: accent at 8% opacity
- Grid: `rgba(148,163,184,0.07)`
- Tooltip background: `--surface-tooltip`
- Interactive: hover state shows circle markers + tooltip card

### Donut Chart (Aging Distribution)
- SVG arcs with hole punch (IR=48px, R=84px, center=110,110)
- Each segment uses its aging color
- Hover: scale(1.04) + full opacity
- Center: "Total $38.4B"
- Legend: 2-column grid below

### Aging Chart (Horizontal Bars)
- Bars: colored by aging bucket
- Width proportional to saldo / max saldo
- Text: label left, value+% right of bar
- Tooltip on hover: document count

### Client Table
- Sortable columns: Cliente, Saldo, % Total
- Risk badges: Crítico (red), Alto (amber), Medio (yellow)
- Click row to expand detail drawer below
- Inline bar indicator under Saldo values
- Monospace numbers for financial data

### Chatbot Interface
- Slide-in drawer from right (380px)
- Gradient header with avatar
- Pre-defined option buttons
- RAG-based responses from embedded data
- User bubbles: green gradient right-aligned
- Assistant bubbles: card-style left-aligned
- Source attribution: "RAG ADATEC"

### Sidebar Navigation
- Fixed left panel (210px)
- Sections with uppercase labels in `--text-dim`
- Active state: green accent + left border + 10% green bg
- Hover: subtle background change
- Footer: active status dot + version info

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| >768px | Full sidebar visible, multi-column layout |
| ≤768px | Sidebar hidden (hamburger menu), single column charts, 2-col KPIs |
| ≤480px | Single column KPIs, stacked layout |

## Animations

- `fadeIn`: 0.25s ease — view transitions, alert cards
- `slideIn`: 0.25s ease — chatbot drawer
- Chart hover: 0.15s opacity/transform transitions
- Table row hover: 0.12s background transition

## Accessibility

- `focus-visible` outlines on buttons/inputs (2px `--accent-success`)
- `prefers-reduced-motion` media query disables animations
- Semantic SVG `role="img"` with `aria-label`
- Scrollbar customization for dark theme
