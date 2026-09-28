## Exploration (versión pública): dal-prototype-gerencial

Versión recortada para repo público. Se conservan solo los tokens visuales de la UI, el vocabulario técnico a negocio y la superficie de negocio del prototipo. Se omitieron detalles internos del backend, del código fuente de la app y de la política de tarifas.

### A. Tema visual DAL (default)

Tema por defecto: acento verde `#12d27c`, modo claro/oscuro con `data-theme="light|dark"` (localStorage `theme`, fallback `prefers-color-scheme`). Fuentes por Google Fonts (Roboto, Noto Sans, IBM Plex Sans, JetBrains Mono, `display=swap`) con fallback `system-ui`. Logo y favicon en `assets/`. Los tokens están copiados de la app DAL en su commit `f4fce1e`.

| Token                                  | Light (:root)                                                 | Dark ([data-theme='dark'])            |
| -------------------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| --color-blue-dark                      | #163a65                                                       | =                                     |
| --color-blue-light                     | #477099                                                       | =                                     |
| --color-teal                           | #338a7b                                                       | =                                     |
| --color-green (accent)                 | #12d27c                                                       | =                                     |
| --color-coral                          | #ef8b72                                                       | =                                     |
| --color-purple                         | #7c3aed                                                       | =                                     |
| --color-accent / hover                 | #12d27c / #0ea863                                             | =                                     |
| --color-accent-light                   | accent 8% transp. (color-mix)                                 | accent 12%                            |
| --color-btn-accent-bg                  | (no definido; usa accent)                                     | #0a8044                               |
| --color-on-accent                      | var(--color-text-primary) (#163a65, texto oscuro sobre verde) | idem                                  |
| --color-text-primary                   | #163a65                                                       | #f1f5f9                               |
| --color-text-secondary                 | #477099                                                       | #94a3b8                               |
| --color-text-muted                     | #4b7aa3 (corregido WCAG AA)                                   | #8ba3b8                               |
| --color-text-on-dark / -muted          | #f1f5f9 / #7aa3c9                                             | #f1f5f9 / #94a3b8                     |
| --color-border / -light                | #b9c9db / #eaf0f5                                             | #334155 / #1e293b                     |
| --color-bg-page                        | #f8f9fa                                                       | #0f172a                               |
| --color-bg-card (+ -solid)             | #ffffff                                                       | #1e293b                               |
| --color-surface-sidebar (+hover)       | #ffffff (#f0f4f8)                                             | #0f172a (#1e293b)                     |
| --color-surface-tooltip / popover      | #163a65 / #ffffff                                             | #1e293b / #1e293b                     |
| --color-success / -light               | #12d27c / rgba(18,210,124,.1)                                 | -light .15                            |
| --color-warning / -light               | #ef8b72 / rgba(239,139,114,.1)                                | -light .15                            |
| --color-error / -light                 | #c24233 / rgba(194,66,51,.1)                                  | -light .15                            |
| badge text success/warning/error/info  | #15803d / #a16207 / #dc2626 / #1d4ed8                         | #34d399 / #fbbf24 / #f87171 / #60a5fa |
| --color-badge-neutral-bg               | #f1f5f9                                                       | #1e293b                               |
| --color-table-row-alt                  | #f8f9fa                                                       | rgba(255,255,255,.03)                 |
| --color-json-key/string/number/boolean | #0369a1/#166534/#854d0e/#be123c                               | #67e8f9/#a5f3fc/#fde68a/#fca5a5       |
| --color-json-null / bracket            | text-muted / text-secondary                                   | #94a3b8 / #e2e8f0                     |
| --chart-grid (hex 6 dig.)              | #d0dce8                                                       | #334155                               |
| --chart-color-1..4                     | accent, teal(#338a7b), blue-light(#477099), coral(#ef8b72)    | =                                     |
| --scrollbar-thumb / hover              | rgba(22,58,101,.25/.45)                                       | rgba(148,163,184,.3/.55)              |
| color-scheme                           | light                                                         | dark                                  |

Tipografia: `--font-heading:'Roboto'`, `--font-subheading:'Noto Sans'`, `--font-primary:'IBM Plex Sans'` (body), `--font-mono:'JetBrains Mono','Fira Code',monospace` (todos con fallback `system-ui,-apple-system,sans-serif`). Escala px: xs 11, sm 12, chat 13, base 14, md 15, lg 16, xl 20, 2xl 24, 3xl 32 (>=1920px sube ~x1.14: xs12 sm13 base16 md17 lg18 xl23). Pesos 400/500/600/700. Line-height 1.25 / 1.5 / 1.625. `html{font-size:var(--font-size-base)}` (14px). Semantica de formulario: label = sm/500/text-primary; hint = xs/text-secondary; error = xs.
Espaciado (base 4): space-1..6 = 4,8,12,16,20,24; 8=32; 10=40; 12=48. Layout: sidebar 260 (colapsada 64), header 60, content-max 1400, padding 32.
Radios: sm 4, md 6, lg 8, xl 12, full 9999. Sombras: sm `0 1px 2px rgba(0,0,0,.05)`, md `0 1px 3px rgba(0,0,0,.08)`, lg `0 4px 6px -1px rgba(0,0,0,.07),0 2px 4px -2px rgba(0,0,0,.05)`, xl `0 10px 15px -3px rgba(0,0,0,.08),0 4px 6px -4px rgba(0,0,0,.04)` (dark: .2/.25/.3/.3). Focus: `:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--color-accent) 10%,transparent)}` (15% en dark; SIEMPRE verde, nunca azul). ATENCION: 10% de verde sobre blanco es un anillo casi invisible; en el prototipo conviene reforzarlo (outline 2px accent) por accesibilidad.
Motion: `--easing-brand: cubic-bezier(.23,1,.32,1)`; transiciones fast 200ms / base 300ms / slow 400ms con easing-brand; hover card `translateY(-6px) scale(1.015)` + `0 12px 40px rgba(22,58,101,.12)`; hover button `translateY(-2px)`. `prefers-reduced-motion` apaga transiciones (ya en global.css).
Glass (opcional, no default): body con 2 radial-gradients (glow-1 `rgba(18,210,124,.1)`, glow-2 `rgba(71,112,153,.12)`) sobre `linear-gradient(180deg,#eef3f7,#f8f9fa 55%,#eef4f0)`; cards `rgba(255,255,255,.55)` + `backdrop-filter: blur(14px) saturate(1.4)`. Dark: base `linear-gradient(180deg,#0b1220,#0f172a 55%,#0a1522)`.
Reset (global.css): `*{box-sizing:border-box;margin:0;padding:0}`, button sin fondo/`font:inherit`, `ul,ol{list-style:none}`, scrollbars finos de 8px, body `overflow-x:hidden`.
Nota de accesibilidad: sobre acento `#12d27c` el texto es azul oscuro `#163a65` (contraste alto); NO usar texto blanco sobre el verde. Boton "accent" en dark usa `#0a8044` (texto blanco).

---

### B. Vocabulario técnico a negocio (logística)

Los pasos del asistente usan nombres de negocio: "Entiende y responde", "Consulta documentos de la empresa", "Lee documentos", "Conecta con tus sistemas", "Regla de negocio", "Control de seguridad", "Aprobación de una persona", "Avisa", "Prepara datos".

Revisado: `i18n/resources/es/graphs.json` (ya usa "Agente" en vez de "grafo": "Definicion de Agentes", "Nuevo Agente", columnas Nodos/Aristas), sidebar (`es.json`: Agentes, Seguridad, Operaciones, Supervision, Datos). Leyenda canvas ES: LLM, Herramienta de integracion, Regla, Transformacion, Guardrail, Humano, RAG.
| Tecnico | Propuesta gerencial |
|---|---|
| Grafo / definicion de agente | Asistente / Flujo de trabajo del asistente |
| Nodo | Paso |
| Arista / edge | Conexion (flecha "luego") |
| Arista condicional | Decision: "si ..., entonces ..." |
| Nodo LLM | Asistente que razona / redacta (Entiende y responde) |
| Prompt | Instrucciones del asistente |
| Temperature | Creatividad (precisa <-> creativa) |
| max_tokens | Largo maximo de la respuesta |
| RAG / embeddings / coleccion | Consulta a documentos de la empresa (manuales, contratos, politicas) |
| integration_tool / MCP | Conexion a sistemas (TMS, ERP, WMS, correo, WhatsApp) |
| Rule / rule engine | Regla de negocio (ej. "retraso > 4 h => escalar") |
| Guardrail (semantic) | Control de seguridad y cumplimiento / Proteccion de datos |
| Human (HIL) | Aprobacion de una persona (supervisor) |
| Transform | Preparar / ordenar la informacion |
| Doc node / doc-processor | Lectura de documentos (guias, facturas, POD) |
| Subgraph | Sub-proceso reutilizable |
| Notification | Aviso al cliente / al equipo |
| State schema / reducer | Datos que recuerda el asistente durante el caso |
| Ejecucion / run | Caso atendido / conversacion procesada |
| Token | Unidad de consumo de IA ("palabras procesadas") |
| Latencia p50/p95 | Tiempo tipico / peor caso de respuesta |
| Deny rate | % de casos bloqueados por seguridad |
| Compilar / version / DRAFT-ACTIVE | Validar / Publicar / Borrador-Publicado |
| Bolsa / overage / seat | Cupo incluido / excedente / usuario con licencia (Constructor = quien disena, Operador = quien atiende) |
| JSON/YAML | "Receta tecnica del asistente" (vista para TI) |
| Costo por token/1M | Costo por uso de IA |

---

### C. Superficie consumidor

El prototipo muestra SOLO lo que ve o paga un gerente/CEO consumidor.

- Asistente y sus pasos (nombres de negocio de la sección B); decisiones "si ..., entonces ..."; ajustes simples (creatividad, largo de respuesta).
- Estadísticas: casos atendidos, tasa de éxito, tiempo típico y peor caso de respuesta, casos bloqueados por seguridad, aprobaciones pendientes y cumplimiento de plazo, consumo de IA por modelo, consumo vs cupo del plan, costo estimado por servicio, ahorro/horas estimadas (hipótesis).
- Costos: una línea por servicio facturable en lenguaje de negocio (plan, casos atendidos, consumo de IA, base de conocimiento, documentos, usuarios), con **precios ilustrativos** parametrizados en un único archivo (`js/pricing.config.js`). No son precios reales.
- Vista JSON/YAML como "Receta técnica (para TI)", colapsada por defecto.

Excluido del prototipo: administración, operación y depuración de la plataforma, y todo concepto de costo interno o margen.

### D. Enfoque de arquitectura

SVG + Pointer Events vanilla con módulos ES, sin build ni dependencias. Un store pub/sub único alimenta lienzo, receta, estadísticas y narrativa. Datos simulados con semilla determinista y rótulo visible de datos de ejemplo. Charts en SVG propio, sin depender solo del color.

### Riesgos

- Las cifras son supuestos: rotular "ilustrativo" y centralizarlas en `js/pricing.config.js`.
- Google Fonts requiere internet; hay fallback `system-ui`.
- El focus ring debe ser visible (outline 2px, contraste >= 3:1).
- Forma + icono + etiqueta por paso, no solo color; alternativa de teclado para arrastrar.
- Receta técnica colapsada por defecto para no abrumar a perfiles gerenciales.
