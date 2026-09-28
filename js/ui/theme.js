// Conmutador de tema claro/oscuro. Primera visita: prefers-color-scheme; luego la preferencia
// guardada en localStorage (opcional: sin el, la app funciona y sigue al sistema).
const STORAGE_KEY = 'dal-proto-theme';
const DARK = 'dark';
const LIGHT = 'light';
const scheme = window.matchMedia('(prefers-color-scheme: dark)');

function readSavedTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === DARK || saved === LIGHT ? saved : null;
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

function syncMeta() {
  const meta = document.querySelector('meta[name="theme-color"]');
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-card');
  if (meta && surface.trim()) {
    meta.setAttribute('content', surface.trim());
  }
}

function syncButtons(buttons) {
  const label = getTheme() === DARK ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  buttons.forEach((button) => {
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === DARK ? DARK : LIGHT);
  syncMeta();
}

export function initTheme(buttons) {
  const list = Array.from(buttons);
  applyTheme(readSavedTheme() || (scheme.matches ? DARK : LIGHT));
  syncButtons(list);
  list.forEach((button) => {
    button.addEventListener('click', () => {
      const next = getTheme() === DARK ? LIGHT : DARK;
      applyTheme(next);
      saveTheme(next);
      syncButtons(list);
    });
  });
  // Sin preferencia guardada, el tema sigue al sistema en vivo.
  scheme.addEventListener('change', () => {
    if (!readSavedTheme()) {
      applyTheme(scheme.matches ? DARK : LIGHT);
      syncButtons(list);
    }
  });
}

// Los modulos se ejecutan diferidos: el DOM ya esta listo.
initTheme(document.querySelectorAll('[data-theme-toggle]'));
