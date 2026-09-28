// Composition root: ensambla store, lienzo, paneles, vistas, borrador y tema.
import './ui/theme.js';
import { mountDotField } from './ui/dot-field.js';
import { initGlassToggle } from './ui/glass-toggle.js';
import { mountLogin } from './ui/login.js';
import { createStore } from './store.js';
import { reducer, createInitialState } from './reducer.js';
import { EMPTY_GRAPH } from './reducer-agents.js';
import { createNewAgentStarter } from './new-agent.js';
import { cloneTemplateGraph } from './data/template-logistica.js';
import { CATALOG } from './data/catalog.js';
import { PRICING } from './pricing.config.js';
import { computeMetrics } from './domain/metrics.js';
import { computeInvoice } from './domain/costs.js';
import { cloneAgentGraph } from './data/agents/index.js';
import { setDraft, clearDraft } from './draft-storage.js';
import { mountCanvas } from './canvas/render.js';
import { attachNodeDrag } from './canvas/node-drag.js';
import { attachPanZoom } from './canvas/pan-zoom.js';
import { attachConnectDrag } from './canvas/connect-drag.js';
import { attachKeyboard } from './canvas/keyboard.js';
import { mountControls } from './canvas/controls.js';
import { mountMinimap } from './canvas/minimap.js';
import { mountSimulation } from './canvas/simulate.js';
import { fitToScreen, mountAutoFit } from './canvas/view-actions.js';
import { mountPalette } from './ui/palette.js';
import { mountInspector } from './ui/inspector.js';
import { mountInspectorToggle } from './ui/inspector-toggle.js';
import { mountLive } from './ui/live.js';
import { mountRecipe } from './ui/recipe.js';
import { mountStats } from './ui/stats.js';
import { mountCosts } from './ui/costs.js';
import { mountAgents } from './ui/agents.js';
import { mountAccount } from './ui/account.js';
import { mountBuilderHead } from './ui/builder-head.js';
import { mountViews } from './views.js';
import { mountHashSync, goTo, parseHash, clearHash } from './navigation.js';

const DRAFT_DELAY_MS = 500;

// Sin agente abierto el grafo esta vacio; al abrir uno se carga su grafo (o su borrador).
const store = createStore(reducer, createInitialState(EMPTY_GRAPH));

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
attachPanZoom(svg, store);
attachNodeDrag(svg, store);
attachConnectDrag(svg, store);
attachKeyboard(svg, store);
mountMinimap(wrap, svg, store);
mountControls(wrap, svg, store, restoreTemplate, loadFollowUpTemplate);
mountSimulation(document.getElementById('stage-actions'), svg, store);
mountPalette({
  palette: document.getElementById('palette'),
  toggle: document.getElementById('palette-toggle'),
  panel: document.getElementById('palette-panel'),
  wrap,
  svg,
  store,
});

// Encuadre inicial y reencuadre mientras el usuario no toque la vista.
mountAutoFit(wrap, svg, store);

// "Restaurar plantilla" devuelve el grafo original del agente abierto.
function restoreTemplate() {
  const { agentId } = store.getState().ui;
  clearDraft(agentId);
  store.dispatch({ type: 'LOAD_TEMPLATE', graph: cloneAgentGraph(agentId) });
  fitToScreen(store, svg);
}

// Desde el lienzo vacio: parte de la plantilla de seguimiento conservando id y nombre del agente.
function loadFollowUpTemplate() {
  const { id, name } = store.getState().graph;
  store.dispatch({ type: 'LOAD_TEMPLATE', graph: { ...cloneTemplateGraph(), id, name } });
  fitToScreen(store, svg);
}
mountInspector(document.getElementById('inspector-panel'), store);
mountInspectorToggle({
  view: document.getElementById('view-constructor'),
  inspector: document.getElementById('inspector'),
  toggle: document.getElementById('inspector-toggle'),
  store,
});
mountLive(document.getElementById('live'), store);
mountRecipe(document.getElementById('recipe'), document.getElementById('recipe-body'), store);
mountStats(document.getElementById('stats'), store, getModel);
mountCosts(document.getElementById('costs'), store, getModel);

// Vistas, navegacion por hash, coleccion de agentes y cabecera del constructor.
const session = { active: false };
const startNewAgent = createNewAgentStarter(store, () => views.focusHeading());
const views = mountViews(store, () => startNewAgent(false));
const syncHash = mountHashSync(store, () => session.active);
mountBuilderHead(store, document.getElementById('view-constructor'));
mountAgents(
  document.getElementById('view-agentes'),
  store,
  (id) => goTo(store, { view: 'constructor', id }),
  startNewAgent,
);
mountAccount();
mountDotField();

// Borrador por agente: se guarda 500 ms despues del ultimo cambio; sin localStorage, se ignora.
let draftTimer = null;
let draftAgent = null;
store.subscribe(
  (state) => state.graph,
  (graph, state) => {
    clearTimeout(draftTimer);
    if (state.ui.agentId !== draftAgent) {
      draftAgent = state.ui.agentId; // grafo recien cargado: no es una edicion del usuario
      return;
    }
    const { agentId } = state.ui;
    draftTimer = setTimeout(() => setDraft(agentId, graph), DRAFT_DELAY_MS);
  },
);

// Efecto cristal y sesion de demostracion (el login se muestra en cada carga).
initGlassToggle(document.getElementById('glass-toggle'));
const requested = parseHash(window.location.hash);
mountLogin({
  login: document.getElementById('login'),
  shell: document.getElementById('app-shell'),
  form: document.getElementById('login-form'),
  logoutButton: document.getElementById('logout'),
  store,
  onEnter: () => {
    session.active = true;
    goTo(store, requested);
    syncHash();
    views.focusHeading();
  },
  onLeave: () => {
    session.active = false;
    requested.view = 'agentes';
    requested.id = '';
    clearHash();
    store.dispatch({ type: 'SET_VIEW', view: 'agentes' });
  },
});
