// Catalogo de pasos en lenguaje de negocio. Datos estaticos, sin red.
// `wireType`, `wireKey` y `wireFixed` solo los usa la receta tecnica (para TI).
// `icon` es el contenido interno de un SVG de 24x24 (trazo, currentColor).
// `consumo` son factores de uso por caso atendido (no son precios).

const NAME_SETTING = { key: 'nombre', label: 'Nombre del paso', type: 'text', target: 'label' };

const CATALOG_LIST = [
  {
    step: 'entiende',
    label: 'Entiende y responde',
    description: 'Lee la consulta y redacta una respuesta clara.',
    wireType: 'llm',
    shape: 'rect',
    category: 'ai',
    icon: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'creatividad',
        label: 'Estilo de respuesta',
        type: 'range',
        wireKey: 'temperature',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.3,
        leftLabel: 'Precisa',
        rightLabel: 'Creativa',
      },
      {
        key: 'largo',
        label: 'Largo de la respuesta',
        type: 'range',
        wireKey: 'max_tokens',
        min: 100,
        max: 800,
        step: 50,
        default: 300,
        leftLabel: 'Corta',
        rightLabel: 'Larga',
      },
    ],
    consumo: { tokensIn: 800, tokensOut: 300, segundos: 2 },
  },
  {
    step: 'documentos',
    label: 'Consulta documentos de la empresa',
    description: 'Busca en manuales y políticas la información que hace falta.',
    wireType: 'rag',
    shape: 'trapezoid',
    category: 'data',
    icon: '<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'fuente',
        label: 'Documentos a consultar',
        type: 'select',
        wireKey: 'collection',
        default: 'manuales-logistica',
        options: [
          { value: 'manuales-logistica', label: 'Manuales de logística' },
          { value: 'politicas-compensacion', label: 'Políticas de compensación' },
        ],
      },
    ],
    consumo: { tokensIn: 400, tokensOut: 0, segundos: 1, consultasBase: 1 },
  },
  {
    step: 'lee',
    label: 'Lee documentos',
    description: 'Extrae datos de guías, facturas o comprobantes de entrega.',
    wireType: 'doc',
    shape: 'document',
    category: 'data',
    icon: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'dudas',
        label: 'Si el documento no se lee bien',
        type: 'select',
        wireKey: 'on_low_confidence',
        default: 'escalate',
        options: [
          { value: 'continue', label: 'Continuar igual' },
          { value: 'retry', label: 'Reintentar' },
          { value: 'escalate', label: 'Pedir revisión a una persona' },
        ],
      },
    ],
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 3, docs: 1 },
  },
  {
    step: 'sistemas',
    label: 'Conecta con tus sistemas',
    description: 'Consulta datos del sistema de transporte o de gestión.',
    wireType: 'integration_tool',
    shape: 'hexagon',
    category: 'data',
    icon: '<path d="M9 7V3M15 7V3M7 7h10v5a5 5 0 0 1-10 0z"/><path d="M12 17v4"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'sistema',
        label: 'Sistema a consultar',
        type: 'select',
        wireKey: 'system',
        default: 'transporte',
        options: [
          { value: 'transporte', label: 'Sistema de transporte' },
          { value: 'gestion', label: 'Sistema de gestión' },
        ],
      },
    ],
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 1, llamadas: 2 },
  },
  {
    step: 'regla',
    label: 'Regla de negocio',
    description: 'Decide qué camino seguir según una condición de la empresa.',
    wireType: 'rule',
    shape: 'diamond',
    category: 'control',
    icon: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8v5M12 16v.5"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'regla',
        label: 'Regla a aplicar',
        type: 'select',
        wireKey: 'rule_id',
        default: 'retraso-critico',
        options: [
          { value: 'retraso-critico', label: 'Retraso crítico del envío' },
          { value: 'monto-alto', label: 'Compensación de monto alto' },
        ],
      },
      {
        key: 'sinDatos',
        label: 'Si no hay datos para decidir',
        type: 'select',
        wireKey: 'on_unavailable',
        default: 'fail',
        options: [
          { value: 'fail', label: 'Detener el caso' },
          { value: 'pass', label: 'Continuar igual' },
        ],
      },
    ],
    wireFixed: { output_key: 'rule_decision' },
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 0 },
  },
  {
    step: 'seguridad',
    label: 'Control de seguridad',
    description: 'Revisa que no circulen datos sensibles antes de seguir.',
    wireType: 'guardrail',
    shape: 'octagon',
    category: 'control',
    icon: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'sinVerificar',
        label: 'Si no se puede verificar',
        type: 'select',
        wireKey: 'on_unresolved',
        default: 'fail',
        options: [
          { value: 'fail', label: 'Detener el caso' },
          { value: 'omit', label: 'Omitir el control' },
          { value: 'default', label: 'Seguir con valores por defecto' },
        ],
      },
    ],
    wireFixed: { input_key: 'message', output_key: 'guardrail_decision' },
    consumo: { tokensIn: 200, tokensOut: 20, segundos: 1 },
  },
  {
    step: 'aprobacion',
    label: 'Aprobación de una persona',
    description: 'Pausa el caso hasta que alguien autorice o rechace.',
    wireType: 'human',
    shape: 'circle',
    category: 'person',
    icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'pregunta',
        label: 'Pregunta para la persona',
        type: 'text',
        wireKey: 'prompt',
        default: '¿Autorizar la compensación?',
      },
      {
        key: 'rol',
        label: 'Quién debe aprobar',
        type: 'select',
        wireKey: 'required_roles',
        asArray: true,
        default: 'supervisor',
        options: [
          { value: 'supervisor', label: 'Supervisor' },
          { value: 'gerente', label: 'Gerente de operaciones' },
        ],
      },
    ],
    wireFixed: { interaction_type: 'boolean' },
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 0, esperaHumanaSeg: 900 },
  },
  {
    step: 'avisa',
    label: 'Avisa',
    description: 'Envía un aviso al cliente o al equipo.',
    wireType: 'notification',
    shape: 'envelope',
    category: 'person',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'canal',
        label: 'Por dónde avisar',
        type: 'select',
        wireKey: 'channel',
        default: 'correo',
        options: [
          { value: 'correo', label: 'Correo electrónico' },
          { value: 'mensaje', label: 'Mensaje de texto' },
        ],
      },
      {
        key: 'mensaje',
        label: 'Texto del aviso',
        type: 'text',
        wireKey: 'message',
        default: 'Tu consulta fue atendida.',
      },
    ],
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 0, llamadas: 1 },
  },
  {
    step: 'prepara',
    label: 'Prepara datos',
    description: 'Ordena y limpia la información antes del siguiente paso.',
    wireType: 'transform',
    shape: 'parallelogram',
    category: 'data',
    icon: '<path d="M4 7h10M4 12h16M4 17h10"/><path d="M17 5l3 2-3 2"/>',
    settings: [
      NAME_SETTING,
      {
        key: 'detalle',
        label: 'Qué se prepara',
        type: 'text',
        wireKey: 'description',
        default: 'Ordenar los datos del envío',
      },
    ],
    consumo: { tokensIn: 0, tokensOut: 0, segundos: 0 },
  },
];

export const CATALOG = Object.freeze(CATALOG_LIST);

export function getCatalogEntry(step) {
  return CATALOG_LIST.find((entry) => entry.step === step) ?? null;
}

export function defaultSettings(step) {
  const entry = getCatalogEntry(step);
  const settings = {};
  if (!entry) {
    return settings;
  }
  entry.settings.forEach((setting) => {
    settings[setting.key] = setting.key === 'nombre' ? entry.label : setting.default;
  });
  return settings;
}
