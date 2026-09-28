// Estado vacio de Resultados: un agente sin pasos no tiene estadisticas ni costos reales.
import { h } from './dom.js';

export function isBlank(state) {
  return state.graph.nodes.length === 0;
}

export function emptyResults(store) {
  const box = h('div', 'panel results-empty');
  box.setAttribute('role', 'status');
  const go = h('button', 'btn btn--primary', 'Ir al constructor');
  go.type = 'button';
  go.addEventListener('click', () => store.dispatch({ type: 'SET_VIEW', view: 'constructor' }));
  box.append(
    h('h3', 'panel__title', 'Aún no hay pasos'),
    h('p', 'muted', 'Aún no hay pasos: agrega pasos en el constructor para ver estadísticas y costos.'),
    go,
  );
  return box;
}
