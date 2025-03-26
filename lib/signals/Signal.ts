import Effect from "./Effect";

export default class Signal<T = any> {
  static #BATCHING = false;
  static #BATCHED_QUEUE = new Set<() => void>();

  static oncreate?: (signal: Signal) => void;
  static ontrack?: (signal: Signal) => void;
  static ondispose?: (signal: Signal) => void;
  ondispose?: () => void;
  ontrack?: () => void;

  #value: T;
  #subscribers = new Set<() => void>();
  #disposed = false;

  constructor(initialValue: T) {
    this.#value = initialValue;
    Signal.oncreate?.(this);
  }

  get value() {
    if (this.#disposed) throw new Error("Signal has been disposed");
    this.#track();
    return this.#value;
  }

  set value(newValue: T) {
    if (this.#disposed) throw new Error("Signal has been disposed");
    if (this.#value === newValue) return;
    this.#value = newValue;
    this.#trigger();
  }

  peek() {
    if (this.#disposed) throw new Error("Signal has been disposed");
    return this.#value;
  }

  subscribe(subscriber: () => void) {
    if (this.#disposed) throw new Error("Signal has been disposed");
    this.#subscribers.add(subscriber);
    return () => this.unsubscribe(subscriber);
  }

  unsubscribe(subscriber: () => void) {
    this.#subscribers.delete(subscriber);
  }

  #track() {
    Signal.ontrack?.(this);
    this.ontrack?.();
    if (!Effect.ACTIVE_EFFECT) return;
    Effect.ACTIVE_EFFECT.addDependency(this);
  }

  #trigger() {
    for (const subscriber of this.#subscribers) {
      if (Signal.#BATCHING) Signal.#BATCHED_QUEUE.add(subscriber);
      else subscriber();
    }
  }

  dispose() {
    this.#subscribers.clear();
    this.#disposed = true;
    Signal.ondispose?.(this);
    this.ondispose?.();
  }

  static batch(cb: () => void) {
    this.startBatch();
    try {
      cb();
    } finally {
      this.endBatch();
    }
  }

  static startBatch() {
    this.#BATCHING = true;
    this.#BATCHED_QUEUE.clear();
  }

  static endBatch() {
    this.#BATCHING = false;
    for (const cb of this.#BATCHED_QUEUE) {
      cb();
    }
    this.#BATCHED_QUEUE.clear();
  }
}
