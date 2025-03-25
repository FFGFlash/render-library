import { ComputedSignal, Signal } from "lib/signals";

type Primitive = string | number | boolean | null | undefined;
export type Children =
  | VirtualNode
  | Signal<Children>
  | ComputedSignal<Children>
  | Primitive
  | Children[];

export interface VirtualNode {
  type: string | ((props: any) => Children);
  props: Record<string, any> | null;
  children: Children;
}

export type FunctionComponent<T extends Record<any, any> = any> = (
  props: T
) => Children;

/**
 * Creates a virtual node
 * @param type The type of the node
 * @param props The properties of the node
 * @param children Child nodes
 * @returns A virtual node
 */
export function createNode<T extends Record<any, any>>(
  type: string | FunctionComponent<T>,
  props: T | null = null,
  ...children: Children[]
): VirtualNode {
  return { type, props, children: children.flat() };
}

const EffectsMap = new WeakMap<Node, Set<() => void>>();

/**
 * Renders a virtual node to the DOM
 * @param root The root element to render to
 * @param node The virtual node to render
 */
export function render(root: HTMLElement, node: VirtualNode) {
  function mount(node: Children, parent: Node): Node {
    if (Array.isArray(node)) {
      const fragment = document.createDocumentFragment();
      node.forEach((child) => fragment.appendChild(mount(child, fragment)));
      return fragment;
    }

    if (
      typeof node === "string" ||
      typeof node === "number" ||
      typeof node === "boolean"
    ) {
      return document.createTextNode(node.toString());
    }

    if (node == null) {
      return document.createComment("empty");
    }

    if (node instanceof Signal || node instanceof ComputedSignal) {
      const placeholder = document.createTextNode("");

      let prevChild: Node = placeholder;
      Signal.effect(() => {
        const newNode = mount(node.value, parent);
        parent.replaceChild(newNode, prevChild);
        prevChild.nodeValue = "";
        prevChild = newNode;
        return () => cleanupNode(newNode);
      });

      return placeholder;
    }

    if (typeof node.type === "function") {
      const componentEffects = new Set<() => void>();
      const prevComponentEffects = Signal.activeComponentEffects;
      Signal.activeComponentEffects = componentEffects;
      try {
        const child = mount(node.type(node.props ?? {}), parent);
        EffectsMap.set(child, componentEffects);
        return child;
      } finally {
        Signal.activeComponentEffects = prevComponentEffects;
      }
    }

    const el = document.createElement(node.type);
    applyProps(el, node.props);
    if (Array.isArray(node.children))
      node.children.forEach((child) => el.appendChild(mount(child, el)));
    else el.appendChild(mount(node.children, el));
    return el;
  }

  const applyProps = (el: HTMLElement, props: Record<string, any> | null) => {
    if (props == null) return;
    for (let [key, value] of Object.entries(props)) {
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else {
        if (key === "className") key = "class";
        else if (key === "htmlFor") key = "for";
        el.setAttribute(key, String(value));
      }
    }
  };

  const cleanupNode = (node: Node) => {
    const effects = EffectsMap.get(node);
    if (effects) {
      effects.forEach((effect) => Signal.stopEffect(effect));
      EffectsMap.delete(node);
    }
    node.childNodes.forEach(cleanupNode);
  };

  cleanupNode(root);
  root.replaceChildren(mount(node, root));
}
