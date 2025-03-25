import { createNode, FunctionComponent } from "lib/rendering/node";
import { computed, signal } from "lib/signals";

export default function lazy<T extends FunctionComponent>(
  fn: () => Promisable<T | { default: T }>
) {
  return () => {
    const component = signal<FunctionComponent | null>(null);

    (async () => {
      const module = await fn();
      const componentValue = "default" in module ? module.default : module;
      component.value = componentValue;
    })();

    return computed(() => {
      return component.value ? createNode(component.value) : null;
    });
  };
}
