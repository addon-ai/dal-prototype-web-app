// Confirmacion accesible (alertdialog) que reemplaza a confirm() nativo.
import { createDialog, dialogButton } from './dialog.js';
import { h } from './dom.js';

let dialog = null;
let message = null;
let confirmBtn = null;
let cancelBtn = null;
let action = null;

function build() {
  dialog = createDialog({ id: 'confirm', title: 'Confirmar', role: 'alertdialog', describedBy: 'confirm-message' });
  message = h('p', 'modal__text');
  message.id = 'confirm-message';
  dialog.body.append(message);
  cancelBtn = dialogButton('Cancelar', 'btn', () => dialog.close());
  confirmBtn = dialogButton('Eliminar', 'btn btn--danger', () => {
    const run = action;
    dialog.close(false);
    run?.();
  });
  dialog.footer.append(cancelBtn, confirmBtn);
}

// opciones: { trigger, title, text, confirmLabel, onConfirm, fallbackFocus }
export function askConfirm({ trigger, title, text, confirmLabel, onConfirm, fallbackFocus }) {
  if (!dialog) {
    build();
  }
  dialog.box.querySelector('.modal__title').textContent = title;
  message.textContent = text;
  confirmBtn.textContent = confirmLabel;
  action = onConfirm;
  dialog.open(trigger, cancelBtn, fallbackFocus);
}
