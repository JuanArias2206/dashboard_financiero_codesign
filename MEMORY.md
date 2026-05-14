---
schemaVersion: 1
scope: workspace
updatedAt: "2026-05-14T12:40:16.386Z"
workspaceName: "Dashboard Financiero ADATEC Premium"
---

# Project Memory

## Project Overview
This workspace builds a premium financial dashboard for ADATEC cartera management, with real data ($38.37B cartera, 89K documentos, 2,854 clientes, 92.5% vencida), interactive SVG charts, modular components, and an integrated RAG chatbot for financial analysis.

## Current State
- **App.jsx** — single‑file React app (~700 lines) with 4 navigable views: Panel General (KPIs reales + AgingChart + DonutChart), Analítica (TrendChart facturación vs saldo), Clientes (ClientTable ordenable con drawer de detalle), Alertas (5 alertas estratificadas con recomendaciones)
- **8 modular components** in `components/`: DataContext, KpiCard, AgingChart, TrendChart, DonutChart, ClientTable, ChatbotInterface, AlertBanner
- **Sidebar** with 4 nav sections + chatbot toggle button
- **Drawer** for client detail on row click
- **Chatbot RAG** integrado con resúmenes financieros reales (estado general, aging, deudores, eficiencia, riesgos)
- **DESIGN.md** documenting tokens colors, typography, spacing, components
- All real data from `data/dashboard_data.json` and `data/processed/` (period_index, financial_summaries, rag_chunks, cartera_sample, customer_index)
- 0 console errors, 0 asset errors verified

## Artifacts
- **App.jsx** — main application, ~700 lines JSX + inline SVG + CSS, all components inlined via data injection
- **components/DataContext.jsx** — embeds real ADATEC KPI data, trend data, aging buckets, client sample, alerts
- **components/KpiCard.jsx** — reusable KPI card with icon, delta, sparkline
- **components/AgingChart.jsx** — horizontal stacked bar chart for cartera aging buckets
- **components/TrendChart.jsx** — line/bar chart with tooltips, facturación vs saldo over 12 months
- **components/DonutChart.jsx** — interactive donut with hover sector highlight
- **components/ClientTable.jsx** — sortable client table with status badges, expandable drawer with full detail
- **components/ChatbotInterface.jsx** — RAG chatbot with typing indicator, predefined questions, streaming-like responses
- **components/AlertBanner.jsx** — hierarchical alert card (crítico, alto, medio)
- **DESIGN.md** — token system documenting colors, typography, spacing, radii, shadows, component styles
- **data/dashboard_data.json** — raw financial data export (4,159 lines)

## Design Direction
Professional dark‑mode‑first palette (`#0a0e17` background, `#111b2e` surface). Accent green (`#10b981`) for positive metrics, amber (`#f59e0b`) for warnings, red (`#ef4444`) for critical alerts. Typography uses Inter/system-ui. All data visualizations are pure SVG. Numbers render in monospace with tabular figures for financial precision. Responsive layout with sidebar toggle below 640px.

## User Feedback
Requested improvements on existing dashboard beyond App.jsx — resulting in full modular architecture with real ADATEC data, chatbot integration, 4 navigable views, and alert system.

## Decisions
- Real ADATEC data replaces fake demo data (source: dashboard_data.json + processed summaries)
- 4‑view navigation architecture (Panel General, Analítica, Clientes, Alertas)
- Chatbot embedded as overlay drawer toggleable from sidebar, not separate page
- Client table with sortable columns + expandable detail drawer (same pattern as transactions)
- Alerts shown as hierarchical banner list with color‑coded severity (critico=rojo, alto=ámbar, medio=azul)
- TrendChart shows facturación (bars) vs saldo cartera (line) for financial context
- DonutChart shows aging distribution with hover highlight
- All components accept data via props (no external state management needed)
- Dark theme default, no light toggle
- Responsive breakpoint: single column below 640px, sidebar becomes toggleable overlay

## Open Questions
- Should chatbot use real DeepSeek API or stay with local RAG simulation?
- Is export to CSV/Excel needed for ClientTable?
- Should light mode be added for print/export scenarios?
- Should aging data be live from API or refreshed periodically?

## Next Steps
- Confirm direction with user
- Test on mobile devices, refine sidebar collapse/overlay behavior
- Add loading/empty states for charts
- Add animated transitions on chart appearance (fadeIn, bar grow)
- Consider splitting App.jsx further into view-level components
- Add download/export functionality for reports

## Promotion Candidates For DESIGN.md
Stable tokens already fully documented in DESIGN.md. New tokens added: alert severity colors (#ef4444 crítico, #f59e0b alto, #3b82f6 medio), monospace font for financial numbers, drawer slide animation keyframes.

## Recent History
- 2026-05-14T12:40:16: Complete rewrite with real ADATEC data, modular components (8 files), 4-view navigation, RAG chatbot, alert system. Verified 0 errors. DESIGN.md updated with new tokens. Title set to Dashboard Financiero ADATEC Premium.