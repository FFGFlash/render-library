import TaskLock from "./tasklock";

/**
 * Creates a new signal with the given value
 * @param value The initial value of the signal
 */
export function signal<T>(value: T): Signal<T>;
/**
 * Creates a new signal
 */
export function signal<T = undefined>(): Signal<T | undefined>;
export function signal<T>(value?: T | (() => T)) {
  return new Signal(value instanceof Function ? value() : value);
}

/**
 * Creates a new effect, used to run side effects when signals change.
 * @param effect The effect to run
 */
export function effect(
  effect: (signal: AbortSignal) => Promisable<void | (() => void)>
) {
  return Signal.effect(effect);
}

/**
 * Creates a new computed signal, which is derived from other signals.
 * @param effect The effect to run
 * @returns A computed signal
 */
export function computed<T>(effect: (signal?: AbortSignal) => Promisable<T>) {
  return new Computed(effect);
}

/**
 * Batches multiple signal updates into a single effect run.
 * @param effect The effect to run
 */
export function batch(effect: () => void) {
  Signal.batch(effect);
}

export class Signal<T = any> {
  static #dependencies = new Map<Signal, Set<() => void>>();
  static #activeEffect?: () => void;
  static #cleanupQueue = new Map<() => void, () => void>();
  static #abortQueue = new Map<() => void, AbortController>();

  // Batching
  static #batching = false;
  static #effectQueue = new Set<() => void>();

  static #effectLock = new TaskLock();

  name;
  #value: T;
  #dependents = new Set<() => void>();

  constructor(value: T, name?: string) {
    this.name = name;
    this.#value = value;
  }

  #queueNotification() {
    if (Signal.#batching) {
      this.#dependents.forEach((effect) => Signal.#effectQueue.add(effect));
      return;
    }
    this.#dependents.forEach((effect) => effect());
  }

  get value() {
    if (Signal.#activeEffect && !this.#dependents.has(Signal.#activeEffect)) {
      const effect = Signal.#activeEffect;
      this.#dependents.add(effect);
    }
    return this.#value;
  }

  set value(value: T) {
    if (this.#value === value) return;
    this.#value = value;
    this.#queueNotification();
  }

  static effect(
    effect: (signal: AbortSignal) => Promisable<void | (() => void)>
  ) {
    const wrappedEffect = () => {
      if (this.#abortQueue.has(wrappedEffect)) {
        this.#abortQueue.get(wrappedEffect)!.abort();
        this.#abortQueue.delete(wrappedEffect);
      }

      return this.#effectLock.task(async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        this.#abortQueue.set(wrappedEffect, controller);

        let cleanup: void | (() => void) = undefined;

        this.#activeEffect = wrappedEffect;

        try {
          this.#cleanupEffect(wrappedEffect);
        } catch (e) {
          console.warn("Effect cleanup failed", e);
        }

        try {
          const res = effect(signal);

          if (res instanceof Promise) cleanup = await res;
          else cleanup = res;
        } catch (e) {
          console.warn("Effect failed", e);
        } finally {
          Signal.#activeEffect = undefined;
        }

        if (cleanup) this.#cleanupQueue.set(wrappedEffect, cleanup);
      });
    };
    wrappedEffect();
  }

  static #cleanupEffect(effect: () => void) {
    const deps = this.#dependencies;

    deps.forEach((effects, signal) => {
      effects.delete(effect);
      if (effects.size === 0) {
        deps.delete(signal);
      }
    });

    const cleanup = this.#cleanupQueue.get(effect);
    cleanup?.();
  }

  static batch(effect: () => void) {
    this.#batching = true;
    try {
      effect();
    } finally {
      this.#batching = false;
      this.#effectQueue.forEach((effect) => effect());
      this.#effectQueue.clear();
    }
  }
}

export class Computed<T> {
  #effect: (signal: AbortSignal) => Promisable<T>;
  #signal: Signal<T | null>;

  constructor(effect: (signal?: AbortSignal) => Promisable<T>) {
    const controller = new AbortController();
    const initialValue = effect(controller.signal);

    this.#effect = effect;

    if (initialValue instanceof Promise) {
      this.#signal = new Signal(null);
      initialValue.catch(() => {});
      controller.abort();

      Signal.effect(async (signal) => {
        this.#signal.value = await this.#effect(signal);
      });
      return;
    }

    this.#signal = new Signal(initialValue);

    Signal.effect((signal) => {
      this.#signal.value = this.#effect(signal) as T;
    });
  }

  get name() {
    return this.#signal.name;
  }

  set name(name) {
    this.#signal.name = name;
  }

  get value() {
    return this.#signal.value;
  }
}

type Promisable<T> = T | Promise<T>;

window.Signal = Signal;
window.Computed = Computed;

declare global {
  interface Window {
    Signal: typeof Signal;
    Computed: typeof Computed;
  }
}
