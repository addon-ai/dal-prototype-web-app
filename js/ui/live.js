// Region aria-live: anuncia los avisos que deja el reducer en `ui.notice`.
export function mountLive(el, store) {
  store.subscribe(
    (state) => state.ui.noticeSeq,
    (_seq, state) => {
      const text = state.ui.notice;
      if (!text) {
        return;
      }
      // Vaciar primero asegura que un texto repetido se vuelva a anunciar.
      el.textContent = '';
      setTimeout(() => {
        el.textContent = text;
      }, 30);
    },
  );
}
