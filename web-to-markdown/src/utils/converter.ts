import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { parse, HTMLElement as ParsedHTMLElement } from "node-html-parser";
import type { ConversionOptions } from "../types";

// Extend the Node interface to handle both DOM and parsed nodes
interface ExtendedNode extends Node {
  tagName?: string;
  getAttribute?: (name: string) => string | null;
  className?: string | { toString(): string };
  querySelector?: (selector: string) => HTMLElement | null;
  querySelectorAll?: (selector: string) => NodeListOf<HTMLElement> | any[];
}

export class MarkdownConverter {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      strongDelimiter: "**",
      emDelimiter: "*",
      hr: "---",
    });

    // Add GFM (GitHub Flavored Markdown) plugin
    this.turndownService.use(gfm);

    // Setup rules in priority order
    this.setupRules();
  }

  /**
   * Setup conversion rules in priority order
   */
  private setupRules(): void {
    // Content extraction rules
    this.addContentExtractionRules();

    // Structure rules
    this.addStructureRules();

    // Inline element rules
    this.addInlineRules();
  }

  /**
   * Safely get class name as a string
   */
  private getClassNameString(node: ExtendedNode): string {
    if (!node.className) return "";

    // Handle different types of className property
    if (typeof node.className === "string") {
      return node.className.toLowerCase();
    } else if (typeof node.className === "object" && node.className.toString) {
      return node.className.toString().toLowerCase();
    }

    return "";
  }

  /**
   * Add rules for content extraction and cleanup
   */
  private addContentExtractionRules(): void {
    // Remove navigation and menu elements
    this.turndownService.addRule("navigation", {
      filter: (node: Node): boolean => {
        const extNode = node as ExtendedNode;
        if (!extNode) return false;

        const tagName = extNode.tagName?.toLowerCase();
        if (!tagName) return false;

        const isNav = tagName === "nav";
        const hasNavRole = extNode.getAttribute?.("role") === "navigation";

        // Safely get class name
        const className = this.getClassNameString(extNode);
        const hasNavClass = className.includes("nav") || className.includes("menu");

        return isNav || hasNavRole || hasNavClass;
      },
      replacement: () => "",
    });

    // Remove ads and non-content elements
    this.turndownService.addRule("non-content", {
      filter: (node: Node): boolean => {
        const extNode = node as ExtendedNode;
        if (!extNode) return false;

        const tagName = extNode.tagName?.toLowerCase();
        if (!tagName) return false;

        const nonContentClasses = [
          "ad",
          "ads",
          "advertisement",
          "banner",
          "cookie",
          "popup",
          "sidebar",
          "widget",
          "footer",
          "comment",
          "social",
        ];

        // Safely get class name
        const className = this.getClassNameString(extNode);
        return nonContentClasses.some((cls) => className.includes(cls));
      },
      replacement: () => "",
    });
  }

  /**
   * Add rules for structure elements like articles, sections, etc.
   */
  private addStructureRules(): void {
    // Article structure
    this.turndownService.addRule("article", {
      filter: "article",
      replacement: (content: string, node: Node) => {
        const extNode = node as ExtendedNode;
        if (!extNode) return content;

        const titleElement = extNode.querySelector?.("h1, h2, h3");
        const title = titleElement?.textContent?.trim();

        let markdown = "";
        if (title) markdown += `## ${title}\n\n`;
        markdown += content;

        return markdown;
      },
    });

    // Table formatting
    this.turndownService.addRule("table", {
      filter: "table",
      replacement: (content: string) => {
        // Let the GFM plugin handle tables, but ensure proper spacing
        return `\n\n${content}\n\n`;
      },
    });
  }

  /**
   * Add rules for inline elements like links, images, etc.
   */
  private addInlineRules(): void {
    // Links with absolute URLs
    this.turndownService.addRule("absoluteUrls", {
      filter: ["a", "img"],
      replacement: (content: string, node: Node) => {
        if (node instanceof HTMLAnchorElement) {
          const href = node.href;
          const title = node.title ? ` "${node.title}"` : "";
          return `[${content}](${href}${title})`;
        }

        if (node instanceof HTMLImageElement) {
          const src = node.src;
          const alt = node.alt || "";
          const title = node.title ? ` "${node.title}"` : "";
          return `![${alt}](${src}${title})`;
        }

        return content;
      },
    });

    // Figure with caption
    this.turndownService.addRule("figure", {
      filter: "figure",
      replacement: (content: string, node: Node) => {
        const extNode = node as ExtendedNode;
        if (!extNode) return content;

        const img = extNode.querySelector?.("img");
        const caption = extNode.querySelector?.("figcaption")?.textContent?.trim();

        if (!img) return content;

        let markdown = content;
        if (caption) markdown += `\n*${caption}*`;

        return markdown;
      },
    });
  }

  /**
   * Pre-process HTML before conversion
   */
  private preprocessHTML(html: string): string {
    try {
      // Clean up any malformed or unwanted patterns
      html = html
        // Remove template variables
        .replace(/{{[^}]+}}/g, "")
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, "");

      // Parse HTML
      const root = parse(html);

      // Remove unwanted elements
      const removeSelectors = [
        "script",
        "style",
        "iframe",
        "noscript",
        ".ad",
        ".advertisement",
        ".cookie-notice",
        ".newsletter-form",
        '[aria-hidden="true"]',
        "[hidden]",
        "form",
      ];

      removeSelectors.forEach((selector) => {
        try {
          root.querySelectorAll(selector).forEach((el: ParsedHTMLElement) => el.remove());
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Extract main content if possible
      const mainContent =
        root.querySelector("main") ||
        root.querySelector('[role="main"]') ||
        root.querySelector("article") ||
        root.querySelector(".content") ||
        root;

      return mainContent.innerHTML;
    } catch (error) {
      console.error("HTML preprocessing error:", error);
      return html;
    }
  }

  /**
   * Post-process Markdown after conversion
   */
  private postprocessMarkdown(markdown: string, options: ConversionOptions = {}): string {
    let processed = markdown
      // Fix heading spacing
      .replace(/^(#{1,6}\s.*)/gm, "\n$1\n")
      // Fix list spacing
      .replace(/^([*-]\s.*)/gm, "$1\n")
      // Remove empty links
      .replace(/\[]\([^)]*\)/g, "")
      // Remove empty images
      .replace(/!\[]\([^)]*\)/g, "")
      // Fix relative image URLs if requested
      .replace(/!\[([^\]]*)\]\(\/\//g, "![$1](https://");

    // Fix relative URLs if requested
    if (options.fixRelativeUrls) {
      processed = processed.replace(/!\[([^\]]*)\]\(\/([^)]+)\)/g, "![$1](https://$2)");
    }

    // Remove duplicate newlines
    processed = processed
      .replace(/\n{3,}/g, "\n\n")
      // Clean up whitespace
      .replace(/^[ \t]+|[ \t]+$/gm, "")
      // Trim leading/trailing whitespace
      .trim();

    // Truncate if needed
    if (options.maxContentLength && options.maxContentLength > 0) {
      processed = processed.slice(0, options.maxContentLength);
    }

    return processed;
  }

  /**
   * Convert HTML to Markdown
   */
  convert(html: string | Node, options: ConversionOptions = {}): string {
    try {
      // Pre-process if it's a string and cleanup is requested
      let processedHtml: string | Node = html;
      if (typeof html === "string" && options.cleanupHtml !== false) {
        processedHtml = this.preprocessHTML(html);
      }

      // Convert to Markdown
      let markdown = this.turndownService.turndown(processedHtml as string | HTMLElement);

      // Post-process the Markdown
      markdown = this.postprocessMarkdown(markdown, options);

      return markdown;
    } catch (error) {
      console.error("Conversion error:", error);
      throw new Error("Failed to convert HTML to Markdown");
    }
  }
}
