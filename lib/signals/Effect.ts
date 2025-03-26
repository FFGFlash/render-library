import Signal from "./Signal";

export default class Effect {
  static #ACTIVE_EFFECT: Effect | null = null;

  static oncreate?: (effect: Effect) => void;
  static ondispose?: (effect: Effect) => void;
  ondispose?: () => void;

  static get ACTIVE_EFFECT() {
    return this.#ACTIVE_EFFECT;
  }

  #dependencies = new Set<Signal>();
  #effectFn;
  #cleanupFn?: (() => void) | void;
  #disposed = false;

  constructor(effectFn: () => (() => void) | void) {
    this.#effectFn = effectFn;
    this.#run = this.#internalRun.bind(this);
    Effect.oncreate?.(this);
    this.#internalRun();
  }

  #run: () => void;
  #internalRun() {
    if (this.#disposed) throw new Error("Signal has been disposed");
    const prevEffect = Effect.#ACTIVE_EFFECT;
    Effect.#ACTIVE_EFFECT = this;
    this.cleanup();
    try {
      this.#cleanupFn = this.#effectFn();
    } finally {
      Effect.#ACTIVE_EFFECT = prevEffect;
    }
  }

  addDependency(signal: Signal) {
    if (this.#disposed) throw new Error("Signal has been disposed");
    this.#dependencies.add(signal);
    signal.subscribe(this.#run);
  }

  cleanup() {
    this.#cleanupFn?.();
    this.#cleanupFn = undefined;
  }

  dispose() {
    this.cleanup();
    for (const dependency of this.#dependencies) {
      dependency.unsubscribe(this.#run);
    }
    this.#dependencies.clear();
    this.#disposed = true;
    Effect.ondispose?.(this);
    this.ondispose?.();
  }
}
