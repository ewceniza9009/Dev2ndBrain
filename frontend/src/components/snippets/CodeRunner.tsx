// This component no longer renders a React component but is a utility function.

/**
 * Creates a new browser window and runs the provided HTML or JavaScript code within it.
 * @param code The HTML/JS code from the snippet.
 * @param language The language of the code (e.g., 'html', 'javascript').
 */
export const openCodeRunnerWindow = (code: string, language: string) => {
  // We'll construct a full HTML document to run the code
  const createDocument = () => {
    if (language === 'html') {
      return code;
    }
    // If it's just JavaScript, wrap it in a basic HTML structure with a script tag
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Snippet Runner</title>
        </head>
        <body>
          <script>${code}</script>
        </body>
      </html>
    `;
  };

  // Open a new window
  const newWindow = window.open('about:blank', '_blank');

  if (newWindow) {
    // Write the new document content to the new window
    newWindow.document.write(createDocument());
    // Close the document to prevent further writes
    newWindow.document.close();
  } else {
    // Handle cases where a popup blocker prevents the new window from opening
    alert("Please disable your browser's popup blocker to run the code in a new window.");
  }
};