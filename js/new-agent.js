// Flujo "agente nuevo": crea la ficha, abre el constructor en blanco y avisa. Solo se ejecuta por
// una accion del usuario (nunca al cargar una ruta), y ignora repeticiones muy seguidas.
import { createAgent } from './data/agents/index.js';
import { goTo } from './navigation.js';

const GUARD_MS = 350;

export function createNewAgentStarter(store, focusHeading) {
  let last = 0;
  return function startNewAgent(fromTemplate = false) {
    const now = Date.now();
    if (now - last < GUARD_MS) {
      return;
    }
    last = now;
    const agent = createAgent(fromTemplate);
    goTo(store, { view: 'constructor', id: agent.id });
    store.dispatch({
      type: 'AGENTS_CHANGED',
      notice: `Nuevo agente creado: «${agent.name}». Elige el primer paso para empezar.`,
    });
    focusHeading();
  };
}
