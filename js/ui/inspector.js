// Panel de ajustes: 2 a 4 ajustes de negocio por paso, o la condicion de una conexion.
// Solo se vuelve a dibujar al cambiar la seleccion, asi no se pierde el foco al escribir.
import { getCatalogEntry } from '../data/catalog.js';
import { getCategory } from '../data/categories.js';
import { svgEl } from '../canvas/shapes.js';
import { make, field, iconBtn, header, ICON_LINK } from './inspector-parts.js';

function settingControl(setting, node, store) {
  const value = node.settings[setting.key];
  let control;
  if (setting.type === 'select') {
    control = make('select');
    setting.options.forEach((opt) => {
      const o = make('option', '', opt.label);
      o.value = opt.value;
      control.append(o);
    });
    control.value = value;
  } else {
    control = make('input');
    control.type = setting.type === 'range' ? 'range' : 'text';
    if (setting.type === 'range') {
      Object.assign(control, { min: setting.min, max: setting.max, step: setting.step });
    }
    control.value = value;
  }
  const send = () =>
    store.dispatch({ type: 'UPDATE_SETTING', id: node.id, key: setting.key, value: control.value });
  control.addEventListener(setting.type === 'select' ? 'change' : 'input', send);
  const wrapper = field(setting.label, control);
  if (setting.type === 'range') {
    wrapper.append(make('p', 'field__scale', `${setting.leftLabel} ↔ ${setting.rightLabel}`));
  }
  return wrapper;
}

function connectBlock(node, store) {
  const others = store.getState().graph.nodes.filter((item) => item.id !== node.id);
  const box = make('div', 'field');
  const select = make('select');
  others.forEach((item) => {
    const o = make('option', '', item.label);
    o.value = item.id;
    select.append(o);
  });
  box.append(field('Conectar con el paso', select));
  const actions = make('div', 'inspector__actions');
  const go = iconBtn(ICON_LINK, 'Conectar', '', () =>
    store.dispatch({ type: 'CONNECT', from: node.id, to: select.value }),
  );
  go.disabled = others.length === 0;
  actions.append(go);
  box.append(actions);
  return box;
}

function renderNode(root, node, store) {
  const entry = getCatalogEntry(node.step);
  root.append(
    header(store, {
      entry,
      title: node.label,
      subtitle: `${getCategory(entry.category).label} · ${entry.label}`,
      deleteLabel: 'Eliminar paso',
      onDelete: () => store.dispatch({ type: 'REMOVE', id: node.id }),
    }),
  );
  const form = make('div', 'inspector__body');
  entry.settings.forEach((setting) => form.append(settingControl(setting, node, store)));
  form.append(connectBlock(node, store));
  root.append(form);
}

function renderEdge(root, edge, graph, store) {
  const name = (id) => graph.nodes.find((n) => n.id === id)?.label ?? '';
  root.append(
    header(store, {
      entry: null,
      title: 'Conexión',
      subtitle: `«${name(edge.from)}» luego «${name(edge.to)}»`,
      deleteLabel: 'Eliminar conexión',
      onDelete: () => store.dispatch({ type: 'REMOVE', id: edge.id }),
    }),
  );
  const input = make('input');
  input.type = 'text';
  input.placeholder = 'si es reclamo';
  input.value = edge.condition ?? '';
  input.addEventListener('input', () =>
    store.dispatch({ type: 'SET_CONDITION', id: edge.id, condition: input.value }),
  );
  const form = make('div', 'inspector__body');
  form.append(
    field('Condición (si …, entonces …)', input),
    make('p', 'field__scale', 'Déjala vacía para que siempre siga este camino.'),
  );
  root.append(form);
}

function renderEmpty(root) {
  const box = make('div', 'inspector__empty');
  const art = svgEl('svg', { class: 'inspector__art', viewBox: '0 0 96 64', 'aria-hidden': 'true' });
  art.innerHTML =
    '<rect x="4" y="8" width="34" height="22" rx="6"/><rect x="58" y="34" width="34" height="22" rx="6"/><path d="M38 19h10a10 10 0 0 1 10 10v16"/>';
  box.append(
    art,
    make('h2', 'inspector__empty-title', 'Ajustes del paso'),
    make('p', '', 'Selecciona un paso o una conexión para ajustarlo.'),
  );
  const tips = make('ul', 'inspector__tips');
  ['Arrastra un paso para moverlo.', 'Arrastra desde el punto de salida para conectar.', 'Enter selecciona; C inicia una conexión.'].forEach(
    (text) => tips.append(make('li', '', text)),
  );
  box.append(tips);
  root.append(box);
}

function selectionKey(state) {
  const { selectedId } = state.ui;
  const node = state.graph.nodes.find((n) => n.id === selectedId);
  const edge = state.graph.edges.find((e) => e.id === selectedId);
  return `${selectedId}|${node ? node.step : ''}|${edge ? 'edge' : ''}|${state.graph.nodes.length}`;
}

export function mountInspector(root, store) {
  const view = root.closest('.view');
  function render(state) {
    root.replaceChildren();
    const { selectedId } = state.ui;
    const node = state.graph.nodes.find((n) => n.id === selectedId);
    const edge = state.graph.edges.find((e) => e.id === selectedId);
    view.dataset.selection = String(Boolean(node || edge));
    if (node) {
      renderNode(root, node, store);
    } else if (edge) {
      renderEdge(root, edge, state.graph, store);
    } else {
      renderEmpty(root);
    }
  }
  render(store.getState());
  store.subscribe(selectionKey, (_key, state) => render(state));
  // El titulo acompana al nombre del paso sin volver a dibujar el formulario (no pierde el foco).
  store.subscribe(
    (state) => state.graph,
    (graph, state) => {
      const node = graph.nodes.find((n) => n.id === state.ui.selectedId);
      const title = root.querySelector('.inspector__title');
      if (node && title) {
        title.textContent = node.label;
      }
    },
  );
}
