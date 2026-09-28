// Dialogo modal accesible: foco atrapado, Escape y clic en el fondo cierran, foco devuelto al
// disparador. Cerrado esta `hidden` e `inert`, asi nunca deja una capa que capture eventos.
import { h } from './dom.js';

const FOCUSABLE =
  'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex="0"]';

export function createDialog({ id, title, role = 'dialog', describedBy }) {
  const root = h('div', 'modal');
  root.hidden = true;
  root.inert = true;
  const box = h('div', 'modal__box');
  box.setAttribute('role', role);
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', `${id}-title`);
  if (describedBy) {
    box.setAttribute('aria-describedby', describedBy);
  }
  box.tabIndex = -1;
  const heading = h('h2', 'modal__title', title);
  heading.id = `${id}-title`;
  const body = h('div', 'modal__body');
  const footer = h('div', 'modal__footer');
  box.append(heading, body, footer);
  root.append(box);
  document.body.append(root);

  let returnTo = null;
  let fallback = null;
  const shell = () => document.getElementById('app-shell');

  function close(restoreFocus = true) {
    if (root.hidden) {
      return;
    }
    root.hidden = true;
    root.inert = true;
    shell().inert = false;
    const target = returnTo?.isConnected ? returnTo : fallback?.();
    if (restoreFocus && target) {
      target.focus({ preventScroll: true });
    }
  }

  function open(trigger, initialFocus, fallbackFocus) {
    returnTo = trigger;
    fallback = fallbackFocus ?? null;
    shell().inert = true;
    root.hidden = false;
    root.inert = false;
    (initialFocus ?? box).focus({ preventScroll: true });
  }

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      const items = Array.from(box.querySelectorAll(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === box)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  root.addEventListener('click', (event) => {
    if (event.target === root) {
      close();
    }
  });
  return { root, box, body, footer, open, close, isOpen: () => !root.hidden };
}

export function dialogButton(text, className, onClick) {
  const button = h('button', className, text);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}
