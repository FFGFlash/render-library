import TaskLock from "lib/utility/TaskLock";

/**
 * A signal that can be used to store and update values.
 * @template TValue The type of the signal's value
 */
export default class Signal<TValue = any> {
  static #dependencies = new Map<Signal, Set<() => void>>();
  static #activeEffect?: () => void;
  static #cleanupQueue = new Map<() => void, () => void>();
  static #abortQueue = new Map<() => void, AbortController>();
  static activeComponentEffects?: Set<() => void>;

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
   * Subscribes to the signal, running the effect whenever the signal changes.
   * @param effect The effect to subscribe to the signal
   * @returns A function to unsubscribe the effect
   */
  subscribe(effect: () => void) {
    if (this.#dependents.has(effect))
      return this.unsubscribe.bind(this, effect);
    this.#dependents.add(effect);
    if (!Signal.#dependencies.has(this))
      Signal.#dependencies.set(this, new Set());
    Signal.#dependencies.get(this)!.add(effect);
    return this.unsubscribe.bind(this, effect);
  }

  /**
   * Unsubscribes the effect from the signal.
   * @param effect The effect to unsubscribe
   */
  unsubscribe(effect: () => void) {
    if (!this.#dependents.has(effect)) return;
    this.#dependents.delete(effect);
    Signal.#dependencies.get(this)!.delete(effect);
    if (Signal.#dependencies.get(this)!.size === 0) {
      Signal.#dependencies.delete(this);
    }
  }

  /**
   * Unsubscribes all effects from the signal.
   */
  unsubscribeAll() {
    this.#dependents.forEach((effect) => this.unsubscribe(effect));
  }

  /**
   * The current value of the signal
   */
  get value() {
    if (Signal.#activeEffect) this.subscribe(Signal.#activeEffect);
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
    effect: (signal: AbortSignal) => Promisable<void | (() => void)>,
    signals?: Signal[]
  ) {
    const wrappedEffect = () => {
      if (this.#abortQueue.has(wrappedEffect)) {
        this.#abortQueue.get(wrappedEffect)!.abort();
        this.#abortQueue.delete(wrappedEffect);
      }

      return this.#effectLock.task(async () => {
        const controller = new AbortController();

        this.#abortQueue.set(wrappedEffect, controller);

        let cleanup: void | (() => void) = undefined;

        this.#activeEffect = wrappedEffect;

        signals?.forEach((signal) => signal.subscribe(wrappedEffect));

        try {
          this.#cleanupEffect(wrappedEffect);
        } catch (e) {
          console.warn("Effect cleanup failed", e);
        }

        try {
          const res = effect(controller.signal);

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
    this.activeComponentEffects?.add(wrappedEffect);
  }

  static stopEffect(effect: () => void) {
    this.#abortQueue.get(effect)?.abort();
    this.#cleanupEffect(effect);
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
