// Colapsar/expandir el panel de ajustes (derecha), igual que la paleta de pasos (izquierda).
// Estado en view.dataset.inspector; la preferencia se recuerda en localStorage (opcional).
const STORAGE_KEY = 'dal-proto-inspector';
const COLLAPSED = 'collapsed';
const EXPANDED = 'expanded';

function readSaved() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function save(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    // Sin persistencia: el estado aplica solo a esta sesion.
  }
}

export function mountInspectorToggle({ view, inspector, toggle, store }) {
  function apply(collapsed) {
    view.dataset.inspector = collapsed ? COLLAPSED : EXPANDED;
    const label = collapsed ? 'Expandir los ajustes del paso' : 'Contraer los ajustes del paso';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }

  function userSet(collapsed) {
    apply(collapsed);
    save(collapsed ? COLLAPSED : EXPANDED);
    store.dispatch({
      type: 'SET_NOTICE',
      text: collapsed ? 'Ajustes del paso contraídos.' : 'Ajustes del paso expandidos.',
    });
  }

  apply(readSaved() === COLLAPSED);
  toggle.addEventListener('click', () => userSet(view.dataset.inspector !== COLLAPSED));

  // Escape dentro del panel lo contrae y devuelve el foco al boton.
  inspector.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && view.dataset.inspector !== COLLAPSED) {
      event.preventDefault();
      userSet(true);
      toggle.focus();
    }
  });

  // Al seleccionar un paso o conexion con el panel contraido, se abre solo.
  store.subscribe(
    (state) => state.ui.selectedId,
    (id) => {
      if (id && view.dataset.inspector === COLLAPSED) {
        apply(false);
      }
    },
  );
}
