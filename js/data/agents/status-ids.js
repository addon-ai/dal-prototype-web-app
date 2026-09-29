// Estados posibles de un agente (el rotulo, el icono y el anillo viven en la capa de UI).
export const STATUS_IDS = ['borrador', 'activo', 'inactivo'];
export const isStatus = (value) => STATUS_IDS.includes(value);
