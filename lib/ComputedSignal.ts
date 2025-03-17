import Signal from "./Signal";

/**
 * A computed signal, which is derived from other signals.
 * @template TValue The type of the computed signal's value
 */
export default class ComputedSignal<TValue> {
  #effect: (signal: AbortSignal) => Promisable<TValue>;
  #signal: Signal<TValue | null>;

  /**
   * Creates a new computed signal
   * @param effect The effect to run
   */
  constructor(effect: (signal?: AbortSignal) => Promisable<TValue>) {
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
      this.#signal.value = this.#effect(signal) as TValue;
    });
  }

  /**
   * The name of the computed signal
   */
  get name() {
    return this.#signal.name;
  }

  set name(name) {
    this.#signal.name = name;
  }

  /**
   * The current value of the computed signal
   */
  get value() {
    return this.#signal.value;
  }

  /**
   * Peek at the current value of the computed signal without subscribing to it.
   * @returns The current value of the computed signal
   * @see Signal.peek
   */
  peek() {
    return this.#signal.peek();
  }
}
