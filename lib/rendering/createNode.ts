import { Signal } from "lib/signals";

export default function createNode<T extends keyof AttributeMap>(
  type: T,
  props: AttributeMap[T],
  children?: VirtualNode | VirtualNode[]
): ComponentNode;
export default function createNode(
  type: string,
  attributes: HTMLAttributes,
  children?: VirtualNode | VirtualNode[]
): ComponentNode;
export default function createNode<T extends Record<string, any> = {}>(
  type: FunctionComponent<T>,
  props: T,
  children?: VirtualNode | VirtualNode[]
): ComponentNode;
export default function createNode<T extends Record<string, any> = {}>(
  type: string | FunctionComponent<T>,
  props: T,
  children: VirtualNode | VirtualNode[] = null
) {
  return {
    type,
    props,
    children,
  };
}

export type VirtualNode =
  | Signal
  | ComponentNode
  | FunctionComponentNode
  | string
  | number
  | boolean
  | null;

export type FunctionComponentNode = {
  type: FunctionComponent;
  props: Record<string, any>;
  children: VirtualNode | VirtualNode[];
};

export type ComponentNode = {
  type: string;
  props: Record<string, any>;
  children: VirtualNode | VirtualNode[];
};

export type FunctionComponent<T extends Record<string, any> = {}> = (
  props: T
) => VirtualNode | VirtualNode[];

export interface AttributeMap {
  button: HTMLButtonAttributes;
  input: HTMLInputAttributes;
  a: HTMLAnchorAttributes;
  img: HTMLImageAttributes;
  textarea: HTMLTextAreaAttributes;
  select: HTMLSelectAttributes;
  form: HTMLFormAttributes;
  h1: HTMLHeadingAttributes;
  h2: HTMLHeadingAttributes;
  h3: HTMLHeadingAttributes;
  h4: HTMLHeadingAttributes;
  h5: HTMLHeadingAttributes;
  h6: HTMLHeadingAttributes;
  table: HTMLTableAttributes;
  td: HTMLTableCellAttributes;
  meta: HTMLMetaAttributes;
  link: HTMLLinkAttributes;
  script: HTMLScriptAttributes;
  style: HTMLStyleAttributes;
  audio: HTMLAudioAttributes;
  video: HTMLVideoAttributes;
}
