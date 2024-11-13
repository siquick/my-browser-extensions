declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: {
      headingStyle?: 'setext' | 'atx';
      hr?: string;
      bulletListMarker?: '-' | '+' | '*';
      codeBlockStyle?: 'indented' | 'fenced';
      fence?: '```' | '~~~';
      emDelimiter?: '_' | '*';
      strongDelimiter?: '__' | '**';
      linkStyle?: 'inlined' | 'referenced';
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

declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown';
  export function gfm(service: TurndownService): void;
  export function tables(service: TurndownService): void;
  export function strikethrough(service: TurndownService): void;
}
