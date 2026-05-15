import {
  Home,
  LineChart,
  ClipboardList,
  Wallet,
  Boxes,
  Clock,
  ShoppingCart,
  Telescope,
  CalendarDays,
  Users,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'RSales Analytics',
    items: [
      { id: 'inicio', label: 'Inicio · Indicadores', icon: Home },
      { id: 'resumen-gestion', label: 'Resumen Gestión Comercial', icon: LineChart },
    ],
  },
  {
    label: 'Cartera',
    items: [
      { id: 'control-cartera', label: 'Control de Cartera', icon: ClipboardList },
      { id: 'reporte-recaudos', label: 'Reporte Recaudos', icon: Wallet },
    ],
  },
  {
    label: 'Inventario y Ventas',
    items: [
      { id: 'inventario', label: 'Análisis de Inventario', icon: Boxes },
      { id: 'tiempos', label: 'Control de Tiempos', icon: Clock },
      { id: 'pedidos', label: 'Pedido / Factura / Cotización', icon: ShoppingCart },
    ],
  },
  {
    label: 'Forecast',
    items: [
      { id: 'prediccion', label: 'Predicción de Recaudos', icon: Telescope },
    ],
  },
  {
    label: 'Próximamente',
    items: [
      { id: 'agenda', label: 'Agenda detallada', icon: CalendarDays, soon: true },
      { id: 'clientes', label: 'Clientes Gestionados', icon: Users, soon: true },
    ],
  },
];

export const SECTION_INFO = {
  inicio: { title: 'Inicio · Indicadores', crumb: 'RSales Analytics' },
  'resumen-gestion': { title: 'Resumen Gestión Comercial', crumb: 'RSales Analytics' },
  'control-cartera': { title: 'Control de Cartera', crumb: 'Cartera' },
  'reporte-recaudos': { title: 'Reporte Recaudos', crumb: 'Cartera' },
  inventario: { title: 'Análisis de Inventario', crumb: 'Inventario y Ventas' },
  tiempos: { title: 'Control de Tiempos', crumb: 'Inventario y Ventas' },
  pedidos: { title: 'Pedido / Factura / Cotización', crumb: 'Inventario y Ventas' },
  prediccion: { title: 'Predicción de Recaudos', crumb: 'Forecast' },
};
