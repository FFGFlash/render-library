import { Computed, effect, Signal } from "./signal";

type Primitive = string | number | boolean | null | undefined;
type Children =
  | VirtualNode
  | Signal<Children>
  | Computed<Children>
  | Primitive
  | Children[];

interface VirtualNode {
  type: string | ((props: any) => Children);
  props: Record<string, any> | null;
  children: Children;
}

export function createNode(
  type: string | ((props: any) => Children),
  props: Record<string, any> | null = null,
  ...children: Children[]
): VirtualNode {
  return { type, props, children: children.flat() };
}

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
    )
      return document.createTextNode(node.toString());
    if (node == null) {
      return document.createComment("empty");
    }
    if (node instanceof Signal || node instanceof Computed) {
      const placeholder = document.createTextNode("");

      let prevChild: Node = placeholder;
      effect(() => {
        const newNode = mount(node.value, parent);
        parent.replaceChild(newNode, prevChild);
        prevChild.nodeValue = "";
        prevChild = newNode;
      });
      return placeholder;
    }
    if (typeof node.type === "function")
      return mount(node.type(node.props ?? {}), parent);

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

  root.replaceChildren(mount(node, root));
}
