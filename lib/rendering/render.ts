import { Effect, Signal } from "lib/signals";
import { FunctionComponentNode, VirtualNode } from "./createNode";

const RenderEffects = new WeakMap<Node, Effect>();
const EffectMap = new WeakMap<Node, Set<Effect>>();
const SignalMap = new WeakMap<Node, Set<Signal>>();

let UpdateFrame: number | null = null;
const UpdateQueue = new Set<() => void>();

function update(fn: () => void) {
  UpdateQueue.add(fn);
  if (UpdateFrame != null) return;
  UpdateFrame = requestAnimationFrame(() => {
    UpdateFrame = null;
    for (const fn of UpdateQueue) fn();
    UpdateQueue.clear();
  });
}

function mount(node: VirtualNode | VirtualNode[], parent: Node): Node {
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

  if (node instanceof Signal) {
    let prevNode: Node;
    const effect = new Effect(() => {
      const nextNode = mount(node.value, parent);

      if (!prevNode) {
        prevNode = nextNode;
        return () => cleanupNode(nextNode);
      }

      if (nextNode.nodeType === 3 && prevNode.nodeType === 3) {
        update(() => {
          prevNode.textContent = nextNode.textContent;
        });
      } else {
        update(() => {
          if (prevNode instanceof DocumentFragment) {
            parent.textContent = "";
            parent.appendChild(nextNode);
          } else {
            parent.replaceChild(nextNode, prevNode);
          }
          prevNode = nextNode;
          RenderEffects.set(nextNode, effect);
        });
      }

      return () => cleanupNode(nextNode);
    });
    RenderEffects.set(prevNode!, effect);
    return prevNode!;
  }

  if (typeof node.type === "function") {
    return mountFunctionComponent(node as FunctionComponentNode, parent);
  }

  const el = document.createElement(node.type);
  applyProps(el, node.props);
  if (Array.isArray(node.children))
    node.children.forEach((child) => el.appendChild(mount(child, el)));
  else el.appendChild(mount(node.children, el));
  return el;
}

function mountFunctionComponent(node: FunctionComponentNode, parent: Node) {
  const effects = new Set<Effect>();
  const signals = new Set<Signal>();
  const prevCreateEffect = Effect.oncreate;
  Effect.oncreate = (effect) => {
    effects.add(effect);
    effect.ondispose = () => effects.delete(effect);
  };
  const prevCreateSignal = Signal.oncreate;
  Signal.oncreate = (signal) => {
    signals.add(signal);
    signal.ondispose = () => signals.delete(signal);
  };

  try {
    const child = mount(node.type(node.props ?? {}), parent);
    EffectMap.set(child, effects);
    SignalMap.set(child, signals);
    return child;
  } finally {
    Effect.oncreate = prevCreateEffect;
    Signal.oncreate = prevCreateSignal;
  }
}

function applyProps(
  el: HTMLElement,
  newProps: Record<string, any> | null,
  oldProps?: Record<string, any> | null
) {
  if (newProps == null) return;

  if (oldProps) {
    for (const key in oldProps) {
      if (key in newProps) continue;
      el.removeAttribute(key);
    }
  }

  for (const [key, value] of Object.entries(newProps)) {
    if (oldProps && oldProps[key] === value) continue;
    if (key.startsWith("on")) {
      const type = key.slice(2).toLowerCase();
      if (oldProps && oldProps[key] != null)
        el.removeEventListener(type, oldProps[key]);
      el.addEventListener(type, value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (typeof value === "boolean") {
      if (value) {
        el.setAttribute(key, "");
      } else {
        el.removeAttribute(key);
      }
    } else {
      el.setAttribute(key, value);
    }
  }
}

function cleanupNode(node: Node) {
  EffectMap.get(node)?.forEach((effect) => effect.dispose());
  EffectMap.delete(node);
  SignalMap.get(node)?.forEach((signal) => signal.dispose());
  SignalMap.delete(node);
  RenderEffects.get(node)?.dispose();
  RenderEffects.delete(node);
  node.childNodes.forEach(cleanupNode);
}

export default function render(root: Node, node: VirtualNode | VirtualNode[]) {
  cleanupNode(root);
  root.appendChild(mount(node, root));
}
