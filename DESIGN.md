---
version: alpha
name: Dashboard Financiero Premium — Design System
---

## Overview

Dashboard financiero premium con tema oscuro profesional, gráficos SVG interactivos, y experiencia de usuario pulida para visualización de métricas financieras, portafolio de inversiones y transacciones.

## Principles

- **Claridad financiera**: Los datos son el centro. Cada elemento existe para hacer la información más comprensible.
- **Profesional y sobrio**: Paleta oscura con acentos verdes que transmiten confianza y crecimiento.
- **Interactividad sin fricción**: Tooltips en gráficos, hover en cards, drawer de detalle — la información aparece donde se necesita.

## Colors

### Surface / Background

```css
--surface-page: #0a0e17;       /* Fondo principal - azul noche profundo */
--surface-sidebar: #0f1622;    /* Sidebar */
--surface-card: #111b2e;       /* Cards y contenedores */
--surface-tooltip: #1c2333;    /* Tooltips y overlays */
--surface-border: rgba(148,163,184,0.08);  /* Bordes sutiles */
```

### Text

```css
--text-primary: #f1f5f9;       /* Texto principal */
--text-secondary: #e2e8f0;     /* Texto secundario */
--text-muted: #64748b;         /* Texto sutil */
--text-nav-inactive: #475569;  /* Navegación inactiva */
```

### Accent / Semantic

```css
--accent-success: #10b981;     /* Verde - ingresos, positivo, completado */
--accent-warning: #f59e0b;     /* Ámbar - alertas, meta, pendiente */
--accent-danger: #ef4444;      /* Rojo - egresos, riesgo, rechazado */
--accent-info: #6366f1;        /* Índigo - info, gastos cloud */
--accent-purple: #8b5cf6;      /* Púrpura - R&D, portafolio */
--accent-cyan: #06b6d4;        /* Cian - alternativo */
--accent-pink: #ec4899;        /* Rosa - alternativo */
```

## Typography

### Font Family

```css
--font-sans: 'Inter', 'SF Pro Display', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Type Scale

```css
--fs-micro: 0.625rem;    /* 10px — badges, labels */
--fs-xs: 0.6875rem;     /* 11px — metadata, table data */
--fs-sm: 0.75rem;       /* 12px — breadcrumb, subtle text */
--fs-base: 0.8125rem;   /* 13px — body, nav items */
--fs-md: 0.9375rem;     /* 15px — card titles */
--fs-lg: 1rem;          /* 16px — section headings */
--fs-xl: 1.75rem;       /* 28px — page title */
--fs-2xl: 2rem;         /* 32px — KPI value */
```

## Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 28px;
```

## Rounded

```css
--rounded-sm: 6px;      /* Badges, sparkline containers */
--rounded-md: 8px;      /* Buttons, nav items, inputs */
--rounded-lg: 10px;     /* Search bar, period selector */
--rounded-xl: 16px;     /* Cards */
--rounded-2xl: 18px;    /* Chart containers */
--rounded-full: 9999px; /* Status badges */
```

## Components

### KPI Card

#### States
- **Default**: Surface card con border sutil
- **Hover**: translateY(-2px) + box-shadow elevado

#### Layout
- Flex row con valor a la izquierda y sparkline a la derecha
- Delta indicator debajo del valor

### Sidebar Navigation

#### States
- **Default**: Texto muted (#64748b), sin bg
- **Active**: Fondo verde translúcido + inset border izquierdo verde (#10b981)
- **Hover (inactive)**: Fondo sutil rgba(148,163,184,0.06)

#### Layout
- 228px ancho, secciones agrupadas con label uppercase
- Logo con gradiente linear-gradient(135deg, #10b981, #059669)

### Transaction Row

#### States
- **Default**: Border-bottom sutil
- **Hover**: Fondo rgba(148,163,184,0.04)
- **Click**: Abre drawer de detalle

#### Variants por tipo
- **incoming**: Monto en verde (#10b981)
- **outgoing**: Monto en rojo (#f87171)

#### Badge por estado
- **Completada**: bg rgba(16,185,129,0.12) + text #34d399
- **Pendiente**: bg rgba(245,158,11,0.12) + text #fbbf24
- **Rechazada**: bg rgba(239,68,68,0.12) + text #f87171

### Charts (Inline SVG)

#### Revenue Chart (Area)
- Grid lines sutiles, area fill 10% opacity
- Tooltip en hover: rect + texto con valor exacto y comparación vs meta
- Línea dashed para target

#### Expense Chart (Bar)
- Barras horizontales con radio 6px, colores por categoría
- Label de categoría + valor en K

#### Portfolio Donut
- SVG viewBox 200x200, slices con stroke separador
- Label interno cuando pct > 8%
- Centro con valor total

## Shadows / Elevation

```css
--shadow-card-resting: none;
--shadow-card-hover: 0 8px 24px rgba(0,0,0,0.3);
--shadow-drawer: -16px 0 48px rgba(0,0,0,0.4);
--shadow-overlay: rgba(0,0,0,0.65);
```

## Motion

```css
--transition-fast: 0.12s ease;
--transition-base: 0.15s ease;
--transition-slow: 0.25s ease;
--animation-fade: fadeIn 0.2s ease;
```

## Responsive Breakpoints

```css
--bp-mobile: 640px;
--bp-tablet: 1024px;
--bp-desktop: 1400px;
```

## Graph Interactivity Design

### Revenue Chart Tooltip
- Trigger: hover sobre área invisible de 28px por datapoint
- Content: valor actual ($XXK), mes, comparación vs meta
- Positioning: clamp entre bordes del SVG para evitar clipping

### Card Hover Elevation
- KPI cards: translateY(-2px) + shadow-lg
- Transaction rows: background highlight
- Chart containers: sin hover para mantener focus en datos

### Transaction Drawer
- Trigger: click en cualquier fila de transacciones
- Ancho: 400px desktop, 96vw mobile
- Backdrop: rgba(0,0,0,0.65) con fadeIn animation
- Contenido: monto destacado, metadata en pares label/value, acciones
