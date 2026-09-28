// Graficos propios en SVG y barras accesibles. Sin librerias; el significado no depende del color.
import { svgEl } from '../canvas/shapes.js';
import { formatNumber } from '../domain/format.js';
import { h, icon } from './dom.js';

const W = 900;
const H = 280;
const LEFT = 56;
const BOTTOM = 30;
const STEP = 27;
const BAR = 19;

const STATUS = {
  normal: { label: 'Normal', d: 'M5 13l4 4L19 7' },
  aviso: { label: 'Aviso', d: 'M12 3l10 18H2z M12 10v5 M12 18v.01' },
  critico: {
    label: 'Crítico',
    d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18 M9 9l6 6 M15 9l-6 6',
  },
};

export function meterStatus(pct, thresholds) {
  if (pct >= thresholds.critical) {
    return { key: 'critico', ...STATUS.critico };
  }
  return pct >= thresholds.warning
    ? { key: 'aviso', ...STATUS.aviso }
    : { key: 'normal', ...STATUS.normal };
}

const isWeekend = (dia) => (dia - 1) % 7 >= 5;

function legendItem(swatchClass, text) {
  const item = h('li', 'legend__item');
  item.append(h('span', `legend__swatch ${swatchClass}`), h('span', '', text));
  return item;
}

function buildSvg(serie, title, summary) {
  const max = Math.max(1, ...serie.map((item) => item.casos));
  const plotH = H - BOTTOM;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart__svg', role: 'img' });
  svg.setAttribute('aria-label', `${title}. ${summary}`);
  const defs = svgEl('defs');
  const hatch = svgEl('pattern', {
    id: 'hatch-weekend',
    width: 4,
    height: 4,
    patternUnits: 'userSpaceOnUse',
    patternTransform: 'rotate(45)',
  });
  hatch.append(svgEl('rect', { width: 4, height: 4, class: 'chart__hatch-bg' }));
  hatch.append(svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 4, class: 'chart__hatch-line' }));
  defs.append(hatch);
  svg.append(defs);
  [0, 0.5, 1].forEach((share) => {
    const y = plotH - share * (plotH - 10);
    svg.append(svgEl('line', { x1: LEFT, x2: W, y1: y, y2: y, class: 'chart__grid' }));
    const label = svgEl('text', {
      x: LEFT - 6,
      y: y + 4,
      class: 'chart__axis',
      'text-anchor': 'end',
    });
    label.textContent = formatNumber(Math.round(max * share));
    svg.append(label);
  });
  serie.forEach((item, i) => {
    const height = (item.casos / max) * (plotH - 10);
    const weekend = isWeekend(item.dia);
    const bar = svgEl('rect', {
      x: LEFT + i * STEP + 1,
      y: plotH - height,
      width: BAR,
      height,
      class: weekend ? 'chart__bar chart__bar--weekend' : 'chart__bar',
    });
    const tip = svgEl('title');
    tip.textContent = `Día ${item.dia}${weekend ? ' (fin de semana)' : ''}: ${formatNumber(item.casos)} casos`;
    bar.append(tip);
    svg.append(bar);
  });
  [1, 15, 30].forEach((dia) => {
    const label = svgEl('text', {
      x: LEFT + (dia - 1) * STEP + BAR / 2,
      y: H - 6,
      class: 'chart__axis',
      'text-anchor': 'middle',
    });
    label.textContent = `Día ${dia}`;
    svg.append(label);
  });
  return svg;
}

function valuesTable(serie) {
  const details = h('details', 'chart__values');
  details.append(h('summary', '', 'Ver los valores día por día'));
  const table = h('table', 'table');
  const head = h('tr');
  ['Día', 'Casos atendidos'].forEach((text) => {
    const th = h('th', '', text);
    th.scope = 'col';
    head.append(th);
  });
  table.append(h('caption', 'visually-hidden', 'Casos atendidos por día'), head);
  serie.forEach((item) => {
    const row = h('tr');
    row.append(h('td', '', String(item.dia)), h('td', '', formatNumber(item.casos)));
    table.append(row);
  });
  details.append(table);
  return details;
}

// Barras de casos por dia del mes (30 dias). Fines de semana con trama rayada.
export function casesChart(serie) {
  const total = serie.reduce((acc, item) => acc + item.casos, 0);
  const peak = serie.reduce((a, b) => (b.casos > a.casos ? b : a));
  const title = 'Casos atendidos por día';
  const summary = `Total del mes ${formatNumber(total)} casos; el día más alto es el ${peak.dia} con ${formatNumber(peak.casos)}.`;
  const figure = h('figure', 'chart');
  const caption = h('figcaption', 'chart__title', title);
  const legend = h('ul', 'legend');
  legend.setAttribute('aria-label', 'Leyenda del gráfico');
  legend.append(legendItem('legend__swatch--solid', 'Día hábil'));
  legend.append(legendItem('legend__swatch--hatch', 'Fin de semana'));
  figure.append(caption, h('p', 'muted', summary), buildSvg(serie, title, summary), legend);
  figure.append(valuesTable(serie));
  return figure;
}

// Medidor consumo vs cupo con porcentaje en texto, marca en el umbral de aviso y estado con icono.
export function meterBar({ label, usado, cupo, pct, unit, digits = 0, thresholds }) {
  const status = meterStatus(pct, thresholds);
  const box = h('div', `meter meter--${status.key}`);
  const head = h('div', 'meter__head');
  const state = h('span', 'meter__state');
  state.append(icon(status.d), h('span', '', status.label));
  head.append(h('span', 'meter__label', label), state);
  const track = h('div', 'meter__track');
  track.setAttribute('role', 'meter');
  track.setAttribute('aria-label', `${label}: ${pct} % del cupo. Estado: ${status.label}`);
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', String(cupo));
  track.setAttribute('aria-valuenow', String(usado));
  const fill = h('span', 'meter__fill');
  fill.style.width = `${Math.min(100, pct)}%`;
  const mark = h('span', 'meter__mark');
  mark.style.insetInlineStart = `${thresholds.warning}%`;
  track.append(fill, mark);
  const foot = `${formatNumber(usado, digits)} de ${formatNumber(cupo)} ${unit} (${pct} % del cupo incluido)`;
  box.append(head, track, h('p', 'meter__text', foot));
  return box;
}
