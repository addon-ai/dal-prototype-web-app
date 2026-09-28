// Panel de cuenta (popover; hoja inferior en movil). Escape, clic fuera y foco devuelto al boton.
export function mountAccount() {
  const button = document.getElementById('account-btn');
  const panel = document.getElementById('account-panel');
  const backdrop = document.getElementById('account-backdrop');
  const mobile = window.matchMedia('(max-width: 767px)');

  function close(returnFocus) {
    panel.hidden = true;
    backdrop.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) {
      button.focus();
    }
  }

  function open() {
    panel.hidden = false;
    backdrop.hidden = !mobile.matches;
    button.setAttribute('aria-expanded', 'true');
    panel.focus({ preventScroll: true });
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close(true)));
  backdrop.addEventListener('click', () => close(false));
  document.addEventListener('click', (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !button.contains(event.target)) {
      close(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (panel.hidden) {
      return;
    }
    if (event.key === 'Escape') {
      close(true);
    } else if (event.key === 'Tab' && mobile.matches) {
      const items = Array.from(panel.querySelectorAll('button:not([hidden])'));
      const edge = event.shiftKey ? items[0] : items[items.length - 1];
      if (document.activeElement === edge || document.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? items[items.length - 1] : items[0]).focus();
      }
    }
  });
  // Cerrar sesion, o navegar, cierra el panel para que nunca quede una capa abierta.
  panel.querySelector('#logout').addEventListener('click', () => close(false));
}
