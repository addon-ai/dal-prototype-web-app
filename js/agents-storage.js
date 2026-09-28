// Fichas de agentes del usuario en localStorage (clave versionada). Toda operacion es segura si el
// almacenamiento falla. Solo guarda datos del agente (nunca credenciales ni datos de la cuenta).
// Forma: { seq, created: [ficha], overrides: { [idMock]: { name, avatarId } } }
const KEY = 'dal-proto-agents-v1';

const EMPTY = () => ({ seq: 0, created: [], overrides: {} });
const isText = (value) => typeof value === 'string' && value.length > 0 && value.length <= 200;

function validCard(card) {
  return Boolean(card) && isText(card.id) && isText(card.name) && typeof card.fromTemplate === 'boolean';
}

export function loadAgentsState() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY));
    if (!raw || !Array.isArray(raw.created)) {
      return EMPTY();
    }
    const overrides = raw.overrides && typeof raw.overrides === 'object' ? raw.overrides : {};
    const seq = Number.isInteger(raw.seq) && raw.seq >= 0 ? raw.seq : 0;
    return { seq, created: raw.created.filter(validCard), overrides };
  } catch (error) {
    return EMPTY();
  }
}

export function saveAgentsState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    return false;
  }
}
