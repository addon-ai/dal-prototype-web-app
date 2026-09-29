// Dialogo "Editar agente": nombre, estado y avatar. Guarda con "Guardar" (o Enter); Escape cancela.
import { getAgent, updateAgent } from '../data/agents/index.js';
import { createAgentAvatar } from './avatar.js';
import { createAvatarPicker } from './avatar-picker.js';
import { createDialog, dialogButton } from './dialog.js';
import { h } from './dom.js';
import { STATUS } from './agent-status.js';

const NAME_MAX = 60;
let ui = null;

function build(store) {
  const dialog = createDialog({ id: 'agent-editor', title: 'Editar agente' });
  const form = h('form', 'agent-editor');
  form.noValidate = true;
  const preview = h('div', 'agent-editor__preview');
  const field = h('div', 'field');
  const label = h('label', 'field__label', 'Nombre del agente');
  const input = document.createElement('input');
  input.id = 'agent-editor-name';
  input.type = 'text';
  input.maxLength = NAME_MAX;
  input.autocomplete = 'off';
  label.htmlFor = input.id;
  const error = h('p', 'agent-editor__error', 'Escribe un nombre para el agente.');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  field.append(label, input, error);
  const stateField = h('div', 'field');
  const stateLabel = h('label', 'field__label', 'Estado');
  const stateSelect = document.createElement('select');
  stateSelect.id = 'agent-editor-status';
  stateSelect.className = 'select';
  stateLabel.htmlFor = stateSelect.id;
  Object.entries(STATUS).forEach(([value, item]) => {
    const option = h('option', '', item.label);
    option.value = value;
    stateSelect.append(option);
  });
  stateField.append(stateLabel, stateSelect);
  const picker = createAvatarPicker({ value: '', onChange: (id) => paintPreview(id) });
  const hint = h('p', 'muted agent-editor__hint', 'Elige un avatar. Usa las flechas para recorrerlos.');
  form.append(h('div', 'agent-editor__top'), stateField, hint, picker.el);
  form.firstChild.append(preview, field);
  dialog.body.append(form);

  function paintPreview(avatarId) {
    preview.replaceChildren(createAgentAvatar({ avatarId, size: 72, name: input.value.trim() || 'tu agente' }));
  }
  input.addEventListener('input', () => {
    error.hidden = true;
    paintPreview(picker.get());
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) {
      error.hidden = false;
      input.focus();
      return;
    }
    const { agentId } = ui;
    const agent = updateAgent(agentId, { name, avatarId: picker.get(), status: stateSelect.value });
    dialog.close();
    store.dispatch({
      type: 'AGENTS_CHANGED',
      id: agentId,
      name: agent.name,
      notice: `Agente «${agent.name}» actualizado.`,
    });
  });
  dialog.footer.append(
    dialogButton('Cancelar', 'btn', () => dialog.close()),
    dialogButton('Guardar', 'btn btn--primary', () => form.requestSubmit()),
  );
  return { dialog, input, picker, error, paintPreview, stateSelect, agentId: null };
}

export function openAgentEditor(store, agentId, trigger) {
  const agent = getAgent(agentId);
  if (!agent) {
    return;
  }
  ui = ui ?? build(store);
  ui.agentId = agentId;
  ui.input.value = agent.name;
  ui.error.hidden = true;
  ui.stateSelect.value = agent.status;
  ui.picker.set(agent.avatarId);
  ui.paintPreview(agent.avatarId);
  ui.dialog.open(trigger, ui.input);
  ui.input.select();
}
