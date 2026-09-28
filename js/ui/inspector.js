// Panel de ajustes: 2 a 4 ajustes de negocio por paso, o la condicion de una conexion.
// Solo se vuelve a dibujar al cambiar la seleccion, asi no se pierde el foco al escribir.
import { getCatalogEntry } from '../data/catalog.js';

let uid = 0;

function make(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (textContent !== undefined) {
    el.textContent = textContent;
  }
  return el;
}

function field(labelText, control) {
  uid += 1;
  control.id = `insp-${uid}`;
  const wrapper = make('div', 'field');
  const label = make('label', 'field__label', labelText);
  label.htmlFor = control.id;
  wrapper.append(label, control);
  return wrapper;
}

function button(label, className, onClick) {
  const b = make('button', `btn ${className}`.trim(), label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

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
  const go = button('Conectar', '', () =>
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
    make('h2', 'panel__title', 'Ajustes del paso'),
    make('p', 'inspector__type', entry.label),
  );
  entry.settings.forEach((setting) => root.append(settingControl(setting, node, store)));
  root.append(connectBlock(node, store));
  const actions = make('div', 'inspector__actions');
  actions.append(
    button('Eliminar paso', 'btn--danger', () => store.dispatch({ type: 'REMOVE', id: node.id })),
  );
  root.append(actions);
}

function renderEdge(root, edge, graph, store) {
  const name = (id) => graph.nodes.find((n) => n.id === id)?.label ?? '';
  root.append(
    make('h2', 'panel__title', 'Ajustes de la conexión'),
    make('p', 'inspector__type', `«${name(edge.from)}» luego «${name(edge.to)}»`),
  );
  const input = make('input');
  input.type = 'text';
  input.placeholder = 'si es reclamo';
  input.value = edge.condition ?? '';
  input.addEventListener('input', () =>
    store.dispatch({ type: 'SET_CONDITION', id: edge.id, condition: input.value }),
  );
  root.append(field('Condición (si …, entonces …)', input));
  root.append(make('p', 'field__scale', 'Déjala vacía para que siempre siga este camino.'));
  const actions = make('div', 'inspector__actions');
  actions.append(
    button('Eliminar conexión', 'btn--danger', () =>
      store.dispatch({ type: 'REMOVE', id: edge.id }),
    ),
  );
  root.append(actions);
}

function selectionKey(state) {
  const { selectedId } = state.ui;
  const node = state.graph.nodes.find((n) => n.id === selectedId);
  const edge = state.graph.edges.find((e) => e.id === selectedId);
  return `${selectedId}|${node ? node.step : ''}|${edge ? 'edge' : ''}|${state.graph.nodes.length}`;
}

export function mountInspector(root, store) {
  function render(state) {
    root.replaceChildren();
    const { selectedId } = state.ui;
    const node = state.graph.nodes.find((n) => n.id === selectedId);
    const edge = state.graph.edges.find((e) => e.id === selectedId);
    if (node) {
      renderNode(root, node, store);
    } else if (edge) {
      renderEdge(root, edge, state.graph, store);
    } else {
      root.append(
        make('h2', 'panel__title', 'Ajustes'),
        make('p', '', 'Selecciona un paso o una conexión para ajustarlo.'),
      );
    }
  }
  render(store.getState());
  store.subscribe(selectionKey, (_key, state) => render(state));
}
