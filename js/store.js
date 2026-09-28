// Store pub/sub minimo: un estado, un reducer puro, suscripciones por selector.
export function createStore(reducer, initial) {
  let state = initial;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function dispatch(action) {
    const next = reducer(state, action);
    if (next === state) {
      return state;
    }
    state = next;
    Array.from(listeners).forEach((listener) => listener());
    return state;
  }

  // Llama a `fn(valorSeleccionado, estado)` solo cuando el valor seleccionado cambia.
  function subscribe(selector, fn) {
    let last = selector(state);
    const listener = () => {
      const value = selector(state);
      if (value !== last) {
        last = value;
        fn(value, state);
      }
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}
