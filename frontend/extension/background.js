// The base URL of your running frontend application
const APP_URL = "http://localhost:5174";

// This function is injected into the webpage to perform the content extraction.
function getSelectionAsMarkdown() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return "";
    }

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const container = document.createElement('div');
    container.appendChild(fragment);

    /**
     * Recursively traverses DOM nodes and converts them to a Markdown string.
     * @param {Node} node - The DOM node to convert.
     * @returns {string} The resulting Markdown text.
     */
    function convertNodeToMarkdown(node) {
        // Handle different node types
        switch (node.nodeName.toLowerCase()) {
            case '#text':
                // Preserve whitespace within code blocks, otherwise clean it up.
                if (node.parentNode.nodeName.toLowerCase() === 'pre' || node.parentNode.nodeName.toLowerCase() === 'code') {
                    return node.nodeValue;
                }
                return node.nodeValue.replace(/\s+/g, ' ');

            case 'b':
            case 'strong':
                return `**${convertChildrenToMarkdown(node)}**`;

            case 'i':
            case 'em':
                return `*${convertChildrenToMarkdown(node)}*`;

            case 'a':
                return `[${convertChildrenToMarkdown(node)}](${node.href})`;

            case 'code':
                // Inline code is formatted with backticks. Block code is handled by the 'pre' case.
                return node.closest('pre') ? convertChildrenToMarkdown(node) : `\`${convertChildrenToMarkdown(node)}\``;
            
            case 'pre':
                // Detect language from class names (e.g., class="language-javascript")
                const codeNode = node.querySelector('code');
                const lang = codeNode ? (codeNode.className.match(/language-(\w+)/)?.[1] || '') : '';
                return `\n\`\`\`${lang}\n${convertChildrenToMarkdown(node)}\n\`\`\`\n`;

            case 'h1': return `\n# ${convertChildrenToMarkdown(node)}\n`;
            case 'h2': return `\n## ${convertChildrenToMarkdown(node)}\n`;
            case 'h3': return `\n### ${convertChildrenToMarkdown(node)}\n`;
            case 'h4': return `\n#### ${convertChildrenToMarkdown(node)}\n`;
            case 'h5': return `\n##### ${convertChildrenToMarkdown(node)}\n`;
            case 'h6': return `\n###### ${convertChildrenToMarkdown(node)}\n`;

            case 'li':
                 // Determine prefix based on parent list type (ordered or unordered)
                const prefix = node.closest('ol') ? '1. ' : '- ';
                return `\n${prefix}${convertChildrenToMarkdown(node)}`;
            
            case 'ul':
            case 'ol':
                return `\n${convertChildrenToMarkdown(node)}\n`;

            case 'blockquote':
                // Prepend each line of the blockquote with '>'
                const quoteContent = convertChildrenToMarkdown(node).trim();
                return `\n> ${quoteContent.replace(/\n/g, '\n> ')}\n`;

            case 'p':
            case 'div':
                return `\n${convertChildrenToMarkdown(node)}\n`;

            case 'br':
                return '\n';

            default:
                // For other tags (like <span>), just process their children.
                return convertChildrenToMarkdown(node);
        }
    }

    /**
     * Helper function to process all child nodes of a given parent.
     * @param {Node} parentNode - The parent DOM node.
     * @returns {string} The concatenated Markdown of all children.
     */
    function convertChildrenToMarkdown(parentNode) {
        let innerMarkdown = '';
        for (const child of parentNode.childNodes) {
            innerMarkdown += convertNodeToMarkdown(child);
        }
        return innerMarkdown;
    }

    let markdownContent = convertChildrenToMarkdown(container).trim();

    // Final cleanup to ensure clean spacing between block elements.
    markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n');

    return markdownContent;
}


// Create a context menu item when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "dev2ndbrain-clip",
    title: "Save to Dev2ndBrain",
    contexts: ["selection"] // This menu item will only appear when text is selected
  });
});

// Listen for clicks on our context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "dev2ndbrain-clip") {
    // Inject the script into the active tab to get the selection as Markdown
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getSelectionAsMarkdown,
    }, (injectionResults) => {
      // Handle any errors during script injection
      if (chrome.runtime.lastError || !injectionResults || injectionResults.length === 0) {
        console.error('Script injection failed:', chrome.runtime.lastError?.message || "No results returned.");
        // As a fallback, use the plain text selection
        const fallbackContent = info.selectionText || "";
        if (fallbackContent) {
            const clipUrl = new URL(`${APP_URL}/clip`);
            clipUrl.searchParams.append("title", tab.title || "Clipped Note");
            clipUrl.searchParams.append("content", fallbackContent);
            clipUrl.searchParams.append("source", tab.url || "");
            chrome.tabs.create({ url: clipUrl.href });
        }
        return;
      }

      const markdownContent = injectionResults[0].result;

      if (markdownContent) {
        const clipUrl = new URL(`${APP_URL}/clip`);
        clipUrl.searchParams.append("title", tab.title || "Clipped Note");
        clipUrl.searchParams.append("content", markdownContent);
        clipUrl.searchParams.append("source", tab.url || "");
        chrome.tabs.create({ url: clipUrl.href });
      }
    });
  }
});