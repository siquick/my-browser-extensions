declare module "turndown" {
  export default class TurndownService {
    constructor(options?: {
      headingStyle?: "setext" | "atx";
      hr?: string;
      bulletListMarker?: "-" | "+" | "*";
      codeBlockStyle?: "indented" | "fenced";
      fence?: "```" | "~~~";
      emDelimiter?: "_" | "*";
      strongDelimiter?: "__" | "**";
      linkStyle?: "inlined" | "referenced";
    });
    addRule(key: string, rule: Rule): this;
    keep(filter: Filter): this;
    remove(filter: Filter): this;
    use(plugin: Plugin): this;
    turndown(html: string | Node): string;
  }

  type Plugin = (service: TurndownService) => void;
  type Filter = string | string[] | ((node: Node, options: any) => boolean);

  interface Rule {
    filter: Filter;
    replacement: (content: string, node: Node, options: any) => string;
  }
}

declare module "turndown-plugin-gfm" {
  import TurndownService from "turndown";
  export function gfm(service: TurndownService): void;
  export function tables(service: TurndownService): void;
  export function strikethrough(service: TurndownService): void;
}

declare module "node-html-parser" {
  export function parse(html: string, options?: any): HTMLElement;

  export class Node {
    readonly nodeType: number;
    readonly childNodes: Node[];
    readonly text: string;
    readonly textContent: string;
    readonly innerHTML: string;
    readonly outerHTML: string;
    parentNode: Node | null;

    remove(): void;
    toString(): string;
  }

  export class HTMLElement extends Node {
    readonly tagName: string;
    readonly attributes: { [key: string]: string };
    readonly classNames: string[];
    readonly classList: {
      add: (className: string) => void;
      contains: (className: string) => boolean;
      remove: (className: string) => void;
      toString: () => string;
    };
    readonly id: string;
    readonly className: string;

    getAttribute(name: string): string | null;
    hasAttribute(name: string): boolean;
    removeAttribute(name: string): void;
    setAttribute(name: string, value: string): void;
    querySelector(selector: string): HTMLElement | null;
    querySelectorAll(selector: string): HTMLElement[];
    appendChild(node: Node): void;
    insertBefore(node: Node, referenceNode: Node): void;
    removeChild(node: Node): void;
    clone(): HTMLElement;
  }
}

// Add ConversionOptions interface
export interface ConversionOptions {
  /**
   * Maximum length of the converted markdown content
   */
  maxContentLength?: number;

  /**
   * Whether to preserve metadata from the HTML
   */
  preserveMetadata?: boolean;

  /**
   * Whether to clean up the HTML before conversion
   */
  cleanupHtml?: boolean;

  /**
   * Whether to fix relative URLs in the markdown
   */
  fixRelativeUrls?: boolean;
}
