// Conmutador de tema claro/oscuro. Persiste la eleccion en localStorage (opcional).
const STORAGE_KEY = 'dal-proto-theme';
const DARK = 'dark';
const LIGHT = 'light';

function readSavedTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // Sin persistencia: el tema aplica solo a esta sesion.
  }
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === DARK ? DARK : LIGHT;
}

export function applyTheme(theme) {
  if (theme === DARK) {
    document.documentElement.setAttribute('data-theme', DARK);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function syncButton(button) {
  const isDark = getTheme() === DARK;
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

export function initTheme(button) {
  if (!button) {
    return;
  }
  if (readSavedTheme() === DARK) {
    applyTheme(DARK);
  }
  syncButton(button);
  button.addEventListener('click', () => {
    const next = getTheme() === DARK ? LIGHT : DARK;
    applyTheme(next);
    saveTheme(next);
    syncButton(button);
  });
}

// Los modulos se ejecutan diferidos: el DOM ya esta listo.
initTheme(document.getElementById('theme-toggle'));
