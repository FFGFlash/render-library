import ComputedSignal from "./ComputedSignal";
import Signal from "./Signal";

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
 * @param signals The signals to watch for changes (This is automatically detected and doesn't override discovered signals)
 */
export function effect(
  effect: (signal: AbortSignal) => Promisable<void | (() => void)>,
  signals?: Signal[]
) {
  return Signal.effect(effect, signals);
}

/**
 * Creates a new computed signal, which is derived from other signals.
 * @param effect The effect to run
 * @returns A computed signal
 */
export function computed<T>(effect: (signal?: AbortSignal) => Promisable<T>) {
  return new ComputedSignal(effect);
}

/**
 * Batches multiple signal updates into a single effect run.
 * @param effect The effect to run
 */
export function batch(effect: () => void) {
  Signal.batch(effect);
}
