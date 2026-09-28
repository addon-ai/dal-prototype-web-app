// Render SVG del lienzo. Los elementos se reutilizan por id (no se recrean al mover),
// asi el arrastre con Pointer Events y el foco de teclado no se pierden.
import { getCatalogEntry } from '../data/catalog.js';
import { NODE_W, NODE_H, shapePath, shapeLayout, svgEl, wrapLabel } from './shapes.js';
import { createEdgeEl, updateEdgeEl } from './edges.js';

const MIN_W = 960;
const MIN_H = 480;
const PAD = 80;
const LINE_H = 16;

function markers() {
  const defs = svgEl('defs');
  ['arrow', 'arrow-cond'].forEach((id) => {
    const marker = svgEl('marker', {
      id,
      viewBox: '0 0 10 10',
      refX: 9,
      refY: 5,
      markerWidth: 10,
      markerHeight: 10,
      markerUnits: 'userSpaceOnUse',
      orient: 'auto-start-reverse',
    });
    marker.append(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: `arrow ${id}` }));
    defs.append(marker);
  });
  const grid = svgEl('pattern', {
    id: 'grid',
    width: 32,
    height: 32,
    patternUnits: 'userSpaceOnUse',
  });
  grid.append(svgEl('path', { d: 'M32,0 H0 V32', class: 'canvas__grid-line' }));
  defs.append(grid);
  return defs;
}

function buildNode(entry) {
  const layout = shapeLayout(entry.shape);
  const g = svgEl('g', {
    class: `node node--${entry.category}`,
    role: 'button',
    tabindex: '0',
    'aria-describedby': 'canvas-help',
  });
  const d = shapePath(entry.shape);
  g.append(svgEl('path', { class: 'node__shape', d }), svgEl('path', { class: 'node__tint', d }));
  const icon = svgEl('svg', {
    class: 'node__icon',
    x: layout.iconX,
    y: NODE_H / 2 - 12,
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  });
  icon.innerHTML = entry.icon;
  g.append(icon, svgEl('text', { class: 'node__text', x: layout.textX }), svgEl('title'));
  return g;
}

function setNodeText(g, node, entry) {
  if (g.dataset.label === node.label) {
    return;
  }
  g.dataset.label = node.label;
  const text = g.querySelector('.node__text');
  text.replaceChildren();
  const lines = wrapLabel(node.label, shapeLayout(entry.shape).chars);
  const top = NODE_H / 2 - ((lines.length - 1) * LINE_H) / 2;
  lines.forEach((line, i) => {
    const tspan = svgEl('tspan', { x: text.getAttribute('x'), y: top + i * LINE_H });
    tspan.textContent = line;
    text.append(tspan);
  });
  g.querySelector('title').textContent = node.label;
}

function syncKeyed(layer, map, items, create) {
  const ids = new Set(items.map((item) => item.id));
  map.forEach((el, id) => {
    if (!ids.has(id)) {
      el.remove();
      map.delete(id);
    }
  });
  items.forEach((item) => {
    if (!map.has(item.id)) {
      const el = create(item);
      map.set(item.id, el);
      layer.append(el);
    }
  });
}

export function mountCanvas(container, store) {
  const svg = svgEl('svg', { class: 'canvas', role: 'group', tabindex: '-1' });
  svg.setAttribute('aria-label', 'Lienzo del asistente: pasos y conexiones');
  const help = svgEl('desc', { id: 'canvas-help' });
  help.textContent =
    'Enter selecciona. Flechas mueven el paso, con Mayús se mueve más. C inicia una conexión. Supr elimina.';
  const bg = svgEl('rect', {
    class: 'canvas__bg',
    width: '100%',
    height: '100%',
    fill: 'url(#grid)',
  });
  const edgeLayer = svgEl('g', { class: 'canvas__edges' });
  const nodeLayer = svgEl('g', { class: 'canvas__nodes' });
  svg.append(markers(), help, bg, edgeLayer, nodeLayer);
  container.replaceChildren(svg);

  const nodeEls = new Map();
  const edgeEls = new Map();

  function render(state) {
    const { graph, ui } = state;
    syncKeyed(nodeLayer, nodeEls, graph.nodes, (node) => buildNode(getCatalogEntry(node.step)));
    syncKeyed(edgeLayer, edgeEls, graph.edges, createEdgeEl);
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    let maxX = 0;
    let maxY = 0;
    graph.nodes.forEach((node) => {
      const entry = getCatalogEntry(node.step);
      const g = nodeEls.get(node.id);
      g.dataset.id = node.id;
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.setAttribute('aria-label', `${node.label}. ${entry.label}.`);
      g.setAttribute('aria-pressed', String(ui.selectedId === node.id));
      g.classList.toggle('node--selected', ui.selectedId === node.id);
      g.classList.toggle('node--connect-source', ui.connectFrom === node.id);
      g.classList.toggle(
        'node--connect-target',
        Boolean(ui.connectFrom) && ui.connectFrom !== node.id,
      );
      setNodeText(g, node, entry);
      maxX = Math.max(maxX, node.x + NODE_W);
      maxY = Math.max(maxY, node.y + NODE_H);
    });
    graph.edges.forEach((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (from && to) {
        updateEdgeEl(edgeEls.get(edge.id), edge, from, to, ui.selectedId === edge.id);
      }
    });
    const width = Math.max(MIN_W, maxX + PAD);
    const height = Math.max(MIN_H, maxY + PAD);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  render(store.getState());
  store.subscribe((state) => state, render);
  return svg;
}
