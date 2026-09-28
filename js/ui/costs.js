// Costos estimados por servicio facturable y consumo frente al cupo. Precios ilustrativos.
import { PRICING } from '../pricing.config.js';
import { formatCurrency, formatNumber } from '../domain/format.js';
import { meterBar } from './charts.js';
import { h } from './dom.js';
import { isBlank } from './results-empty.js';

const DETAIL = {
  plan: 'Cuota mensual fija',
  runs: 'Solo casos sobre el cupo incluido',
  ai: 'Según el uso estimado de IA',
  rag_gb: 'Solo espacio sobre el cupo incluido',
  docs: 'Solo documentos sobre el cupo incluido',
  integration_calls: 'Solo consultas sobre el cupo incluido',
  constructor_seats: 'Usuarios adicionales al cupo incluido',
  operator_seats: 'Usuarios adicionales al cupo incluido',
};

const METERS = [
  { key: 'runs', unit: 'casos', digits: 0 },
  { key: 'docs', unit: 'documentos', digits: 0 },
  { key: 'rag_gb', unit: 'GB', digits: 1 },
  { key: 'integration_calls', unit: 'consultas', digits: 0 },
];

function cell(text, label, className) {
  const td = h('td', className, text);
  td.dataset.label = label;
  return td;
}

function invoiceTable(invoice) {
  const money = (value) => formatCurrency(value, invoice.currency, 2);
  const table = h('table', 'table table--stack');
  table.append(h('caption', 'visually-hidden', 'Costo estimado por servicio'));
  const head = h('tr');
  ['Servicio', 'Cantidad', 'Tarifa', 'Monto'].forEach((text) => {
    const th = h('th', '', text);
    th.scope = 'col';
    head.append(th);
  });
  const thead = h('thead');
  thead.append(head);
  const tbody = h('tbody');
  invoice.lineas.forEach((line) => {
    const row = h('tr');
    const name = cell('', 'Servicio', 'table__name');
    name.append(h('strong', '', line.concepto), h('span', 'table__hint', DETAIL[line.key]));
    row.append(
      name,
      cell(formatNumber(line.cantidad, line.cantidad % 1 ? 1 : 0), 'Cantidad', 'num'),
      cell(formatCurrency(line.tarifa, invoice.currency, line.tarifa < 1 ? 3 : 2), 'Tarifa', 'num'),
      cell(money(line.monto), 'Monto', 'num'),
    );
    tbody.append(row);
  });
  const foot = h('tfoot');
  [
    ['Subtotal', invoice.subtotal],
    [`Descuento (${PRICING.discountPercent} %)`, -invoice.descuento],
    ['Total estimado por mes', invoice.total],
  ].forEach(([text, value], i) => {
    const row = h('tr', i === 2 ? 'table__total' : '');
    const th = h('th', '', text);
    th.scope = 'row';
    th.colSpan = 3;
    row.append(th, cell(money(value), text, 'num'));
    foot.append(row);
  });
  table.append(thead, tbody, foot);
  return table;
}

function buildBody(model) {
  const { metrics, invoice } = model;
  const meters = h('div', 'panel stack');
  meters.append(h('h3', 'panel__title', 'Consumo frente al cupo incluido'));
  meters.append(
    h(
      'p',
      'muted',
      `Aviso desde el ${PRICING.thresholds.warning} % del cupo; crítico al llegar al ${PRICING.thresholds.critical} %.`,
    ),
  );
  METERS.forEach(({ key, unit, digits }) => {
    meters.append(
      meterBar({
        label: PRICING.concepts[key],
        unit,
        digits,
        thresholds: PRICING.thresholds,
        ...metrics.consumo[key],
      }),
    );
  });
  const bill = h('div', 'panel stack');
  bill.append(h('h3', 'panel__title', 'Costo estimado por servicio'), invoiceTable(invoice));
  bill.append(h('p', 'notice-box', PRICING.notice));
  return [meters, bill];
}

export function mountCosts(root, store, getModel) {
  const head = h('div', 'section-head');
  head.append(
    h('h2', '', 'Cuánto costaría'),
    h('p', 'tag tag--illustrative', 'Precios ilustrativos'),
  );
  const body = h('div', 'cost-grid');
  root.replaceChildren(head, body);
  const paint = () => {
    const state = store.getState();
    root.hidden = isBlank(state); // sin pasos no hay costos que mostrar
    if (!root.hidden) {
      body.replaceChildren(...buildBody(getModel(state)));
    }
  };
  paint();
  store.subscribe((state) => state.graph, paint);
  store.subscribe((state) => state.scenario, paint);
}
