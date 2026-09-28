// Estadisticas de negocio (datos de ejemplo). Sin metricas internas de la plataforma.
import { formatCurrency, formatDuration, formatNumber, formatPercent } from '../domain/format.js';
import { casesChart } from './charts.js';
import { h } from './dom.js';

const VOLUMES = [1000, 3000, 6000, 10000];

function kpi(label, value, hint) {
  const item = h('li', 'kpi');
  item.append(h('span', 'kpi__label', label), h('strong', 'kpi__value', value));
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
    kpi('Casos atendidos hoy', formatNumber(serie[serie.length - 1].casos)),
    kpi('Casos atendidos en la semana', formatNumber(semana)),
    kpi('Casos atendidos en el mes', formatNumber(metrics.casos)),
    kpi('Resueltos sin intervención humana', formatPercent(metrics.automaticosPct, 1)),
    kpi('Casos resueltos con éxito', formatPercent(metrics.exitoPct, 1)),
    kpi('Tiempo típico de respuesta', formatDuration(metrics.p50s), 'La mayoría de los casos'),
    kpi('Peor caso de respuesta', formatDuration(metrics.p95s), 'Casos más lentos'),
    kpi(
      'Aprobaciones pendientes',
      formatNumber(metrics.aprobacionesPend),
      'Esperan a un supervisor',
    ),
    kpi('Casos frenados por seguridad', formatPercent(metrics.bloqueadosPct, 1)),
    kpi(
      'Consumo de IA del mes',
      formatCurrency(ai.monto, invoice.currency, 2),
      'Precio ilustrativo',
    ),
  );
  const chart = h('div', 'panel');
  chart.append(casesChart(serie));
  return [list, chart];
}

export function mountStats(root, store, getModel) {
  const head = h('div', 'section-head');
  head.append(
    h('h2', '', 'Cómo rinde el asistente'),
    h('p', 'tag tag--example', 'Datos de ejemplo'),
  );
  const body = h('div', 'stack');
  root.replaceChildren(head, volumeControl(store), body);
  const paint = () => body.replaceChildren(...buildBody(getModel(store.getState())));
  paint();
  store.subscribe((state) => state.graph, paint);
  store.subscribe((state) => state.scenario, paint);
}
