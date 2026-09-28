// Composition root: ensambla store, lienzo, paneles, vistas, borrador y tema.
import './ui/theme.js';
import { createStore } from './store.js';
import { reducer, createInitialState } from './reducer.js';
import { CATALOG } from './data/catalog.js';
import { PRICING } from './pricing.config.js';
import { computeMetrics } from './domain/metrics.js';
import { computeInvoice } from './domain/costs.js';
import { getDraft, setDraft, clearDraft } from './draft-storage.js';
import { mountCanvas } from './canvas/render.js';
import { attachNodeDrag } from './canvas/drag.js';
import { attachKeyboard } from './canvas/keyboard.js';
import { mountPalette } from './ui/palette.js';
import { mountInspector } from './ui/inspector.js';
import { mountLive } from './ui/live.js';
import { mountRecipe } from './ui/recipe.js';
import { mountStats } from './ui/stats.js';
import { mountCosts } from './ui/costs.js';
import { mountNarrative } from './ui/narrative.js';

const DRAFT_DELAY_MS = 500;
const VIEWS = ['constructor', 'resultados', 'narrativa'];

function isValidDraft(graph) {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return false;
  }
  const ids = new Set(graph.nodes.map((node) => node.id));
  return (
    graph.nodes.every(
      (node) => CATALOG.some((entry) => entry.step === node.step) && node.settings,
    ) && graph.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to))
  );
}

function loadInitialState() {
  const draft = getDraft();
  return isValidDraft(draft) ? createInitialState(draft) : createInitialState();
}

const store = createStore(reducer, loadInitialState());

// Calculo compartido por Estadisticas y Costos: se recalcula solo si cambia el grafo o el volumen.
let cache = { graph: null, scenario: null, model: null };
function getModel(state) {
  if (cache.graph !== state.graph || cache.scenario !== state.scenario) {
    const metrics = computeMetrics(state.graph, state.scenario, CATALOG);
    cache = {
      graph: state.graph,
      scenario: state.scenario,
      model: { metrics, invoice: computeInvoice(metrics, PRICING) },
    };
  }
  return cache.model;
}

const wrap = document.getElementById('canvas-wrap');
const svg = mountCanvas(wrap, store);
attachNodeDrag(svg, store);
attachKeyboard(svg, store);
mountPalette({
  palette: document.getElementById('palette'),
  toggle: document.getElementById('palette-toggle'),
  list: document.getElementById('palette-list'),
  wrap,
  svg,
  store,
});
mountInspector(document.getElementById('inspector'), store);
mountLive(document.getElementById('live'), store);
mountRecipe(document.getElementById('recipe'), document.getElementById('recipe-body'), store);
mountStats(document.getElementById('stats'), store, getModel);
mountCosts(document.getElementById('costs'), store, getModel);
mountNarrative(document.getElementById('narrative'), store);

// Vistas: una visible a la vez; al navegar el foco pasa al encabezado principal.
const navButtons = Array.from(document.querySelectorAll('[data-view]'));
function showView(view, moveFocus) {
  VIEWS.forEach((name) => {
    document.getElementById(`view-${name}`).hidden = name !== view;
  });
  navButtons.forEach((button) => {
    if (button.dataset.view === view) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });
  if (moveFocus) {
    window.scrollTo(0, 0);
    document.querySelector(`#view-${view} h1`).focus();
  }
}
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    store.dispatch({ type: 'SET_VIEW', view: button.dataset.view });
  });
});
store.subscribe(
  (state) => state.ui.view,
  (view) => showView(view, true),
);
showView(store.getState().ui.view, false);

document.getElementById('restore-template').addEventListener('click', () => {
  clearDraft();
  store.dispatch({ type: 'LOAD_TEMPLATE' });
});

// Borrador: se guarda 500 ms despues del ultimo cambio; si no hay localStorage, se ignora.
let draftTimer = null;
store.subscribe(
  (state) => state.graph,
  (graph) => {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => setDraft(graph), DRAFT_DELAY_MS);
  },
);
