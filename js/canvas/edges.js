// Conexiones: curva bezier con flecha "luego". Las condicionales llevan una etiqueta en chip
// (con rombo) y trazo discontinuo, asi no dependen solo del color.
import { NODE_W, NODE_H, svgEl } from './shapes.js';

const LABEL_H = 26;
const ARROW_GAP = 8;

export function bezier(p0, p3) {
  const off = Math.max(60, Math.abs(p3.x - p0.x) / 2);
  const c1 = { x: p0.x + off, y: p0.y };
  const c2 = { x: p3.x - off, y: p3.y };
  const d = `M${p0.x},${p0.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p3.x},${p3.y}`;
  const mid = {
    x: (p0.x + 3 * c1.x + 3 * c2.x + p3.x) / 8,
    y: (p0.y + 3 * c1.y + 3 * c2.y + p3.y) / 8,
  };
  return { d, mid };
}

export function edgeGeometry(from, to) {
  const p0 = { x: from.x + NODE_W, y: from.y + NODE_H / 2 };
  const p3 = { x: to.x - ARROW_GAP, y: to.y + NODE_H / 2 };
  return bezier(p0, p3);
}

export function createEdgeEl() {
  const g = svgEl('g', { class: 'edge', role: 'button', tabindex: '0' });
  g.append(svgEl('path', { class: 'edge__hit' }), svgEl('path', { class: 'edge__line' }));
  g.append(svgEl('title'));
  return g;
}

function buildLabel(text, mid) {
  const width = Math.min(240, text.length * 6.6 + 34);
  const label = svgEl('g', { class: 'edge__label', 'aria-hidden': 'true' });
  label.append(
    svgEl('rect', {
      x: mid.x - width / 2,
      y: mid.y - LABEL_H / 2,
      width,
      height: LABEL_H,
      rx: LABEL_H / 2,
    }),
    svgEl('path', {
      class: 'edge__diamond',
      d: `M${mid.x - width / 2 + 13},${mid.y - 4.5} l4.5,4.5 l-4.5,4.5 l-4.5,-4.5 z`,
    }),
  );
  const t = svgEl('text', { x: mid.x + 8, y: mid.y, 'text-anchor': 'middle' });
  t.textContent = text;
  label.append(t);
  return label;
}

function markerFor(conditional, active) {
  if (active) {
    return 'arrow-active';
  }
  return conditional ? 'arrow-cond' : 'arrow';
}

export function updateEdgeEl(el, edge, fromNode, toNode, flags) {
  const { selected, active, done } = flags;
  const { d, mid } = edgeGeometry(fromNode, toNode);
  const conditional = Boolean(edge.condition);
  el.dataset.id = edge.id;
  el.classList.toggle('edge--conditional', conditional);
  el.classList.toggle('edge--selected', selected);
  el.classList.toggle('edge--active', active);
  el.classList.toggle('edge--done', done);
  el.setAttribute('aria-pressed', String(selected));
  const key = `${d}|${edge.condition ?? ''}`;
  if (el.dataset.key !== key) {
    el.dataset.key = key;
    el.querySelector('.edge__hit').setAttribute('d', d);
    el.querySelector('.edge__line').setAttribute('d', d);
    const summary = `Luego: «${fromNode.label}» a «${toNode.label}»`;
    const full = conditional ? `${summary}. Condición: ${edge.condition}` : summary;
    el.setAttribute('aria-label', `${full}. Enter para ajustar, Supr para eliminar.`);
    el.querySelector('title').textContent = full;
    el.querySelector('.edge__label')?.remove();
    if (conditional) {
      el.append(buildLabel(edge.condition, mid));
    }
  }
  const useActive = active || done;
  el.querySelector('.edge__line').setAttribute(
    'marker-end',
    `url(#${markerFor(conditional, useActive)})`,
  );
}
