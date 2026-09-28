// Conexiones: curva bezier con flecha "luego". Las condicionales llevan etiqueta y trazo
// distinto (discontinuo y mas grueso), asi no dependen solo del color.
import { NODE_W, NODE_H, svgEl } from './shapes.js';

const LABEL_H = 24;

export function edgeGeometry(from, to) {
  const p0 = { x: from.x + NODE_W, y: from.y + NODE_H / 2 };
  const p3 = { x: to.x, y: to.y + NODE_H / 2 };
  const off = Math.max(50, Math.abs(p3.x - p0.x) / 2);
  const c1 = { x: p0.x + off, y: p0.y };
  const c2 = { x: p3.x - off, y: p3.y };
  const d = `M${p0.x},${p0.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p3.x},${p3.y}`;
  const mid = {
    x: (p0.x + 3 * c1.x + 3 * c2.x + p3.x) / 8,
    y: (p0.y + 3 * c1.y + 3 * c2.y + p3.y) / 8,
  };
  return { d, mid };
}

export function createEdgeEl() {
  const g = svgEl('g', { class: 'edge', role: 'button', tabindex: '0' });
  g.append(svgEl('path', { class: 'edge__hit' }), svgEl('path', { class: 'edge__line' }));
  g.append(svgEl('title'));
  return g;
}

function buildLabel(text, mid) {
  const width = Math.min(220, text.length * 6.8 + 20);
  const label = svgEl('g', { class: 'edge__label', 'aria-hidden': 'true' });
  label.append(
    svgEl('rect', {
      x: mid.x - width / 2,
      y: mid.y - LABEL_H / 2,
      width,
      height: LABEL_H,
      rx: LABEL_H / 2,
    }),
  );
  const t = svgEl('text', { x: mid.x, y: mid.y, 'text-anchor': 'middle' });
  t.textContent = text;
  label.append(t);
  return label;
}

export function updateEdgeEl(el, edge, fromNode, toNode, selected) {
  const { d, mid } = edgeGeometry(fromNode, toNode);
  const conditional = Boolean(edge.condition);
  el.dataset.id = edge.id;
  el.classList.toggle('edge--conditional', conditional);
  el.classList.toggle('edge--selected', selected);
  el.setAttribute('aria-pressed', String(selected));
  el.querySelector('.edge__hit').setAttribute('d', d);
  const line = el.querySelector('.edge__line');
  line.setAttribute('d', d);
  line.setAttribute('marker-end', `url(#${conditional ? 'arrow-cond' : 'arrow'})`);
  const summary = `Luego: «${fromNode.label}» a «${toNode.label}»`;
  const full = conditional ? `${summary}. Condición: ${edge.condition}` : summary;
  el.setAttribute('aria-label', `${full}. Enter para ajustar, Supr para eliminar.`);
  el.querySelector('title').textContent = full;
  const oldLabel = el.querySelector('.edge__label');
  if (oldLabel) {
    oldLabel.remove();
  }
  if (conditional) {
    el.append(buildLabel(edge.condition, mid));
  }
}
