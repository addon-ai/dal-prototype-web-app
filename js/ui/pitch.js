// Vista Pitch: deck de slides del pitch YSA 2026 (una escena a la vez), portado del original.
// Cronometro de 3 min, guion del orador, atajos de teclado, swipe y pantalla completa.
// Los atajos solo actuan con la vista Pitch visible y sin foco en campos de texto ni dialogos.
const TITLES = ['Portada', 'Cliente y problema', 'Evidencia', 'Solución', 'Monetización', 'Aporte de YSA'];
const TARGETS = [0, 30, 70, 115, 155, 180];
const NOTES = [
  'Somos Addon AI Enterprise, un socio tecnológico estratégico integral: diseñamos, construimos, desplegamos y operamos ecosistemas digitales completos con inteligencia artificial integrada en el núcleo operativo y decisorio de las empresas. Hoy presentamos DAL, nuestra Plataforma de Desarrollo de Agentes. Cuando avances al primer bloque arranca el cronómetro de 3 minutos.',
  'Son las seis de la mañana en el puerto de Cartagena. Un contenedor espera su liberación, un camión espera turno y la agencia de aduanas espera un documento que nadie ha enviado. En ese lapso de tiempo hay demoras y desincronizaciones que pueden acarrear desde problemas operativos hasta multas. Nuestros clientes son las agencias de aduanas y las empresas de transporte: los operadores del clúster logístico del Caribe colombiano. Su problema, al final, no es la falta de datos. Es que la información llega tarde, desincronizada y pensada solo para operar, no para decidir.',
  'Ese desfase tiene un costo medible. Operar con datos desactualizados genera sobrecostos del 15% al 25% por unidad movilizada y hasta 8 millones de pesos al mes en digitación manual. El riesgo sancionatorio es igual de alto: entre enero y septiembre de 2025, la Superintendencia de Transporte adelantó 2.716 investigaciones e impuso multas por más de 6.061 millones de pesos, y ya había abierto 258 investigaciones a empresas de carga por incumplimientos del SICE-TAC. A esto se suman las sanciones de la DIAN por inconsistencias en manifiestos, de 100 a 1.000 UVT, que pueden terminar en la inmovilización de la carga. Y frente al cliente final, un retraso imprevisto cuesta entre 5.000 y 50.000 dólares en penalidades por evento.',
  'Los informes de madurez digital y de madurez de IA (TXI AI Readiness Assessment, Tech-Azur) señalan que el 71% de las empresas del segmento Mid-Market no están listas para escalar soluciones de IA. Por eso creamos DAL, nuestra Plataforma de Desarrollo de Agentes. DAL se conecta a los sistemas que el cliente ya tiene (ERP, GPS, básculas y documentos) sin reemplazarlos, y despliega agentes de inteligencia artificial que trabajan dentro de la operación: uno valida cada manifiesto antes de que la carga se mueva, otro anticipa retrasos con 4 a 12 horas de ventaja y otro vigila el cumplimiento regulatorio. La información deja de llegar con días de atraso y se actualiza en menos de 15 minutos. No entregamos tableros que muestran lo que ya pasó: entregamos agentes que actúan mientras pasa. Hoy estamos validando DAL con Serpomar, en Cartagena, como paso previo a nuestra salida al mercado.',
  'Monetizamos con un modelo híbrido de dos capas. La primera es el Discovery: con nuestro Blueprint Engine levantamos y diseñamos el proceso agéntico de cada cliente, y lo cobramos por horas de ingeniería, entre 3.000 y 15.000 dólares. La segunda es la suscripción a nuestra aplicación núcleo, un SaaS que cobra por uso: ejecuciones de agentes en producción, bases de conocimiento RAG, consumo de tokens de entrada y salida por modelo, y procesamiento de documentos. Cada agente que construimos se suma a nuestro marketplace de microservicios reutilizables, y eso hace cada nueva implementación más rápida y más rentable. Proyectamos ingresos recurrentes de 5.000 a 50.000 dólares mensuales por cuenta industrial, con márgenes operativos superiores al 70%.',
  'El programa YSA fue determinante. Nos llevó de ser una consultora técnica tradicional a un modelo SaaS escalable por uso de agentes, nos ayudó a estructurar una garantía de resultados con devolución del 20% de la inversión y a construir nuestro modelo financiero para el ecosistema portuario del Caribe. Con la Cámara de Comercio de Santa Marta e ITC como aliados, DAL será el motor que transforme la logística de nuestra región.',
];

const SWIPE_MIN_PX = 60;
const SWIPE_RATIO = 1.4;
const TICK_MS = 250;

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// Campos donde escribir y elementos propios de otras vistas: el deck no captura sus teclas.
function isTypingTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
}

export function mountPitch(view, store) {
  const scenes = Array.from(view.querySelectorAll('.pitch__scene'));
  const dotsEl = view.querySelector('#pitch-dots');
  const prevBtn = view.querySelector('#pitch-prev');
  const nextBtn = view.querySelector('#pitch-next');
  const notesBtn = view.querySelector('#pitch-notes-btn');
  const notesEl = view.querySelector('#pitch-notes');
  const notesTitle = view.querySelector('#pitch-notes-title');
  const notesTarget = view.querySelector('#pitch-notes-target');
  const notesText = view.querySelector('#pitch-notes-text');
  const timerWrap = view.querySelector('#pitch-timer');
  const timerVal = view.querySelector('#pitch-timer-val');
  let cur = -1;
  let t0 = null;
  let tick = null;

  // La vista esta activa si esta visible (no oculta por la navegacion ni por el login).
  function isActive() {
    return store.getState().ui.view === 'pitch' && view.offsetParent !== null;
  }

  const dots = TITLES.map((title, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'pitch__dot';
    dot.setAttribute('aria-label', i ? `${i}. ${title}` : title);
    dot.addEventListener('click', () => go(i));
    dotsEl.append(dot);
    return dot;
  });

  function render() {
    const s = t0 === null ? 0 : Math.floor((performance.now() - t0) / 1000);
    timerVal.textContent = formatTime(s);
    timerWrap.classList.toggle('late', t0 !== null && cur > 0 && s > TARGETS[cur]);
  }

  function startTimer() {
    t0 = performance.now();
    clearInterval(tick);
    tick = setInterval(render, TICK_MS);
    render();
  }

  function resetTimer() {
    clearInterval(tick);
    t0 = null;
    if (cur > 0) {
      startTimer();
    } else {
      render();
    }
  }

  function updateNotes() {
    notesTitle.textContent = cur ? `${cur}. ${TITLES[cur]}` : TITLES[0];
    notesTarget.textContent = cur ? `Terminar en ${formatTime(TARGETS[cur])}` : 'Duración total 3:00';
    notesText.textContent = NOTES[cur];
  }

  function go(target) {
    const i = Math.max(0, Math.min(scenes.length - 1, target));
    if (i === cur) {
      return;
    }
    scenes.forEach((scene, k) => {
      const on = k === i;
      scene.classList.toggle('is-active', on);
      scene.inert = !on;
      scene.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (!on) {
        scene.classList.remove('is-built');
      }
    });
    const scene = scenes[i];
    scene.scrollTop = 0;
    void scene.offsetWidth; // reinicia las animaciones de ensamblaje
    scene.classList.add('is-built');
    cur = i;
    dots.forEach((dot, k) => dot.setAttribute('aria-current', k === i ? 'step' : 'false'));
    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === scenes.length - 1 ? 'Volver al inicio' : 'Siguiente';
    if (i > 0 && t0 === null) {
      startTimer();
    }
    updateNotes();
    render();
  }

  function toggleNotes() {
    notesEl.hidden = !notesEl.hidden;
    notesBtn.setAttribute('aria-pressed', String(!notesEl.hidden));
  }

  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      const request = document.documentElement.requestFullscreen;
      if (request) {
        const promise = document.documentElement.requestFullscreen();
        if (promise && promise.catch) {
          promise.catch(() => {});
        }
      }
    } catch (error) {
      // Sin pantalla completa disponible: no pasa nada.
    }
  }

  prevBtn.addEventListener('click', () => go(cur - 1));
  nextBtn.addEventListener('click', () => go(cur === scenes.length - 1 ? 0 : cur + 1));
  notesBtn.addEventListener('click', toggleNotes);

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (!isActive() || isTypingTarget(event.target) || document.querySelector('dialog[open]')) {
      return;
    }
    const { key, target } = event;
    // Espacio y Enter avanzan salvo sobre un boton o enlace (activan su propia accion).
    const onControl = target instanceof Element && Boolean(target.closest('button, a, summary'));
    if (key === 'ArrowRight' || key === 'PageDown' || ((key === ' ' || key === 'Enter') && !onControl)) {
      event.preventDefault();
      go(cur + 1);
    } else if (key === 'ArrowLeft' || key === 'PageUp') {
      event.preventDefault();
      go(cur - 1);
    } else if (key === 'Home') {
      event.preventDefault();
      go(0);
    } else if (key === 'End') {
      event.preventDefault();
      go(scenes.length - 1);
    } else if (key === 'n' || key === 'N') {
      toggleNotes();
    } else if (key === 'r' || key === 'R') {
      resetTimer();
    } else if (key === 'f' || key === 'F') {
      toggleFullscreen();
    }
  });

  // Swipe horizontal sobre la vista (los toques fuera de ella no cuentan).
  let sx = null;
  let sy = null;
  view.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      sx = touch.clientX;
      sy = touch.clientY;
    },
    { passive: true },
  );
  view.addEventListener(
    'touchend',
    (event) => {
      if (sx === null) {
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - sx;
      const dy = touch.clientY - sy;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
        go(cur + (dx < 0 ? 1 : -1));
      }
      sx = null;
    },
    { passive: true },
  );

  // Fuera de la vista Pitch el reloj deja de refrescarse; al volver se pone al dia (el pitch sigue contando).
  store.subscribe(
    (state) => state.ui.view,
    (name) => {
      clearInterval(tick);
      if (name === 'pitch') {
        if (t0 !== null) {
          tick = setInterval(render, TICK_MS);
        }
        render();
      }
    },
  );

  go(0);
}
