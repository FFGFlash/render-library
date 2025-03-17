import TaskLock from "../utility/TaskLock";

/**
 * A signal that can be used to store and update values.
 * @template TValue The type of the signal's value
 */
export default class Signal<TValue = any> {
  static #dependencies = new Map<Signal, Set<() => void>>();
  static #activeEffect?: () => void;
  static #cleanupQueue = new Map<() => void, () => void>();
  static #abortQueue = new Map<() => void, AbortController>();

  // Batching
  static #batching = false;
  static #effectQueue = new Set<() => void>();

  static #effectLock = new TaskLock();

  name;
  #value: TValue;
  #dependents = new Set<() => void>();

  /**
   * Creates a new signal with the given value
   * @param value The initial value of the signal
   * @param name The name of the signal (For debugging purposes)
   */
  constructor(value: TValue, name?: string) {
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

  /**
   * The current value of the signal
   */
  get value() {
    if (Signal.#activeEffect && !this.#dependents.has(Signal.#activeEffect)) {
      const effect = Signal.#activeEffect;
      this.#dependents.add(effect);
    }
    return this.#value;
  }

  set value(value: TValue) {
    if (this.#value === value) return;
    this.#value = value;
    this.#queueNotification();
  }

  /**
   * Used to peek at the current value of the signal without subscribing to it.
   * @returns The current value of the signal
   * @example
   * ```ts
   * const a = signal(3);
   * const b = signal(4);
   *
   * effect(() => {
   *   console.log(a.peek() + b.value); // Logs 7, without peek it would log 8 then 9
   * });
   *
   * a.value = 4; // Does not trigger the effect
   * b.value = 5; // Triggers the effect
   * ```
   */
  peek() {
    return this.#value;
  }

  /**
   * Creates a new side effect that detects signals used within it and re-runs when they change.
   * @param effect The effect to run
   * @example
   * ```ts
   * const a = signal(3);
   *
   * effect(() => {
   *   console.log(a.value); // Logs 3 before the update and 4 after
   * });
   *
   * a.value = 4;
   * ```
   */
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

  /**
   * Used to batch signal updates into a single effect run.
   * @param effect The effect to run
   * @example
   * ```ts
   * const a = signal(3);
   * const b = signal(2);
   *
   * effect(() => {
   *   console.log(a.value + b.value); // Logs 5 before the update and 9 after, without batching it would log 5, 6 then 9.
   * });
   *
   * batch(() => {
   *   a.value = 4;
   *   b.value = 5;
   * });
   * ```
   */
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
