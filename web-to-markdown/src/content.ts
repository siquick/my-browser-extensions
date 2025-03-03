import { MarkdownConverter } from "./utils/converter";
import type { ConversionOptions } from "./types";

// Function to create and show a popup notification
function showNotification() {
  // Remove any existing notification
  const existingNotification = document.getElementById("purepage-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification container
  const notification = document.createElement("div");
  notification.id = "purepage-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #333;
    transition: opacity 0.3s ease-in-out;
  `;

  // Create notification content
  const title = document.createElement("h3");
  title.textContent = "Webpage converted";
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  `;

  const message = document.createElement("p");
  message.textContent = "We've copied it to your clipboard";
  message.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 14px;
    line-height: 1.4;
  `;

  const footer = document.createElement("div");
  footer.style.cssText = `
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  const poweredBy = document.createElement("span");
  poweredBy.textContent = "Powered by ";

  const link = document.createElement("a");
  link.href = "https://www.purepage.io";
  link.textContent = "Purepage";
  link.target = "_blank";
  link.style.cssText = `
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
  `;
  link.addEventListener("mouseover", () => {
    link.style.textDecoration = "underline";
  });
  link.addEventListener("mouseout", () => {
    link.style.textDecoration = "none";
  });

  poweredBy.appendChild(link);
  footer.appendChild(poweredBy);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 0;
    line-height: 1;
  `;
  closeButton.addEventListener("click", () => {
    document.body.removeChild(notification);
  });

  // Assemble notification
  notification.appendChild(title);
  notification.appendChild(message);
  notification.appendChild(footer);
  notification.appendChild(closeButton);

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
}

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

    // Set conversion options
    const conversionOptions: ConversionOptions = {
      cleanupHtml: true,
      fixRelativeUrls: true,
      preserveMetadata: true,
    };

    // Convert to Markdown using the enhanced converter
    const converter = new MarkdownConverter();
    const markdown = converter.convert(contentToConvert, conversionOptions);

    // Add the source URL at the start of the markdown
    const sourceUrl = window.location.href;
    const markdownWithSource = `Source: ${sourceUrl}\n\n${markdown}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(markdownWithSource);

    // Show the notification popup
    showNotification();

    // Show success notification in extension icon
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
