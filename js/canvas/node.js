// Tarjeta de paso: cabecera por categoria (chip con icono + etiqueta), titulo, subtitulo,
// insignia de estado y puertos circulares de entrada y salida.
import { getCategory } from '../data/categories.js';
import { NODE_W, NODE_H, HEADER_H, svgEl, wrapLabel, truncate } from './shapes.js';

const R = 12;
const TITLE_CHARS = 25;
const LINE_H = 17;
const BADGE_H = 18;
const HEADER_PATH = `M0,${HEADER_H} V${R} A${R},${R} 0 0 1 ${R},0 H${NODE_W - R} A${R},${R} 0 0 1 ${NODE_W},${R} V${HEADER_H} Z`;

function handle(side) {
  const x = side === 'in' ? 0 : NODE_W;
  const g = svgEl('g', { class: `handle handle--${side}`, 'aria-hidden': 'true' });
  if (side === 'out') {
    g.append(
      svgEl('rect', {
        class: 'handle__hit',
        x: x - 10,
        y: NODE_H / 2 - 22,
        width: 34,
        height: 44,
        rx: 12,
      }),
    );
  }
  g.append(svgEl('circle', { class: 'handle__dot', cx: x, cy: NODE_H / 2, r: 6 }));
  return g;
}

export function buildNode(entry) {
  const cat = getCategory(entry.category);
  const g = svgEl('g', {
    class: `node node--${entry.category}`,
    role: 'button',
    tabindex: '0',
    'aria-describedby': 'canvas-help',
  });
  const icon = svgEl('svg', {
    class: 'node__icon',
    x: 11,
    y: 7,
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  });
  icon.innerHTML = entry.icon;
  const badge = svgEl('g', { class: 'node__badge', 'aria-hidden': 'true' });
  badge.append(
    svgEl('rect', { height: BADGE_H, y: 7, rx: BADGE_H / 2 }),
    svgEl('text', { y: 7 + BADGE_H / 2 }),
  );
  const cattext = svgEl('text', { class: 'node__cat', x: 38, y: HEADER_H / 2 });
  cattext.textContent = cat.tag;
  const sub = svgEl('text', { class: 'node__sub', x: 12, y: NODE_H - 12 });
  sub.textContent = truncate(entry.label, 32);
  g.append(
    svgEl('rect', {
      class: 'node__ring',
      x: -5,
      y: -5,
      width: NODE_W + 10,
      height: NODE_H + 10,
      rx: R + 5,
    }),
    svgEl('rect', { class: 'node__card', width: NODE_W, height: NODE_H, rx: R }),
    svgEl('path', { class: 'node__header', d: HEADER_PATH }),
    svgEl('rect', { class: 'node__chip', x: 9, y: 5, width: 22, height: 22, rx: cat.chipRadius }),
    icon,
    cattext,
    badge,
    svgEl('text', { class: 'node__title', x: 12 }),
    sub,
    handle('in'),
    handle('out'),
    svgEl('title'),
  );
  return g;
}

export function setNodeText(g, node) {
  if (g.dataset.label === node.label) {
    return;
  }
  g.dataset.label = node.label;
  const text = g.querySelector('.node__title');
  text.replaceChildren();
  const lines = wrapLabel(node.label, TITLE_CHARS);
  lines.forEach((line, i) => {
    const tspan = svgEl('tspan', { x: 12, y: HEADER_H + 15 + i * LINE_H });
    tspan.textContent = line;
    text.append(tspan);
  });
  g.querySelector('title').textContent = node.label;
}

// Insignia de estado: "En curso" / "Hecho" durante el recorrido; si no, "Inicio" o "Final".
export function setNodeBadge(g, text, kind) {
  const badge = g.querySelector('.node__badge');
  badge.style.display = text ? '' : 'none';
  badge.dataset.kind = kind ?? '';
  if (!text) {
    return;
  }
  const width = Math.round(text.length * 6.6 + 16);
  const x = NODE_W - 10 - width;
  const rect = badge.querySelector('rect');
  rect.setAttribute('x', x);
  rect.setAttribute('width', width);
  const label = badge.querySelector('text');
  label.setAttribute('x', x + width / 2);
  label.textContent = text;
}
