// Render SVG del lienzo. Los elementos se reutilizan por id (no se recrean al mover),
// asi el arrastre con Pointer Events y el foco de teclado no se pierden.
import { getCatalogEntry } from '../data/catalog.js';
import { svgEl } from './shapes.js';
import { buildDefs, syncDots } from './defs.js';
import { buildNode, setNodeText, setNodeBadge } from './node.js';
import { createEdgeEl, updateEdgeEl } from './edges.js';

const HELP =
  'Enter selecciona. Flechas mueven el paso, con Mayús se mueve más. C inicia una conexión. Supr elimina. Más y menos acercan o alejan; 0 encuadra todo.';

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

function badgeFor(node, sim, incoming, outgoing) {
  if (sim.active === node.id) {
    return ['En curso', 'active'];
  }
  if (sim.done.includes(node.id)) {
    return ['Hecho', 'done'];
  }
  if (!incoming.has(node.id)) {
    return ['Inicio', 'edge'];
  }
  return outgoing.has(node.id) ? [null, null] : ['Final', 'edge'];
}

export function mountCanvas(container, store) {
  const svg = svgEl('svg', { class: 'canvas', role: 'group', tabindex: '-1' });
  svg.setAttribute('aria-label', 'Lienzo del asistente: pasos y conexiones');
  const help = svgEl('desc', { id: 'canvas-help' });
  help.textContent = HELP;
  const bg = svgEl('rect', { class: 'canvas__bg', width: '100%', height: '100%', fill: 'url(#dots)' });
  const viewport = svgEl('g', { class: 'viewport' });
  const edgeLayer = svgEl('g', { class: 'canvas__edges' });
  const nodeLayer = svgEl('g', { class: 'canvas__nodes' });
  const tempLayer = svgEl('g', { class: 'canvas__temp' });
  viewport.append(edgeLayer, nodeLayer, tempLayer);
  svg.append(buildDefs(), help, bg, viewport);
  container.prepend(svg);

  const nodeEls = new Map();
  const edgeEls = new Map();

  function render(state) {
    const { graph, ui } = state;
    const { sim } = ui;
    syncKeyed(nodeLayer, nodeEls, graph.nodes, (node) => buildNode(getCatalogEntry(node.step)));
    syncKeyed(edgeLayer, edgeEls, graph.edges, createEdgeEl);
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const incoming = new Set(graph.edges.map((edge) => edge.to));
    const outgoing = new Set(graph.edges.map((edge) => edge.from));
    svg.classList.toggle('canvas--simulating', sim.status !== 'idle');
    graph.nodes.forEach((node) => {
      const entry = getCatalogEntry(node.step);
      const g = nodeEls.get(node.id);
      g.dataset.id = node.id;
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.setAttribute('aria-label', `${node.label}. ${entry.label}.`);
      g.setAttribute('aria-pressed', String(ui.selectedId === node.id));
      g.classList.toggle('node--selected', ui.selectedId === node.id);
      g.classList.toggle('node--connect-source', ui.connectFrom === node.id);
      g.classList.toggle('node--connect-target', Boolean(ui.connectFrom) && ui.connectFrom !== node.id);
      g.classList.toggle('node--sim-active', sim.active === node.id);
      g.classList.toggle('node--sim-done', sim.done.includes(node.id));
      setNodeText(g, node);
      const [text, kind] = badgeFor(node, sim, incoming, outgoing);
      setNodeBadge(g, text, kind);
    });
    graph.edges.forEach((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (from && to) {
        updateEdgeEl(edgeEls.get(edge.id), edge, from, to, {
          selected: ui.selectedId === edge.id,
          active: sim.activeEdges.includes(edge.id),
          done: sim.doneEdges.includes(edge.id),
        });
      }
    });
  }

  function applyViewport(vp) {
    viewport.setAttribute('transform', `translate(${vp.x} ${vp.y}) scale(${vp.k})`);
    syncDots(svg, vp);
  }

  render(store.getState());
  applyViewport(store.getState().ui.viewport);
  store.subscribe((state) => state.graph, (_v, state) => render(state));
  store.subscribe((state) => state.ui.selectedId, (_v, state) => render(state));
  store.subscribe((state) => state.ui.connectFrom, (_v, state) => render(state));
  store.subscribe((state) => state.ui.sim, (_v, state) => render(state));
  store.subscribe((state) => state.ui.viewport, applyViewport);
  return svg;
}
