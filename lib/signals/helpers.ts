import Computed from "./Computed";
import Effect from "./Effect";
import Signal from "./Signal";

export function computed<T>(computeFn: () => T) {
  return new Computed(computeFn);
}

export function signal<T>(initialValue: T): Signal<T>;
export function signal<T = undefined>(): Signal<T | undefined>;
export function signal<T>(initialValue?: T): Signal<T | undefined> {
  return new Signal(initialValue);
}

export function effect(fn: () => void) {
  return new Effect(fn);
}

export function batch(cb: () => void) {
  return Signal.batch(cb);
}
