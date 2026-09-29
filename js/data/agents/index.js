// Coleccion de agentes: los 7 mock (con sus cambios de nombre/avatar) y los creados por el usuario.
// Sin red. Los creados y los cambios sobre los mock se guardan en localStorage si esta disponible.
import { cloneTemplateGraph } from '../template-logistica.js';
import { pickAvatarId, getAvatar } from '../avatars.js';
import { loadAgentsState, saveAgentsState } from '../../agents-storage.js';
import { getDraft } from '../../draft-storage.js';
import { ME } from './owner.js';
import { SEED } from './seed.js';
import { isStatus } from './status-ids.js';

export { ME };

const NAME_MAX = 60;

function baseGraph(id, name, fromTemplate) {
  return fromTemplate
    ? { ...cloneTemplateGraph(), id, name }
    : { id, name, version: '1.0.0', nodes: [], edges: [] };
}

function describe(fromTemplate) {
  return fromTemplate
    ? 'Copia de la plantilla de seguimiento de envíos para ajustar a tu caso.'
    : 'Agente en blanco: agrega pasos desde la paleta para empezar.';
}

function hydrate(card) {
  const avatarId = getAvatar(card.avatarId) ? card.avatarId : pickAvatarId(card.id);
  return {
    id: card.id,
    name: card.name.slice(0, NAME_MAX),
    description: describe(card.fromTemplate),
    status: isStatus(card.status) ? card.status : 'borrador',
    owner: ME,
    scope: 'personal',
    edited: 0,
    casos: 1000,
    auto: 0,
    avatarId,
    fromTemplate: card.fromTemplate,
    user: true,
    graph: baseGraph(card.id, card.name, card.fromTemplate),
  };
}

const stored = loadAgentsState();
let sequence = stored.seq;
const overrides = { ...stored.overrides };
const deleted = new Set(stored.deleted);
const created = stored.created.map(hydrate);

function persist() {
  saveAgentsState({
    seq: sequence,
    overrides,
    deleted: [...deleted],
    created: created.map(({ id, name, avatarId, fromTemplate, status }) => ({ id, name, avatarId, fromTemplate, status })),
  });
}

function withOverride(agent) {
  const patch = overrides[agent.id];
  if (!patch) {
    return agent;
  }
  const avatarId = getAvatar(patch.avatarId) ? patch.avatarId : agent.avatarId;
  const name = typeof patch.name === 'string' && patch.name ? patch.name.slice(0, NAME_MAX) : agent.name;
  const status = isStatus(patch.status) ? patch.status : agent.status;
  return { ...agent, name, avatarId, status };
}

function allAgents() {
  return [...created, ...SEED.filter((agent) => !deleted.has(agent.id)).map(withOverride)];
}

// Un agente propio en blanco solo aparece en la coleccion cuando ya tiene pasos guardados como borrador.
function hasData(agent) {
  return !agent.user || agent.fromTemplate || (getDraft(agent.id)?.nodes?.length ?? 0) > 0;
}

export function listAgents() {
  return allAgents().filter(hasData);
}

// Abrir un agente por id sigue funcionando aunque aun este en blanco (recien creado).
export function getAgent(id) {
  return allAgents().find((agent) => agent.id === id) ?? null;
}

// Copia editable del grafo original del agente ("Restaurar plantilla").
export function cloneAgentGraph(id) {
  const agent = getAgent(id);
  return agent ? { ...structuredClone(agent.graph), name: agent.name } : null;
}

// Agente nuevo: en blanco o con la plantilla de seguimiento. Nombre, id y avatar son deterministas.
export function createAgent(fromTemplate) {
  sequence += 1;
  const id = `nuevo-${sequence}`;
  const agent = hydrate({ id, name: `Agente nuevo ${sequence}`, fromTemplate: Boolean(fromTemplate) });
  created.unshift(agent);
  persist();
  return agent;
}

// Cambia nombre, avatar y/o estado (mock: queda como ajuste local; creados: se edita la ficha).
export function updateAgent(id, { name, avatarId, status }) {
  const own = created.find((agent) => agent.id === id);
  const clean = (name ?? '').trim().slice(0, NAME_MAX);
  if (own) {
    own.name = clean || own.name;
    own.avatarId = getAvatar(avatarId) ? avatarId : own.avatarId;
    own.status = isStatus(status) ? status : own.status;
  } else if (SEED.some((agent) => agent.id === id)) {
    overrides[id] = {
      ...overrides[id],
      ...(clean ? { name: clean } : {}),
      ...(getAvatar(avatarId) ? { avatarId } : {}),
      ...(isStatus(status) ? { status } : {}),
    };
  } else {
    return null;
  }
  persist();
  return getAgent(id);
}

// Elimina agentes: los creados por el usuario se borran del todo y los de ejemplo se ocultan
// (`deleted`) para poder restaurarlos. Devuelve cuantos se eliminaron.
export function deleteAgents(ids) {
  let count = 0;
  ids.forEach((id) => {
    const index = created.findIndex((agent) => agent.id === id);
    if (index >= 0) {
      created.splice(index, 1);
      count += 1;
    } else if (SEED.some((agent) => agent.id === id) && !deleted.has(id)) {
      deleted.add(id);
      count += 1;
    }
  });
  persist();
  return count;
}

export const countHiddenSamples = () => deleted.size;

export function restoreSamples() {
  deleted.clear();
  persist();
}
