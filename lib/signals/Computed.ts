import Effect from "./Effect";
import Signal from "./Signal";

export default class Computed<T = any> extends Signal<T> {
  #effect: Effect;

  constructor(computeFn: () => T) {
    super(computeFn());
    this.#effect = new Effect(() => {
      super.value = computeFn();
    });
  }

  override get value() {
    return super.value;
  }

  override dispose() {
    this.#effect.dispose();
    super.dispose();
  }
}
