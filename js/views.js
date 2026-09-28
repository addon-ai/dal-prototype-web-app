// Vistas de la app: una visible a la vez; al navegar el foco pasa al encabezado principal.
import { VIEWS, guardView } from './navigation.js';

export function mountViews(store, onNewAgent) {
  const navButtons = Array.from(document.querySelectorAll('.main-nav [data-view]'));

  function focusHeading() {
    const { view } = store.getState().ui;
    document.getElementById('main').scrollTo(0, 0);
    document.querySelector(`#view-${view} h1`).focus({ preventScroll: true });
  }

  function showView(view) {
    document.body.dataset.view = view;
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
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.dataset.view === 'constructor') {
        // "Constructor" siempre inicia un agente nuevo; un doble clic no crea dos.
        if (event.detail < 2) {
          onNewAgent();
        }
        return;
      }
      if (guardView(store, button.dataset.view)) {
        store.dispatch({ type: 'SET_VIEW', view: button.dataset.view });
      }
    });
  });
  store.subscribe(
    (state) => state.ui.view,
    (view) => {
      if (guardView(store, view)) {
        showView(view);
        focusHeading();
      }
    },
  );
  showView(store.getState().ui.view);
  return { focusHeading };
}
