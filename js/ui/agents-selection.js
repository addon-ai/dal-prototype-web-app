// Seleccion multiple de agentes: casillas por tarjeta y una sola barra con "Seleccionar todos"
// (los VISIBLES segun filtros), contador aria-live, "Limpiar seleccion" y un unico "Eliminar".
// Decision: al cambiar filtros la seleccion conserva solo los agentes que siguen visibles, asi
// nunca se elimina algo que el usuario no ve. Se reinicia al salir de la vista.
import { h, icon } from './dom.js';

const TRASH = 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6';

export function createSelection({ root, onDelete }) {
  const ids = new Set();
  let visible = [];
  let anchor = null;

  const bar = h('div', 'agents__select');
  const allLabel = h('label', 'check agents__select-all');
  const all = document.createElement('input');
  all.type = 'checkbox';
  all.className = 'check__input';
  const allText = h('span', '', 'Seleccionar todos');
  allLabel.append(all, allText);
  const count = h('span', 'agents__count');
  count.setAttribute('role', 'status');
  const clear = h('button', 'btn btn--ghost', 'Limpiar selección');
  clear.type = 'button';
  const del = h('button', 'btn btn--danger agents__delete');
  del.type = 'button';
  del.append(icon(TRASH), h('span', '', 'Eliminar'));
  bar.append(allLabel, count, clear, del);

  const boxes = () => Array.from(root.querySelectorAll('.agent-card__check .check__input'));

  function sync() {
    const n = ids.size;
    boxes().forEach((box) => {
      const on = ids.has(box.dataset.id);
      box.checked = on;
      box.closest('.agent-card').dataset.selected = String(on);
    });
    all.disabled = visible.length === 0;
    all.checked = n > 0 && n === visible.length;
    all.indeterminate = n > 0 && n < visible.length;
    allText.textContent = visible.length ? `Seleccionar todos (${visible.length})` : 'Seleccionar todos';
    count.textContent = `${n} ${n === 1 ? 'seleccionado' : 'seleccionados'}`;
    clear.hidden = n === 0;
    del.disabled = n === 0;
  }

  // Tras repintar la cuadricula: descarta lo que dejo de verse y refleja el estado en las casillas.
  function setVisible(list) {
    visible = list;
    ids.forEach((id) => !list.includes(id) && ids.delete(id));
    sync();
  }

  function clearAll() {
    ids.clear();
    anchor = null;
    sync();
  }

  root.addEventListener('click', (event) => {
    const box = event.target.closest?.('.agent-card__check .check__input');
    if (!box) {
      return;
    }
    const id = box.dataset.id;
    const from = event.shiftKey ? visible.indexOf(anchor) : -1;
    const to = visible.indexOf(id);
    const targets = from >= 0 ? visible.slice(Math.min(from, to), Math.max(from, to) + 1) : [id];
    targets.forEach((id) => (box.checked ? ids.add(id) : ids.delete(id)));
    anchor = id;
    sync();
  });
  all.addEventListener('change', () => {
    visible.forEach((id) => (all.checked ? ids.add(id) : ids.delete(id)));
    sync();
  });
  clear.addEventListener('click', () => {
    clearAll();
    all.focus();
  });
  del.addEventListener('click', () => onDelete([...ids], del));
  // Escape vacia la seleccion (sin interferir con el "x" del buscador cuando tiene texto).
  root.addEventListener('keydown', (event) => {
    const typing = event.target.type === 'search' && event.target.value;
    if (event.key === 'Escape' && ids.size && !typing) {
      clearAll();
    }
  });

  return { bar, setVisible, clear: clearAll, focusFallback: () => all.focus() };
}

export function describeAgents(list, max = 3) {
  const names = list.slice(0, max).map((agent) => `«${agent.name}»`).join(', ');
  return list.length > max ? `${names} y ${list.length - max} más` : names;
}
