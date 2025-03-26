declare interface AriaAttributes {
  role?: string;
  "aria-activedescendant"?: string;
  "aria-atomic"?: boolean;
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-braillelabel"?: string;
  "aria-brailleroledescription"?: string;
  "aria-busy"?: boolean;
  "aria-checked"?: boolean | "mixed";
  "aria-colcount"?: number;
  "aria-colindex"?: number;
  "aria-colindextext"?: string;
  "aria-colspan"?: number;
  "aria-controls"?: string;
  "aria-current"?: string | boolean;
  "aria-describedby"?: string;
  "aria-description"?: string;
  "aria-details"?: string;
  "aria-disabled"?: boolean;
  /**
   * @deprecated
   */
  "aria-dropeffect"?: string;
  "aria-errormessage"?: string;
  "aria-expanded"?: boolean;
  "aria-flowto"?: string;
  /**
   * @deprecated
   */
  "aria-grabbed"?: boolean;
  "aria-haspopup"?: boolean;
  "aria-hidden"?: boolean;
  "aria-invalid"?: boolean | "grammar" | "spelling";
  "aria-keyshortcuts"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-level"?: number;
  "aria-live"?: "off" | "assertive" | "polite";
  "aria-modal"?: boolean;
  "aria-multiline"?: boolean;
  "aria-multiselectable"?: boolean;
  "aria-orientation"?: "horizontal" | "vertical";
  "aria-owns"?: string;
  "aria-placeholder"?: string;
  "aria-posinset"?: number;
  "aria-pressed"?: boolean | "mixed";
  "aria-readonly"?: boolean;
  "aria-relevant"?: "additions" | "removals" | "text" | "all";
  "aria-required"?: boolean;
  "aria-roledescription"?: string;
  "aria-rowcount"?: number;
  "aria-rowindex"?: number;
  "aria-rowindextext"?: string;
  "aria-rowspan"?: number;
  "aria-selected"?: boolean;
  "aria-setsize"?: number;
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  "aria-valuemax"?: number;
  "aria-valuemin"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
}

declare interface HTMLAttributes extends AriaAttributes {
  id?: string;
  class?: string;
  style?: string;
  title?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  hidden?: boolean;
  tabindex?: number;
  draggable?: boolean;
  spellcheck?: boolean;
  role?: string;
  [attr: string]: any; // Allow additional attributes
}

declare interface HTMLButtonAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  formaction?: string;
  formenctype?: string;
  formmethod?: string;
  formnovalidate?: boolean;
  formtarget?: string;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string;
}

declare interface HTMLInputAttributes extends HTMLAttributes {
  type?: string;
  value?: string | number;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  minlength?: number;
  pattern?: string;
  size?: number;
  checked?: boolean;
  multiple?: boolean;
  autocomplete?: string;
  autofocus?: boolean;
  list?: string;
  step?: number;
  form?: string;
  formaction?: string;
}

declare interface HTMLAnchorAttributes extends HTMLAttributes {
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
  download?: string;
  hreflang?: string;
  type?: string;
}

declare interface HTMLImageAttributes extends HTMLAttributes {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
}

declare interface HTMLTextAreaAttributes extends HTMLAttributes {
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  minlength?: number;
  rows?: number;
  cols?: number;
  wrap?: "soft" | "hard";
}

declare interface HTMLSelectAttributes extends HTMLAttributes {
  name?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: number;
}

declare interface HTMLFormAttributes extends HTMLAttributes {
  action?: string;
  method?: "get" | "post";
  enctype?: string;
  autocomplete?: "on" | "off";
  novalidate?: boolean;
  target?: "_self" | "_blank" | "_parent" | "_top";
}

declare interface HTMLHeadingAttributes extends HTMLAttributes {
  align?: "left" | "right" | "center" | "justify";
}
declare interface HTMLTableAttributes extends HTMLAttributes {
  border?: number;
  cellpadding?: number;
  cellspacing?: number;
  width?: string | number;
}
declare interface HTMLTableCellAttributes extends HTMLAttributes {
  colspan?: number;
  rowspan?: number;
  headers?: string;
}
declare interface HTMLMetaAttributes extends HTMLAttributes {
  charset?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
}
declare interface HTMLLinkAttributes extends HTMLAttributes {
  href?: string;
  rel?: string;
  type?: string;
  sizes?: string;
}
declare interface HTMLScriptAttributes extends HTMLAttributes {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}
declare interface HTMLStyleAttributes extends HTMLAttributes {
  type?: string;
  media?: string;
}
declare interface HTMLAudioAttributes extends HTMLAttributes {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}
declare interface HTMLVideoAttributes extends HTMLAudioAttributes {
  width?: number;
  height?: number;
  poster?: string;
}
