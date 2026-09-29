// Pantalla de inicio de sesion de DEMOSTRACION. No valida, no envia, no guarda ni registra
// ninguna credencial: cualquier entrada (incluso vacia) lleva siempre a la coleccion de agentes.
const LEAVE_MS = 400;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountLogin({ login, shell, form, logoutButton, store, onEnter, onLeave }) {
  let leaveTimer = null;

  function announce(text) {
    store.dispatch({ type: 'SET_NOTICE', text });
  }

  function finishLeave() {
    clearTimeout(leaveTimer);
    login.hidden = true;
    login.inert = true; // oculto: nada del acceso puede recibir eventos
    login.classList.remove('login--leaving');
  }

  function enter(instant = false) {
    // Los campos se vacian: nada de lo escrito queda en el DOM ni en ningun almacenamiento.
    form.reset();
    shell.inert = false;
    store.dispatch({ type: 'SIM_STOP', silent: true });
    onEnter();
    if (!instant) {
      announce('Sesión de demostración iniciada. Estás en Agentes.');
    }
    if (instant || prefersReducedMotion()) {
      finishLeave();
      return;
    }
    login.classList.add('login--leaving');
    leaveTimer = setTimeout(finishLeave, LEAVE_MS + 100);
  }

  function signOut() {
    clearTimeout(leaveTimer);
    shell.inert = true;
    onLeave();
    login.inert = false;
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
  return { enter };
}
