// Pantalla de inicio de sesion de DEMOSTRACION. No valida, no envia, no guarda ni registra
// ninguna credencial: cualquier entrada (incluso vacia) lleva siempre al constructor.
const LEAVE_MS = 400;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountLogin({ login, shell, form, logoutButton, store }) {
  let leaveTimer = null;

  function announce(text) {
    store.dispatch({ type: 'SET_NOTICE', text });
  }

  function finishLeave() {
    clearTimeout(leaveTimer);
    login.hidden = true;
    login.classList.remove('login--leaving');
  }

  function enter() {
    // Los campos se vacian: nada de lo escrito queda en el DOM ni en ningun almacenamiento.
    form.reset();
    shell.inert = false;
    store.dispatch({ type: 'SIM_STOP', silent: true });
    store.dispatch({ type: 'SET_VIEW', view: 'constructor' });
    document.getElementById('constructor-title').focus({ preventScroll: true });
    announce('Sesión de demostración iniciada. Estás en el Constructor.');
    if (prefersReducedMotion()) {
      finishLeave();
      return;
    }
    login.classList.add('login--leaving');
    leaveTimer = setTimeout(finishLeave, LEAVE_MS + 100);
  }

  function signOut() {
    clearTimeout(leaveTimer);
    shell.inert = true;
    login.hidden = false;
    login.classList.remove('login--leaving');
    form.reset();
    document.getElementById('login-title').focus({ preventScroll: true });
    announce('Sesión cerrada. Vuelves a la pantalla de inicio de sesión.');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    enter();
  });
  document.getElementById('login-forgot').addEventListener('click', (event) => {
    // Enlace decorativo: no navega ni hace nada.
    event.preventDefault();
  });
  logoutButton.addEventListener('click', signOut);
}
