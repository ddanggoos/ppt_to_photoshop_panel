export type Listener<T> = (state: T) => void;

export interface Store<T> {
  get(): T;
  update(patch: Partial<T>): void;
  subscribe(listener: Listener<T>): void;
}

/** Minimal observable state container. */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners: Listener<T>[] = [];

  return {
    get: () => state,
    update(patch) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.push(listener);
    },
  };
}
