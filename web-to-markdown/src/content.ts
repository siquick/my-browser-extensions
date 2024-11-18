import { MarkdownConverter } from "./utils/converter";

async function convertAndCopy() {
  try {
    // Get the entire document body first
    const bodyContent = document.querySelector("body");

    if (!bodyContent) {
      throw new Error("No main content found on page");
    }

    // Create a deep clone of the body content
    const contentClone = bodyContent.cloneNode(true) as HTMLElement;

    // Common selectors for non-content elements to remove
    const selectorsToRemove = [
      "header",
      "footer",
      "nav",
      ".navigation",
      ".menu",
      ".sidebar",
      ".ads",
      ".advertisement",
      ".social-share",
      ".comments",
      ".related-posts",
      "#comments",
      ".cookie-banner",
      ".popup",
      ".modal",
      '[role="banner"]',
      '[role="navigation"]',
      '[role="complementary"]',
      ".newsletter-signup",
      ".subscription-form",
    ];

    // Remove unwanted elements
    selectorsToRemove.forEach((selector) => {
      const elements = contentClone.querySelectorAll(selector);
      elements.forEach((element) => element.remove());
    });

    // Remove hidden elements
    const hiddenElements = contentClone.querySelectorAll(
      '[hidden], [style*="display: none"], [style*="display:none"], [aria-hidden="true"]'
    );
    hiddenElements.forEach((element) => element.remove());

    // Remove all script tags
    const scripts = contentClone.getElementsByTagName("script");
    while (scripts.length > 0) {
      scripts[0].remove();
    }

    // Remove all style tags
    const styles = contentClone.getElementsByTagName("style");
    while (styles.length > 0) {
      styles[0].remove();
    }

    // Remove all form elements
    const forms = contentClone.getElementsByTagName("form");
    while (forms.length > 0) {
      forms[0].remove();
    }

    // Remove inline styles and event handlers from remaining elements
    const allElements = contentClone.getElementsByTagName("*");
    for (const element of allElements) {
      element.removeAttribute("style");
      element.removeAttribute("onclick");
      element.removeAttribute("onmouseover");
      element.removeAttribute("onmouseout");
    }

    // Try to identify and preserve the main content area
    const mainContent = contentClone.querySelector('main, [role="main"], #main, .main-content, article, .post-content');
    const contentToConvert = mainContent || contentClone;

    // Convert to Markdown
    const converter = new MarkdownConverter();
    const markdown = converter.convert(contentToConvert);

    // Enhanced markdown cleanup
    const cleanedMarkdown = markdown
      // Remove any remaining encoded HTML/SVG
      .replace(/(%3C|\{%)[^}]*(%3E|\}%)/g, "")
      // Remove CSS/styling blocks
      .replace(/#mermaid-\d+[\s\S]*?}/g, "")
      .replace(/\.formkit-form[\s\S]*?}/g, "")
      // Remove any remaining HTML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove data-attributes
      .replace(/data-[a-zA-Z-]+="[^"]*"/g, "")
      // Remove empty links
      .replace(/\[\]\([^)]*\)/g, "")
      // Remove multiple blank lines (keep max 2)
      .replace(/\n{3,}/g, "\n\n")
      // Remove lines containing only whitespace
      .replace(/^\s+$/gm, "")
      // Clean up multiple spaces
      .replace(/[ \t]+/g, " ")
      // Trim leading/trailing whitespace
      .trim();

    // Add the source URL at the start of the markdown
    const sourceUrl = window.location.href;
    const markdownWithSource = `Source: ${sourceUrl}\n\n${cleanedMarkdown}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(markdownWithSource);

    // Generate filename from URL
    const urlEncoded = encodeURIComponent(sourceUrl)
      .replace(/%/g, "") // Remove percent signs
      .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric chars with underscore
      .substring(0, 100); // Limit length to avoid too long filenames
    const filename = `${urlEncoded}.txt`;

    // Create and trigger download
    const blob = new Blob([markdownWithSource], { type: "text/plain" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = filename;

    // Append link to body, click it, then remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    window.URL.revokeObjectURL(downloadUrl);

    // Show success notification
    chrome.runtime.sendMessage({ type: "CONVERSION_SUCCESS" });
  } catch (error) {
    console.error("Conversion failed:", error);
    chrome.runtime.sendMessage({
      type: "CONVERSION_ERROR",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

// Add a small delay to ensure the page is fully loaded
setTimeout(convertAndCopy, 500);

// Optional: Add listener for manual trigger
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "MANUAL_CONVERT") {
    convertAndCopy();
  }
});
