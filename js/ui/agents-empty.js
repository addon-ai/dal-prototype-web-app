// Estados vacios de la coleccion de agentes: sin resultados para los filtros, o sin agentes.
import { h } from './dom.js';

function action(text, className, onClick) {
  const button = h('button', className, text);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

export function emptyState(kind, { onClear, onRestore, onCreate }) {
  const card = h('li', 'agents__empty panel');
  const actions = h('div', 'agents__empty-actions');
  if (kind === 'filters') {
    card.append(h('h2', 'agents__empty-title', 'Ningún agente coincide'));
    card.append(h('p', 'muted', 'Prueba con otro estado o alcance, o cambia la búsqueda.'));
    actions.append(action('Limpiar filtros', 'btn btn--primary', onClear));
  } else {
    card.append(h('h2', 'agents__empty-title', 'No quedan agentes'));
    card.append(h('p', 'muted', 'Puedes volver a los agentes de ejemplo o crear uno nuevo desde cero.'));
    actions.append(
      action('Restaurar agentes de ejemplo', 'btn', onRestore),
      action('Crear agente', 'btn btn--primary', onCreate),
    );
  }
  card.append(actions);
  return card;
}
