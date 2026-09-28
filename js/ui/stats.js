// Estadisticas de negocio (datos de ejemplo). Sin metricas internas de la plataforma.
import { formatCurrency, formatDuration, formatNumber, formatPercent } from '../domain/format.js';
import { casesChart } from './charts.js';
import { h, icon } from './dom.js';
import { emptyResults, isBlank } from './results-empty.js';

const VOLUMES = [1000, 3000, 6000, 10000];

// Un icono por indicador (refuerzo visual; el rotulo siempre esta en texto).
const KPI_ICONS = [
  'M4 20V10M10 20V4M16 20v-8M22 20H2',
  'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  'M5 4h14v16H5zM9 9h6M9 13h6',
  'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  'M5 13l4 4L19 7',
  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  'M13 2L4 14h7l-1 8 9-12h-7z',
  'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a6 6 0 0 1 12 0M17 11l2 2 4-4',
  'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
];

function kpi(label, value, hint, index) {
  const item = h('li', 'kpi');
  const head = h('span', 'kpi__head');
  head.append(h('span', 'kpi__icon'), h('span', 'kpi__label', label));
  head.firstChild.append(icon(KPI_ICONS[index]));
  item.append(head, h('strong', 'kpi__value', value));
  if (hint) {
    item.append(h('span', 'kpi__hint', hint));
  }
  return item;
}

function volumeControl(store) {
  const wrapper = h('div', 'field field--inline');
  const label = h('label', 'field__label', 'Casos por mes que atenderá el asistente');
  const select = document.createElement('select');
  select.id = 'volume-select';
  select.className = 'select';
  label.htmlFor = select.id;
  VOLUMES.forEach((value) => {
    const option = h('option', '', formatNumber(value));
    option.value = String(value);
    select.append(option);
  });
  select.value = String(store.getState().scenario.casosMes);
  select.addEventListener('change', () => {
    store.dispatch({ type: 'SET_VOLUME', casosMes: Number(select.value) });
  });
  wrapper.append(label, select);
  return wrapper;
}

function buildBody(model) {
  const { metrics, invoice } = model;
  const serie = metrics.serie;
  const semana = serie.slice(-7).reduce((acc, item) => acc + item.casos, 0);
  const ai = invoice.lineas.find((line) => line.key === 'ai');
  const list = h('ul', 'kpis');
  list.append(
    kpi('Casos atendidos hoy', formatNumber(serie[serie.length - 1].casos), undefined, 0),
    kpi('Casos atendidos en la semana', formatNumber(semana), undefined, 1),
    kpi('Casos atendidos en el mes', formatNumber(metrics.casos), undefined, 2),
    kpi('Resueltos sin intervención humana', formatPercent(metrics.automaticosPct, 1), undefined, 3),
    kpi('Casos resueltos con éxito', formatPercent(metrics.exitoPct, 1), undefined, 4),
    kpi('Tiempo típico de respuesta', formatDuration(metrics.p50s), 'La mayoría de los casos', 5),
    kpi('Peor caso de respuesta', formatDuration(metrics.p95s), 'Casos más lentos', 6),
    kpi(
      'Aprobaciones pendientes',
      formatNumber(metrics.aprobacionesPend),
      'Esperan a un supervisor',
      7,
    ),
    kpi('Casos frenados por seguridad', formatPercent(metrics.bloqueadosPct, 1), undefined, 8),
    kpi(
      'Consumo de IA del mes',
      formatCurrency(ai.monto, invoice.currency, 2),
      'Precio ilustrativo',
      9,
    ),
  );
  const chart = h('div', 'panel');
  chart.append(casesChart(serie));
  return [list, chart];
}

export function mountStats(root, store, getModel) {
  const head = h('div', 'section-head');
  head.append(h('h2', '', 'Cómo rinde el asistente'));
  const body = h('div', 'stats-grid');
  const volume = volumeControl(store);
  root.replaceChildren(head, volume, body);
  const paint = () => {
    const state = store.getState();
    volume.hidden = isBlank(state);
    body.replaceChildren(...(isBlank(state) ? [emptyResults(store)] : buildBody(getModel(state))));
  };
  paint();
  store.subscribe((state) => state.graph, paint);
  store.subscribe((state) => state.scenario, paint);
}
