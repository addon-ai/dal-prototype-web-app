// Puntos interactivos del fondo: los puntos de la rejilla cercanos al cursor se iluminan y crecen,
// y al pasar sobre un punto nacen hilos hacia puntos vecinos (como en la landing de Addon AI).
// Un canvas fijo y decorativo; el bucle de animacion solo corre mientras hay movimiento o hilos.
// Todos los colores y medidas salen de los tokens --dots-* (css/tokens.css).
const MAX_DPR = 2;
const MAX_EDGES = 60;
const HOVER_RATIO = 0.38; // el cursor "toca" un punto a menos de 0.38 x paso
const FOLLOW_MS = 70; // inercia del halo
const FADE_MS = 220; // entrada y salida del halo
const DIAGONALS = [-2, -1, 1, 2].flatMap((dx) => [-2, -1, 1, 2].map((dy) => [dx, dy]));
const ENABLE_QUERY = '(prefers-reduced-motion: no-preference) and (not (pointer: coarse)) and (min-width: 768px)';

export function mountDotField() {
  const root = document.documentElement;
  const enableMq = window.matchMedia(ENABLE_QUERY);
  let canvas = null;
  let ctx = null;
  let cfg = null;
  let frame = 0;
  let last = 0;
  let resizeTimer = 0;
  let edges = [];
  let hovered = '';
  const target = { x: -1e4, y: -1e4, on: 0 };
  const halo = { x: -1e4, y: -1e4, k: 0 };

  function readTokens() {
    const css = getComputedStyle(root);
    const num = (name) => parseFloat(css.getPropertyValue(name));
    cfg = {
      rgb: css.getPropertyValue('--dots-rgb').trim(),
      opacity: num('--dots-opacity'),
      radius: num('--dots-radius'),
      step: num('--dots-step'),
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    request();
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }

  function spawnEdges(x, y) {
    const picks = DIAGONALS.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    picks.forEach(([dx, dy]) => {
      const tx = x + dx * cfg.step;
      const ty = y + dy * cfg.step;
      if (tx < 0 || ty < 0 || tx > window.innerWidth || ty > window.innerHeight) {
        return;
      }
      edges.push({ x, y, tx, ty, t: 0, alpha: 0, max: 0.18 + Math.random() * 0.18,
        phase: 0, hold: 300 + Math.random() * 400, speed: 0.0011 + Math.random() * 0.0013 });
    });
    edges = edges.slice(-MAX_EDGES);
  }

  function checkHover() {
    const gx = Math.round(target.x / cfg.step) * cfg.step;
    const gy = Math.round(target.y / cfg.step) * cfg.step;
    const near = Math.hypot(target.x - gx, target.y - gy) < cfg.step * HOVER_RATIO;
    const inside = gx >= cfg.step && gy >= cfg.step && gx < window.innerWidth && gy < window.innerHeight;
    const key = near && inside ? `${gx},${gy}` : '';
    if (key && key !== hovered) {
      spawnEdges(gx, gy);
    }
    hovered = key;
  }

  function stepEdges(dt) {
    edges = edges.filter((e) => {
      if (e.phase === 0) {
        e.t = Math.min(1, e.t + e.speed * dt);
        e.alpha = Math.min(e.max, e.alpha + 0.0009 * dt);
        e.phase = e.t >= 1 ? 1 : 0;
      } else if (e.phase === 1) {
        e.hold -= dt;
        e.phase = e.hold <= 0 ? 2 : 1;
      } else {
        e.alpha -= 0.0007 * dt;
      }
      return e.alpha > 0 || e.phase < 2;
    });
  }

  function draw() {
    const { rgb, opacity, radius, step } = cfg;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (halo.k > 0.01) {
      const x0 = Math.max(step, Math.ceil((halo.x - radius) / step) * step);
      const y0 = Math.max(step, Math.ceil((halo.y - radius) / step) * step);
      for (let x = x0; x <= halo.x + radius; x += step) {
        for (let y = y0; y <= halo.y + radius; y += step) {
          const glow = Math.max(0, 1 - Math.hypot(halo.x - x, halo.y - y) / radius) * halo.k;
          if (glow > 0) {
            ctx.fillStyle = `rgba(${rgb},${glow * 0.3 * opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, 1 + glow * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    edges.forEach((e) => {
      const cx = e.x + (e.tx - e.x) * e.t;
      const cy = e.y + (e.ty - e.y) * e.t;
      const grad = ctx.createLinearGradient(e.x, e.y, cx, cy);
      grad.addColorStop(0, `rgba(${rgb},${e.alpha * 0.3 * opacity})`);
      grad.addColorStop(0.5, `rgba(${rgb},${e.alpha * opacity})`);
      grad.addColorStop(1, `rgba(${rgb},${e.alpha * 0.6 * opacity})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.fillStyle = `rgba(${rgb},${Math.min(1, e.alpha * 1.3) * opacity})`;
      ctx.beginPath();
      ctx.arc(e.phase === 0 ? cx : e.tx, e.phase === 0 ? cy : e.ty, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tick(now) {
    const dt = Math.min(64, now - last);
    last = now;
    const follow = 1 - Math.exp(-dt / FOLLOW_MS);
    if (halo.k < 0.01 && target.on) {
      halo.x = target.x; // el halo aparece bajo el cursor, sin viajar desde lejos
      halo.y = target.y;
    }
    halo.x += (target.x - halo.x) * follow;
    halo.y += (target.y - halo.y) * follow;
    halo.k += (target.on - halo.k) * (1 - Math.exp(-dt / FADE_MS));
    stepEdges(dt);
    draw();
    const settled = Math.abs(target.x - halo.x) < 0.3 && Math.abs(target.y - halo.y) < 0.3
      && Math.abs(target.on - halo.k) < 0.01;
    frame = settled && !edges.length ? 0 : requestAnimationFrame(tick);
    if (!frame) {
      halo.k = target.on;
      draw();
    }
  }

  function request() {
    if (canvas && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function onMove(event) {
    target.x = event.clientX;
    target.y = event.clientY;
    target.on = 1;
    checkHover();
    request();
  }

  function onLeave() {
    target.on = 0;
    hovered = '';
    request();
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    edges = [];
    hovered = '';
    halo.k = 0;
    target.on = 0;
  }

  function shouldRun() {
    return enableMq.matches && !document.hidden && document.body.dataset.view !== 'constructor';
  }

  function enable() {
    if (canvas) {
      return;
    }
    readTokens();
    canvas = document.createElement('canvas');
    canvas.className = 'dot-field';
    canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
  }

  function disable() {
    if (!canvas) {
      return;
    }
    stop();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', onResize);
    root.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
    canvas.remove();
    canvas = null;
    ctx = null;
  }

  function sync() {
    if (shouldRun()) {
      enable();
    } else {
      disable();
    }
  }

  enableMq.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  new MutationObserver(() => {
    if (canvas) {
      readTokens();
      request();
    }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
}
