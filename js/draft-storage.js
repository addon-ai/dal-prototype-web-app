// Borrador del usuario en localStorage, uno por agente. Toda operacion es segura si el
// almacenamiento falla. Solo se guarda el grafo (nunca credenciales ni datos de la cuenta).
const DRAFT_PREFIX = 'dal-proto-draft-v2:';

export function getDraft(agentId) {
  try {
    const raw = window.localStorage.getItem(DRAFT_PREFIX + agentId);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function setDraft(agentId, graph) {
  try {
    window.localStorage.setItem(DRAFT_PREFIX + agentId, JSON.stringify(graph));
    return true;
  } catch (error) {
    return false;
  }
}

export function clearDraft(agentId) {
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + agentId);
    return true;
  } catch (error) {
    return false;
  }
}
