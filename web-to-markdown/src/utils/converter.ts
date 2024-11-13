import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

export class MarkdownConverter {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      strongDelimiter: '**',
      emDelimiter: '*'
    });

    // Add GFM (GitHub Flavored Markdown) plugin
    this.turndownService.use(gfm);

    // Custom rules
    this.turndownService.addRule('absoluteUrls', {
      filter: ['a', 'img'],
      replacement: (content, node) => {
        if (node instanceof HTMLAnchorElement) {
          const href = node.href;
          return `[${content}](${href})`;
        }
        if (node instanceof HTMLImageElement) {
          const src = node.src;
          const alt = node.alt || '';
          return `![${alt}](${src})`;
        }
        return content;
      }
    });
  }

  convert(html: string | Node): string {
    try {
      return this.turndownService.turndown(html);
    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error('Failed to convert HTML to Markdown');
    }
  }
}
