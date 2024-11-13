import { MarkdownConverter } from "./utils/converter";

async function convertAndCopy() {
  try {
    const mainContent = document.querySelector("main");

    if (!mainContent) {
      throw new Error("No main content found on page");
    }

    // Remove all script tags before conversion
    const contentClone = mainContent.cloneNode(true) as HTMLElement;

    // Remove scripts
    const scripts = contentClone.getElementsByTagName("script");
    while (scripts.length > 0) {
      scripts[0].parentNode?.removeChild(scripts[0]);
    }

    // Remove forms and widgets
    const forms = contentClone.getElementsByTagName("form");
    while (forms.length > 0) {
      forms[0].parentNode?.removeChild(forms[0]);
    }

    // Remove style tags
    const styles = contentClone.getElementsByTagName("style");
    while (styles.length > 0) {
      styles[0].parentNode?.removeChild(styles[0]);
    }

    // Convert to Markdown
    const converter = new MarkdownConverter();
    const markdown = converter.convert(contentClone);

    // Clean up markdown content
    const cleanedMarkdown = markdown
      // Remove any remaining encoded HTML/SVG
      .replace(/(%3C|\{%)[^}]*(%3E|\}%)/g, "")
      // Remove CSS/styling blocks
      .replace(/#mermaid-\d+[\s\S]*?}/g, "")
      .replace(/\.formkit-form[\s\S]*?}/g, "")
      // Remove multiple blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Copy to clipboard
    await navigator.clipboard.writeText(cleanedMarkdown);

    // Show success notification
    chrome.runtime.sendMessage({ type: "CONVERSION_SUCCESS" });
  } catch (error) {
    console.error("Conversion failed:", error);
    chrome.runtime.sendMessage({ type: "CONVERSION_ERROR", error: error.message });
  }
}

// Execute conversion when content script is injected
convertAndCopy();
