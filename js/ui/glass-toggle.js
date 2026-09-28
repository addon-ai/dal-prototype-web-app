// Interruptor "Efecto cristal": aplica data-glass="on|off" en <html>. Activado por defecto.
// La preferencia se guarda en localStorage (opcional; si no esta disponible, solo dura la sesion).
const STORAGE_KEY = 'dal-proto-glass';
const ON = 'on';
const OFF = 'off';

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
    // Sin persistencia: la preferencia aplica solo a esta sesion.
  }
}

export function getGlass() {
  return document.documentElement.getAttribute('data-glass') === OFF ? OFF : ON;
}

export function applyGlass(value) {
  document.documentElement.setAttribute('data-glass', value === OFF ? OFF : ON);
}

export function initGlassToggle(button) {
  if (!button) {
    return;
  }
  applyGlass(readSaved() === OFF ? OFF : ON);
  const sync = () => button.setAttribute('aria-pressed', String(getGlass() === ON));
  sync();
  button.addEventListener('click', () => {
    const next = getGlass() === ON ? OFF : ON;
    applyGlass(next);
    save(next);
    sync();
  });
}
