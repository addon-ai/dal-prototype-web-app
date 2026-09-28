// Borrador del usuario en localStorage. Toda operacion es segura si el almacenamiento falla.
const DRAFT_KEY = 'dal-proto-draft-v1';

export function getDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function setDraft(graph) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(graph));
    return true;
  } catch (error) {
    return false;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch (error) {
    return false;
  }
}
